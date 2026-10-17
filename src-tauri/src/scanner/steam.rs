use super::ScannedGame;
use crate::utils::registry::read_hkcu_string;
use std::fs;
use std::path::PathBuf;

pub fn scan_steam_games() -> Vec<ScannedGame> {
    let mut discovered = Vec::new();
    let Some(steam_path) = read_hkcu_string("Software\\Valve\\Steam", "SteamPath") else {
        return discovered;
    };

    let stats = get_steam_app_stats(&steam_path);

    let vdf_path = PathBuf::from(&steam_path)
        .join("steamapps")
        .join("libraryfolders.vdf");

    let mut library_paths = vec![PathBuf::from(&steam_path)];
    if let Ok(content) = fs::read_to_string(&vdf_path) {
        for line in content.lines() {
            let trimmed = line.trim();
            if trimmed.starts_with("\"path\"") {
                let parts: Vec<&str> = trimmed.split('"').collect();
                if parts.len() >= 4 {
                    let clean_path = parts[3].replace("\\\\", "\\");
                    library_paths.push(PathBuf::from(clean_path));
                }
            }
        }
    }

    for lib in library_paths {
        let steamapps = lib.join("steamapps");
        let Ok(entries) = fs::read_dir(&steamapps) else {
            continue;
        };

        for entry in entries.flatten() {
            let path = entry.path();
            let Some(fname) = path.file_name().and_then(|n| n.to_str()) else {
                continue;
            };

            if fname.starts_with("appmanifest_") && fname.ends_with(".acf") {
                if let Ok(acf) = fs::read_to_string(&path) {
                    let appid = extract_vdf_key(&acf, "appid");
                    let name = extract_vdf_key(&acf, "name");

                    if let (Some(id), Some(title)) = (appid, name) {
                        // Skip Steamworks Common Redistributables
                        if id == "228980" || title.contains("Steamworks Common") {
                            continue;
                        }
                        let game_id = format!("steam-{}", id);
                        if !discovered.iter().any(|g| g.id == game_id) {
                            let (playtime, last_played) = stats
                                .get(&id)
                                .cloned()
                                .unwrap_or((0.0, "Installed".to_string()));

                            discovered.push(ScannedGame {
                                id: game_id,
                                title,
                                platform: "steam".to_string(),
                                launch_uri: format!("steam://rungameid/{}", id),
                                install_path: steamapps.to_string_lossy().to_string(),
                                playtime_hours: Some(playtime),
                                last_played: Some(last_played),
                            });
                        }
                    }
                }
            }
        }
    }

    discovered
}

fn get_steam_app_stats(steam_path: &str) -> std::collections::HashMap<String, (f64, String)> {
    let mut stats = std::collections::HashMap::new();
    let userdata = PathBuf::from(steam_path).join("userdata");
    let Ok(entries) = fs::read_dir(userdata) else {
        return stats;
    };

    for user_entry in entries.flatten() {
        let localconfig_path = user_entry.path().join("config").join("localconfig.vdf");
        if let Ok(content) = fs::read_to_string(&localconfig_path) {
            parse_localconfig_stats(&content, &mut stats);
        }
    }
    stats
}

fn parse_localconfig_stats(
    content: &str,
    stats: &mut std::collections::HashMap<String, (f64, String)>,
) {
    let mut current_appid: Option<String> = None;
    let mut current_playtime: Option<f64> = None;
    let mut current_lastplayed: Option<u64> = None;

    for line in content.lines() {
        let trimmed = line.trim();

        // Check if line starts an app block, like "1091500"
        if trimmed.starts_with('"') && trimmed.ends_with('"') && !trimmed.contains('\t') && !trimmed.contains(' ') {
            let inner = trimmed.trim_matches('"');
            if inner.chars().all(|c| c.is_ascii_digit()) && !inner.is_empty() {
                if let Some(prev_id) = current_appid.take() {
                    let pt = current_playtime.unwrap_or(0.0);
                    let lp = format_last_played(current_lastplayed);
                    stats.insert(prev_id, (pt, lp));
                }
                current_appid = Some(inner.to_string());
                current_playtime = None;
                current_lastplayed = None;
                continue;
            }
        }

        let lower = trimmed.to_lowercase();
        if lower.starts_with("\"playtime\"") {
            let parts: Vec<&str> = trimmed.split('"').collect();
            if parts.len() >= 4 {
                if let Ok(minutes) = parts[3].parse::<f64>() {
                    let hours = (minutes / 60.0 * 10.0).round() / 10.0;
                    current_playtime = Some(hours);
                }
            }
        } else if lower.starts_with("\"lastplayed\"") {
            let parts: Vec<&str> = trimmed.split('"').collect();
            if parts.len() >= 4 {
                if let Ok(ts) = parts[3].parse::<u64>() {
                    current_lastplayed = Some(ts);
                }
            }
        }
    }

    if let Some(prev_id) = current_appid {
        let pt = current_playtime.unwrap_or(0.0);
        let lp = format_last_played(current_lastplayed);
        stats.insert(prev_id, (pt, lp));
    }
}

fn format_last_played(ts: Option<u64>) -> String {
    use std::time::{SystemTime, UNIX_EPOCH};
    let Some(ts) = ts else {
        return "Installed".to_string();
    };
    if ts == 0 {
        return "Installed".to_string();
    }

    let now_ts = match SystemTime::now().duration_since(UNIX_EPOCH) {
        Ok(d) => d.as_secs(),
        Err(_) => return "Recently".to_string(),
    };

    if now_ts < ts {
        return "Recently".to_string();
    }

    let diff = now_ts - ts;
    if diff < 3600 {
        "Just now".to_string()
    } else if diff < 86400 {
        "Today".to_string()
    } else if diff < 172800 {
        "Yesterday".to_string()
    } else if diff < 86400 * 7 {
        format!("{}d ago", diff / 86400)
    } else if diff < 86400 * 30 {
        format!("{}w ago", diff / (86400 * 7))
    } else if diff < 86400 * 365 {
        format!("{}mo ago", diff / (86400 * 30))
    } else {
        format!("{}y ago", diff / (86400 * 365))
    }
}

fn extract_vdf_key(content: &str, key: &str) -> Option<String> {
    let pattern = format!("\"{}\"", key);
    for line in content.lines() {
        let trimmed = line.trim();
        if trimmed.starts_with(&pattern) {
            let parts: Vec<&str> = trimmed.split('"').collect();
            if parts.len() >= 4 {
                return Some(parts[3].to_string());
            }
        }
    }
    None
}