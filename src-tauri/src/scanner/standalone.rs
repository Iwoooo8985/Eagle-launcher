use super::ScannedGame;
use std::collections::HashSet;
use std::path::{Path, PathBuf};

fn format_game_title(folder_name: &str) -> String {
    let mut words = Vec::new();
    for part in folder_name.split(['_', '-', ' ']) {
        let clean = part.trim();
        if clean.is_empty() {
            continue;
        }
        let mut chars = clean.chars();
        if let Some(first) = chars.next() {
            let capitalized = format!("{}{}", first.to_uppercase(), chars.as_str());
            words.push(capitalized);
        }
    }
    if words.is_empty() {
        folder_name.to_string()
    } else {
        words.join(" ")
    }
}

pub fn scan_standalone_games() -> Vec<ScannedGame> {
    let mut discovered = Vec::new();
    let mut seen_uris = HashSet::new();

    // 1. Scan osu! in AppData Local
    if let Ok(local_app_data) = std::env::var("LOCALAPPDATA") {
        let osu_path = PathBuf::from(&local_app_data).join("osu!").join("osu!.exe");
        if osu_path.exists() {
            let uri = osu_path.to_string_lossy().to_string();
            seen_uris.insert(uri.to_lowercase());
            discovered.push(ScannedGame {
                id: "standalone-osu".to_string(),
                title: "osu!".to_string(),
                platform: "standalone".to_string(),
                launch_uri: uri.clone(),
                install_path: osu_path.parent().unwrap_or(&osu_path).to_string_lossy().to_string(),
                playtime_hours: Some(0.0),
                last_played: Some("Installed".to_string()),
            });
        }
    }

    // 2. Scan [Drive]:\Games across all available drive letters
    for drive_letter in b'C'..=b'Z' {
        let drive_char = drive_letter as char;
        let games_root = PathBuf::from(format!("{}:\\Games", drive_char));
        if !games_root.exists() || !games_root.is_dir() {
            continue;
        }

        // We traverse directories up to 4 levels deep to find game folders with .exe
        scan_directory_for_games(&games_root, 0, 4, &mut discovered, &mut seen_uris);
    }

    discovered
}

fn scan_directory_for_games(
    current_dir: &Path,
    current_depth: usize,
    max_depth: usize,
    discovered: &mut Vec<ScannedGame>,
    seen_uris: &mut HashSet<String>,
) {
    if current_depth >= max_depth {
        return;
    }

    let entries = match std::fs::read_dir(current_dir) {
        Ok(e) => e,
        Err(_) => return,
    };

    let mut direct_exe: Option<PathBuf> = None;
    let mut subdirs = Vec::new();

    for entry in entries.flatten() {
        let path = entry.path();
        if path.is_dir() {
            let dirname = path.file_name().and_then(|n| n.to_str()).unwrap_or("");
            if !dirname.starts_with('.') && !dirname.eq_ignore_ascii_case("Engine") && !dirname.eq_ignore_ascii_case("_Redist") {
                subdirs.push(path);
            }
        } else if path.is_file() {
            if let Some(ext) = path.extension() {
                if ext.eq_ignore_ascii_case("exe") {
                    let fname = path
                        .file_name()
                        .and_then(|n| n.to_str())
                        .unwrap_or("")
                        .to_lowercase();

                    let is_game_exe = !fname.contains("unins")
                        && !fname.contains("setup")
                        && !fname.contains("crash")
                        && !fname.contains("redist")
                        && !fname.contains("installer")
                        && !fname.contains("unitycrash")
                        && !fname.contains("dxsetup")
                        && !fname.contains("vc_redist");

                    if is_game_exe && direct_exe.is_none() {
                        direct_exe = Some(path.clone());
                    }
                }
            }
        }
    }

    // If this directory contains a valid game executable and is NOT the root 'Games' folder
    if let Some(exe) = direct_exe {
        let folder_name = current_dir
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("")
            .to_string();

        let uri = exe.to_string_lossy().to_string();
        if !seen_uris.contains(&uri.to_lowercase()) && !folder_name.eq_ignore_ascii_case("Games") && !folder_name.eq_ignore_ascii_case("bin") && !folder_name.eq_ignore_ascii_case("x64") {
            seen_uris.insert(uri.to_lowercase());

            // Determine title
            let title = if folder_name.eq_ignore_ascii_case("Gry") || folder_name.eq_ignore_ascii_case("Hydra") {
                exe.file_stem().and_then(|s| s.to_str()).unwrap_or(&folder_name).to_string()
            } else {
                format_game_title(&folder_name)
            };

            let clean_id = title
                .to_lowercase()
                .chars()
                .filter(|c| c.is_alphanumeric() || *c == '-')
                .collect::<String>();

            discovered.push(ScannedGame {
                id: format!("standalone-{}", clean_id),
                title,
                platform: "standalone".to_string(),
                launch_uri: uri,
                install_path: current_dir.to_string_lossy().to_string(),
                playtime_hours: Some(0.0),
                last_played: Some("Installed".to_string()),
            });
            return;
        }
    }

    // Recurse into subdirectories
    for subdir in subdirs {
        scan_directory_for_games(&subdir, current_depth + 1, max_depth, discovered, seen_uris);
    }
}
