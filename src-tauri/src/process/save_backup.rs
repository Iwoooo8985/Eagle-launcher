use serde::{Deserialize, Serialize};
use std::env;
use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;

#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;

use crate::utils::registry::read_hkcu_string;

#[derive(Serialize, Clone, Debug)]
pub struct CloudDirInfo {
    pub exists: bool,
    pub writable: bool,
    pub path: String,
    pub message: String,
    pub suggested_paths: Vec<String>,
}

#[derive(Serialize, Clone, Debug)]
pub struct BackupResult {
    pub success: bool,
    pub message: String,
    pub game_title: String,
    pub source_save_path: String,
    pub zip_path: String,
    pub file_size_human: String,
    pub timestamp: String,
}

#[derive(Deserialize, Debug)]
pub struct GameBackupRequest {
    pub title: String,
    pub platform: String,
    pub game_id: String,
    pub custom_save_path: Option<String>,
}

fn sanitize_folder_name(name: &str) -> String {
    name.chars()
        .map(|c| match c {
            '/' | '\\' | ':' | '*' | '?' | '"' | '<' | '>' | '|' => '_',
            _ => c,
        })
        .collect::<String>()
        .trim()
        .to_string()
}

fn format_bytes(bytes: u64) -> String {
    const KB: u64 = 1024;
    const MB: u64 = KB * 1024;
    const GB: u64 = MB * 1024;

    if bytes >= GB {
        format!("{:.2} GB", bytes as f64 / GB as f64)
    } else if bytes >= MB {
        format!("{:.1} MB", bytes as f64 / MB as f64)
    } else if bytes >= KB {
        format!("{} KB", bytes / KB)
    } else {
        format!("{} B", bytes)
    }
}

pub fn get_suggested_google_drive_paths() -> Vec<String> {
    let mut candidates = Vec::new();

    // 1. Check G:\ virtual drive (Google Drive for Desktop default)
    let g_drive = PathBuf::from("G:\\My Drive\\EagleSaves");
    if Path::new("G:\\").exists() {
        candidates.push(g_drive.to_string_lossy().to_string());
    }

    // 2. Check other common drive letters (H, I, etc.)
    for drive in ["H:\\", "I:\\", "D:\\Google Drive", "E:\\Google Drive"] {
        if Path::new(drive).exists() {
            candidates.push(format!("{}\\EagleSaves", drive.trim_end_matches('\\')));
        }
    }

    // 3. Check %USERPROFILE%\Google Drive
    if let Ok(userprofile) = env::var("USERPROFILE") {
        let p1 = PathBuf::from(&userprofile).join("Google Drive").join("EagleSaves");
        let p2 = PathBuf::from(&userprofile).join("My Drive").join("EagleSaves");
        candidates.push(p1.to_string_lossy().to_string());
        candidates.push(p2.to_string_lossy().to_string());

        // Local fallback under Documents
        let doc_fallback = PathBuf::from(&userprofile).join("Documents").join("EagleSaves");
        candidates.push(doc_fallback.to_string_lossy().to_string());
    }

    candidates
}

#[tauri::command]
pub fn validate_or_create_cloud_dir(target_dir: String) -> Result<CloudDirInfo, String> {
    let trimmed = target_dir.trim().to_string();
    if trimmed.is_empty() {
        return Ok(CloudDirInfo {
            exists: false,
            writable: false,
            path: String::new(),
            message: "No backup directory specified. Please choose a folder.".to_string(),
            suggested_paths: get_suggested_google_drive_paths(),
        });
    }

    let path = PathBuf::from(&trimmed);

    // Check parent drive accessibility
    if let Some(prefix) = path.components().next() {
        let root = prefix.as_os_str();
        if !Path::new(root).exists() {
            return Ok(CloudDirInfo {
                exists: false,
                writable: false,
                path: trimmed,
                message: format!(
                    "Drive {} is not mounted or not connected. If using Google Drive for Desktop, ensure Google Drive is running, or select a folder on your main drive.",
                    root.to_string_lossy()
                ),
                suggested_paths: get_suggested_google_drive_paths(),
            });
        }
    }

    // Attempt directory creation
    let create_res = fs::create_dir_all(&path);
    if let Err(e) = create_res {
        return Ok(CloudDirInfo {
            exists: false,
            writable: false,
            path: trimmed,
            message: format!("Cannot create folder: {}", e),
            suggested_paths: get_suggested_google_drive_paths(),
        });
    }

    // Test write permission with a temporary marker file
    let test_file = path.join(".eagle_write_test.tmp");
    let writable = match fs::write(&test_file, b"eagle_ok") {
        Ok(_) => {
            let _ = fs::remove_file(&test_file);
            true
        }
        Err(_) => false,
    };

    if !writable {
        return Ok(CloudDirInfo {
            exists: true,
            writable: false,
            path: trimmed,
            message: "Folder exists but write permission was denied.".to_string(),
            suggested_paths: get_suggested_google_drive_paths(),
        });
    }

    Ok(CloudDirInfo {
        exists: true,
        writable: true,
        path: trimmed,
        message: "Google Drive backup folder is connected and ready!".to_string(),
        suggested_paths: get_suggested_google_drive_paths(),
    })
}

#[tauri::command]
pub fn open_folder_in_explorer(path: String) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        let p = Path::new(&path);
        if !p.exists() {
            let _ = fs::create_dir_all(p);
        }

        let mut cmd = Command::new("explorer.exe");
        cmd.creation_flags(0x08000000); // CREATE_NO_WINDOW
        cmd.arg(&path);
        let _ = cmd.spawn();
    }
    Ok(())
}

// -----------------------------------------------------------------------------
// SAVE DETECTION ENGINE (Depth-Aware & Content-Validated)
// -----------------------------------------------------------------------------

pub fn is_blacklisted_folder(name: &str) -> bool {
    let lower = name.to_lowercase();
    matches!(
        lower.as_str(),
        "programs"
            | "microsoft"
            | "windows"
            | "temp"
            | "tmp"
            | "packages"
            | "d3dscache"
            | "shadercache"
            | "crashdumps"
            | "crashes"
            | "logs"
            | "log"
            | "assets"
            | "gui"
            | "cache"
            | "node_modules"
            | "electron"
            | "redlauncher"
            | "cef"
            | "webcache"
            | "steam"
            | "epicgameslauncher"
            | "ubisoft game launcher"
            | "origin"
            | "ea desktop"
            | "battlenet"
            | "discord"
            | "spotify"
            | "my music"
            | "my pictures"
            | "my videos"
    )
}

pub fn is_save_like_file(name: &str) -> bool {
    let lower = name.to_lowercase();

    // Explicit save extensions
    let save_exts = [
        ".sav", ".save", ".dat", ".bin", ".json", ".sl2", ".srm", ".state",
        ".rsv", ".profile", ".xml", ".db", ".sqlite", ".sii", ".plr", ".wld", ".twld",
    ];
    for ext in &save_exts {
        if lower.ends_with(ext) {
            if lower == "package.json" || lower == "manifest.json" {
                return false;
            }
            return true;
        }
    }

    // Name patterns
    let save_patterns = [
        "autosave", "manualsave", "quicksave", "savegame", "savedgame",
        "slot", "checkpoint", "save_", "save-", "sav.", "sav_"
    ];
    for pat in &save_patterns {
        if lower.contains(pat) {
            return true;
        }
    }

    false
}

pub fn is_save_like_subdir(name: &str) -> bool {
    let lower = name.to_lowercase();
    let sub_patterns = [
        "savegames", "saves", "saved", "profiles", "remote", "worlds", "players",
        "gamesaves", "saved games", "save data", "savedata",
    ];
    for pat in &sub_patterns {
        if lower == *pat {
            return true;
        }
    }
    if lower.starts_with("autosave") || lower.starts_with("manualsave") || lower.starts_with("slot") {
        return true;
    }
    false
}

pub fn has_valid_save_content(path: &Path) -> bool {
    if !path.is_dir() {
        return false;
    }

    let Ok(entries) = fs::read_dir(path) else {
        return false;
    };

    let mut total_files = 0;
    let mut save_indicators = 0;
    let mut only_remotecache = true;
    let mut only_media_or_binaries = true;

    for entry in entries.flatten() {
        let p = entry.path();
        let fname = p.file_name().and_then(|n| n.to_str()).unwrap_or("");
        let lower = fname.to_lowercase();

        if is_blacklisted_folder(&lower) {
            continue;
        }

        if p.is_dir() {
            if is_save_like_subdir(&lower) {
                return true;
            }
            // Check 1 level down
            if let Ok(sub_entries) = fs::read_dir(&p) {
                for sub in sub_entries.flatten() {
                    let sub_p = sub.path();
                    let sub_name = sub_p.file_name().and_then(|n| n.to_str()).unwrap_or("");
                    if is_save_like_file(sub_name) {
                        return true;
                    }
                }
            }
        } else if p.is_file() {
            total_files += 1;
            if lower != "remotecache.vdf" {
                only_remotecache = false;
            }

            let is_media_or_binary = lower.ends_with(".png")
                || lower.ends_with(".jpg")
                || lower.ends_with(".jpeg")
                || lower.ends_with(".gif")
                || lower.ends_with(".webp")
                || lower.ends_with(".ico")
                || lower.ends_with(".html")
                || lower.ends_with(".css")
                || lower.ends_with(".js")
                || lower.ends_with(".exe")
                || lower.ends_with(".dll");

            if !is_media_or_binary {
                only_media_or_binaries = false;
            }

            if is_save_like_file(&lower) {
                save_indicators += 1;
            }
        }
    }

    if only_remotecache || (total_files > 0 && only_media_or_binaries) {
        return false;
    }

    save_indicators > 0 || (total_files > 0 && !only_media_or_binaries)
}

pub struct TitleMatcher {
    clean_title: String,
    compact_title: String,
    primary_title_part: String,
    acronym: String,
    significant_words: Vec<String>,
}

impl TitleMatcher {
    pub fn new(title: &str) -> Self {
        let lower = title.to_lowercase();

        // Primary part before subtitle colon or dash
        let first_segment = lower.split(&[':', '-'][..]).next().unwrap_or(&lower);
        let primary_compact: String = first_segment.chars().filter(|c| c.is_alphanumeric()).collect();

        let clean: String = lower
            .chars()
            .map(|c| if c.is_alphanumeric() || c == ' ' { c } else { ' ' })
            .collect();
        let clean_collapsed = clean.split_whitespace().collect::<Vec<_>>().join(" ");
        let compact: String = clean.chars().filter(|c| c.is_alphanumeric()).collect();

        let stop_words = [
            "the", "game", "edition", "remastered", "deluxe", "definitive",
            "director", "directors", "cut", "anniversary", "goty", "collection",
            "standard", "ultimate", "bundle", "wild", "hunt", "reloaded",
        ];

        let mut words = Vec::new();
        let mut acronym_chars = Vec::new();

        for w in clean_collapsed.split_whitespace() {
            if !stop_words.contains(&w) {
                if let Some(ch) = w.chars().next() {
                    acronym_chars.push(ch);
                }
                if w.len() >= 4 || ["gta", "ark", "sim", "rdr", "cod"].contains(&w) {
                    words.push(w.to_string());
                }
            }
        }

        let acronym: String = acronym_chars.into_iter().collect();

        Self {
            clean_title: clean_collapsed,
            compact_title: compact,
            primary_title_part: primary_compact,
            acronym,
            significant_words: words,
        }
    }

    pub fn matches_folder_name(&self, folder_name: &str) -> bool {
        let folder_lower = folder_name.to_lowercase();
        let folder_clean: String = folder_lower
            .chars()
            .map(|c| if c.is_alphanumeric() || c == ' ' { c } else { ' ' })
            .collect();
        let folder_collapsed = folder_clean.split_whitespace().collect::<Vec<_>>().join(" ");
        let folder_compact: String = folder_clean.chars().filter(|c| c.is_alphanumeric()).collect();

        // 1. Exact match
        if !self.clean_title.is_empty() && folder_collapsed == self.clean_title {
            return true;
        }
        if !self.compact_title.is_empty() && folder_compact == self.compact_title {
            return true;
        }

        // 2. Match primary title part before subtitle
        if self.primary_title_part.len() >= 4 && folder_compact == self.primary_title_part {
            return true;
        }

        // 3. Acronym match (e.g. "Grand Theft Auto V" -> acronym "gtav", matches "GTA V" / "gtav")
        if self.acronym.len() >= 3 && (folder_compact == self.acronym || folder_compact.starts_with(&self.acronym)) {
            return true;
        }

        // 4. Substring match
        if !self.compact_title.is_empty() && folder_compact.len() >= 5 {
            if self.compact_title.contains(&folder_compact) || folder_compact.contains(&self.compact_title) {
                return true;
            }
        }

        // 5. Significant keyword matching (len >= 5)
        for w in &self.significant_words {
            if w.len() >= 5 && (folder_compact.contains(w) || folder_collapsed.contains(w)) {
                return true;
            }
        }

        false
    }
}

pub fn search_root_directory(
    root: &Path,
    matcher: &TitleMatcher,
    current_depth: usize,
    max_depth: usize,
) -> Option<PathBuf> {
    if current_depth > max_depth || !root.exists() || !root.is_dir() {
        return None;
    }

    let Ok(entries) = fs::read_dir(root) else {
        return None;
    };

    let mut candidate_subdirs = Vec::new();

    for entry in entries.flatten() {
        let p = entry.path();
        if !p.is_dir() {
            continue;
        }

        let fname = match p.file_name().and_then(|n| n.to_str()) {
            Some(n) => n,
            None => continue,
        };

        if is_blacklisted_folder(fname) {
            continue;
        }

        // Check if this directory matches the game title
        if matcher.matches_folder_name(fname) {
            // Unreal Engine pattern: Saved/SaveGames
            let ue_savegames = p.join("Saved").join("SaveGames");
            if ue_savegames.exists() && has_valid_save_content(&ue_savegames) {
                return Some(ue_savegames);
            }

            let ue_saved = p.join("Saved");
            if ue_saved.exists() && has_valid_save_content(&ue_saved) {
                return Some(ue_saved);
            }

            // Standard game save validation
            if has_valid_save_content(&p) {
                return Some(p);
            }

            // Some games store saves in a slot/profile directory inside
            if let Ok(inner_entries) = fs::read_dir(&p) {
                for inner in inner_entries.flatten() {
                    let ip = inner.path();
                    if ip.is_dir() && has_valid_save_content(&ip) {
                        return Some(p);
                    }
                }
            }
        }

        candidate_subdirs.push(p);
    }

    // Recurse into subdirectories (e.g., Studio/Publisher folders like "CD Projekt Red", "Quantic Dream", "Rockstar Games")
    if current_depth < max_depth {
        for sub in candidate_subdirs {
            if let Some(found) = search_root_directory(&sub, matcher, current_depth + 1, max_depth) {
                return Some(found);
            }
        }
    }

    None
}

#[tauri::command]
pub fn detect_game_save_path(title: String, platform: String, game_id: String) -> Result<Option<String>, String> {
    let matcher = TitleMatcher::new(&title);
    let lower_title = title.to_lowercase();

    // 1. Special Known Titles
    // Minecraft
    if lower_title.contains("minecraft") {
        if let Ok(appdata) = env::var("APPDATA") {
            let mc_saves = PathBuf::from(appdata).join(".minecraft").join("saves");
            if mc_saves.exists() {
                return Ok(Some(mc_saves.to_string_lossy().to_string()));
            }
        }
    }

    // RetroArch
    if ["snes", "ps2", "gba", "switch"].contains(&platform.as_str()) || lower_title.contains("retroarch") {
        if let Ok(appdata) = env::var("APPDATA") {
            let ra_saves = PathBuf::from(appdata).join("RetroArch").join("saves");
            if ra_saves.exists() {
                return Ok(Some(ra_saves.to_string_lossy().to_string()));
            }
        }
    }

    // FromSoftware games in APPDATA (Elden Ring, Dark Souls, Sekiro, Armored Core)
    if lower_title.contains("elden ring") || lower_title.contains("dark souls") || lower_title.contains("sekiro") || lower_title.contains("armored core") {
        if let Ok(appdata) = env::var("APPDATA") {
            let appdata_path = PathBuf::from(&appdata);
            if let Some(found) = search_root_directory(&appdata_path, &matcher, 1, 2) {
                return Ok(Some(found.to_string_lossy().to_string()));
            }
        }
    }

    // 2. Priority 1: Windows Dedicated "Saved Games" (Depth 3)
    // Covers:
    // - Saved Games\CD Projekt Red\Cyberpunk 2077
    // - Saved Games\Quantic Dream\Detroit Become Human
    // - Saved Games\Respawn\Apex
    // - Saved Games\id Software\...
    if let Ok(userprofile) = env::var("USERPROFILE") {
        let saved_games = PathBuf::from(&userprofile).join("Saved Games");
        if let Some(found) = search_root_directory(&saved_games, &matcher, 1, 3) {
            return Ok(Some(found.to_string_lossy().to_string()));
        }

        // 3. Priority 2: "Documents\My Games" (Depth 2)
        // Covers Terraria, Mafia Definitive Edition, STEEP, Borderlands, Skyrim, etc.
        let my_games = PathBuf::from(&userprofile).join("Documents").join("My Games");
        if let Some(found) = search_root_directory(&my_games, &matcher, 1, 2) {
            return Ok(Some(found.to_string_lossy().to_string()));
        }

        // 4. Priority 3: "Documents" root and Studio folders (Depth 2)
        // Covers Rockstar Games\GTA V, Euro Truck Simulator 2, Dying Light, The Witcher 3, etc.
        let documents = PathBuf::from(&userprofile).join("Documents");
        if let Some(found) = search_root_directory(&documents, &matcher, 1, 2) {
            return Ok(Some(found.to_string_lossy().to_string()));
        }
    }

    // 5. Priority 4: Steam Userdata (ONLY if actual save files exist)
    if platform == "steam" {
        let raw_id = game_id.strip_prefix("steam-").unwrap_or(&game_id);
        if let Some(steam_path) = read_hkcu_string("Software\\Valve\\Steam", "SteamPath") {
            let userdata_dir = PathBuf::from(&steam_path).join("userdata");
            if let Ok(user_entries) = fs::read_dir(&userdata_dir) {
                for u in user_entries.flatten() {
                    let app_save = u.path().join(raw_id);
                    if app_save.exists() {
                        let remote = app_save.join("remote");
                        if remote.exists() && has_valid_save_content(&remote) {
                            return Ok(Some(remote.to_string_lossy().to_string()));
                        }
                        let win_saved = app_save.join("ac").join("WinSavedGames");
                        if win_saved.exists() && has_valid_save_content(&win_saved) {
                            return Ok(Some(win_saved.to_string_lossy().to_string()));
                        }
                        // Only return app_save if it contains actual save files, NEVER if it's just remotecache.vdf
                        if has_valid_save_content(&app_save) {
                            return Ok(Some(app_save.to_string_lossy().to_string()));
                        }
                    }
                }
            }
        }
    }

    // 6. Priority 5: AppData\LocalLow (Unity Games, Depth 2)
    // Covers Valheim, Hollow Knight, Subnautica, etc.
    if let Ok(local_appdata) = env::var("LOCALAPPDATA") {
        let local_path = PathBuf::from(&local_appdata);
        if let Some(parent) = local_path.parent() {
            let local_low = parent.join("LocalLow");
            if let Some(found) = search_root_directory(&local_low, &matcher, 1, 2) {
                return Ok(Some(found.to_string_lossy().to_string()));
            }
        }
    }

    // 7. Priority 6: Unreal Engine and games in %LOCALAPPDATA% (Depth 2)
    if let Ok(local_appdata) = env::var("LOCALAPPDATA") {
        let local_path = PathBuf::from(&local_appdata);
        if let Some(found) = search_root_directory(&local_path, &matcher, 1, 2) {
            return Ok(Some(found.to_string_lossy().to_string()));
        }
    }

    // 8. Priority 7: %APPDATA% Roaming (Depth 2)
    if let Ok(appdata) = env::var("APPDATA") {
        let roaming_path = PathBuf::from(&appdata);
        if let Some(found) = search_root_directory(&roaming_path, &matcher, 1, 2) {
            return Ok(Some(found.to_string_lossy().to_string()));
        }
    }

    Ok(None)
}

#[tauri::command]
pub fn backup_single_game_save(
    title: String,
    platform: String,
    game_id: String,
    custom_save_path: Option<String>,
    target_cloud_dir: String,
) -> Result<BackupResult, String> {
    if target_cloud_dir.trim().is_empty() {
        return Err("No Google Drive backup path configured. Please choose a folder in Settings.".to_string());
    }

    let mut resolved_save_path = None;

    // Validate custom path if provided
    if let Some(custom) = custom_save_path {
        let trimmed = custom.trim().to_string();
        if !trimmed.is_empty() {
            let p = PathBuf::from(&trimmed);
            // Verify if custom path exists and has valid save content
            // If it only contains remotecache.vdf or is a blacklisted folder, ignore it and re-detect
            if p.exists() && has_valid_save_content(&p) {
                resolved_save_path = Some(trimmed);
            }
        }
    }

    let save_dir_str = match resolved_save_path {
        Some(valid_custom) => valid_custom,
        None => match detect_game_save_path(title.clone(), platform.clone(), game_id.clone())? {
            Some(detected) => detected,
            None => {
                return Err(format!(
                    "Could not automatically detect save folder for '{}'. Please click the folder icon to select your save folder.",
                    title
                ));
            }
        },
    };

    let save_dir = PathBuf::from(&save_dir_str);
    if !save_dir.exists() {
        return Err(format!(
            "Save directory '{}' does not exist on disk.",
            save_dir_str
        ));
    }

    // Ensure cloud destination folder exists
    let clean_title = sanitize_folder_name(&title);
    let cloud_game_folder = PathBuf::from(&target_cloud_dir).join(&clean_title);
    fs::create_dir_all(&cloud_game_folder).map_err(|e| {
        format!(
            "Failed to create Google Drive folder '{}': {}",
            cloud_game_folder.to_string_lossy(),
            e
        )
    })?;

    // Create timestamp
    let now = chrono_or_ps_timestamp();
    let zip_filename = format!("save_{}.zip", now);
    let target_zip_path = cloud_game_folder.join(&zip_filename);
    let latest_zip_path = cloud_game_folder.join("save_latest.zip");

    // PowerShell Compress-Archive execution
    #[cfg(target_os = "windows")]
    {
        let src_escaped = save_dir.to_string_lossy().replace('\'', "''");
        let dest_escaped = target_zip_path.to_string_lossy().replace('\'', "''");
        let latest_escaped = latest_zip_path.to_string_lossy().replace('\'', "''");

        let ps_cmd = format!(
            r#"$ProgressPreference = 'SilentlyContinue';
            if (Test-Path -LiteralPath '{0}') {{
                $items = Get-ChildItem -LiteralPath '{0}' | ForEach-Object {{ $_.FullName }};
                if ($items) {{
                    Compress-Archive -Path $items -DestinationPath '{1}' -Force;
                    Copy-Item -LiteralPath '{1}' -Destination '{2}' -Force;
                }}
            }}"#,
            src_escaped, dest_escaped, latest_escaped
        );

        let mut cmd = Command::new("powershell");
        cmd.creation_flags(0x08000000); // CREATE_NO_WINDOW
        cmd.args(["-NoProfile", "-Command", &ps_cmd]);

        let output = cmd.output().map_err(|e| format!("PowerShell execution failed: {}", e))?;
        if !output.status.success() {
            let err_msg = String::from_utf8_lossy(&output.stderr);
            if !err_msg.trim().is_empty() {
                return Err(format!("Archive compression failed: {}", err_msg.trim()));
            }
        }
    }

    if !target_zip_path.exists() {
        return Err("Archive was not created. The save folder might be empty or locked by the game.".to_string());
    }

    let file_size = fs::metadata(&target_zip_path).map(|m| m.len()).unwrap_or(0);
    let size_human = format_bytes(file_size);

    Ok(BackupResult {
        success: true,
        message: format!("Backed up to Google Drive ({})", size_human),
        game_title: title,
        source_save_path: save_dir_str,
        zip_path: target_zip_path.to_string_lossy().to_string(),
        file_size_human: size_human,
        timestamp: now,
    })
}

#[tauri::command]
pub fn backup_all_games_saves(
    games: Vec<GameBackupRequest>,
    target_cloud_dir: String,
) -> Result<Vec<BackupResult>, String> {
    let mut results = Vec::new();
    for game in games {
        match backup_single_game_save(
            game.title.clone(),
            game.platform.clone(),
            game.game_id.clone(),
            game.custom_save_path,
            target_cloud_dir.clone(),
        ) {
            Ok(res) => results.push(res),
            Err(e) => results.push(BackupResult {
                success: false,
                message: e,
                game_title: game.title,
                source_save_path: String::new(),
                zip_path: String::new(),
                file_size_human: "0 B".to_string(),
                timestamp: chrono_or_ps_timestamp(),
            }),
        }
    }
    Ok(results)
}

fn chrono_or_ps_timestamp() -> String {
    #[cfg(target_os = "windows")]
    {
        let mut cmd = Command::new("powershell");
        cmd.creation_flags(0x08000000);
        cmd.args(["-NoProfile", "-Command", "Get-Date -Format 'yyyy-MM-dd_HH-mm-ss'"]);
        if let Ok(output) = cmd.output() {
            let res = String::from_utf8_lossy(&output.stdout).trim().to_string();
            if !res.is_empty() {
                return res;
            }
        }
    }
    "backup".to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_title_matching() {
        let cp = TitleMatcher::new("Cyberpunk 2077");
        assert!(cp.matches_folder_name("Cyberpunk 2077"));
        assert!(cp.matches_folder_name("Cyberpunk2077"));
        assert!(!cp.matches_folder_name("CD Projekt Red"));
        assert!(!cp.matches_folder_name("REDlauncher"));

        let detroit = TitleMatcher::new("Detroit: Become Human");
        assert!(detroit.matches_folder_name("Detroit Become Human"));
        assert!(detroit.matches_folder_name("DetroitBecomeHuman"));
        assert!(!detroit.matches_folder_name("Quantic Dream"));

        let witcher = TitleMatcher::new("The Witcher 3: Wild Hunt");
        assert!(witcher.matches_folder_name("The Witcher 3"));
        assert!(witcher.matches_folder_name("Witcher 3"));

        let terraria = TitleMatcher::new("Terraria");
        assert!(terraria.matches_folder_name("Terraria"));

        let gta = TitleMatcher::new("Grand Theft Auto V");
        assert!(gta.matches_folder_name("GTA V"));
        assert!(gta.matches_folder_name("Grand Theft Auto V"));
    }

    #[test]
    fn test_blacklisted_folders() {
        assert!(is_blacklisted_folder("Programs"));
        assert!(is_blacklisted_folder("REDlauncher"));
        assert!(is_blacklisted_folder("CrashDumps"));
        assert!(is_blacklisted_folder("assets"));
        assert!(!is_blacklisted_folder("CD Projekt Red"));
        assert!(!is_blacklisted_folder("Cyberpunk 2077"));
    }

    #[test]
    fn test_save_like_files() {
        assert!(is_save_like_file("AutoSave-0"));
        assert!(is_save_like_file("ManualSave-1"));
        assert!(is_save_like_file("sav.dat"));
        assert!(is_save_like_file("userSettings.json"));
        assert!(is_save_like_file("player.plr"));
        assert!(is_save_like_file("profile.sii"));
        assert!(!is_save_like_file("remotecache.vdf"));
        assert!(!is_save_like_file("banner.png"));
    }

    #[test]
    fn test_simulated_user_save_layout() {
        let temp_dir = env::temp_dir().join(format!("eagle_test_{}", std::process::id()));
        let _ = fs::remove_dir_all(&temp_dir);

        // 1. Setup real Cyberpunk 2077 structure in Saved Games
        let cp_save_dir = temp_dir.join("Saved Games").join("CD Projekt Red").join("Cyberpunk 2077");
        let cp_slot = cp_save_dir.join("AutoSave-0");
        fs::create_dir_all(&cp_slot).unwrap();
        fs::write(cp_slot.join("sav.dat"), b"save_data").unwrap();
        fs::write(cp_save_dir.join("metadata.9.json"), b"{}").unwrap();

        // 2. Setup bogus REDlauncher asset folder in AppData\Local\Programs
        let bogus_red = temp_dir.join("AppData").join("Local").join("Programs").join("CD Projekt Red").join("REDlauncher").join("gui").join("assets").join("news").join("cyberpunk");
        fs::create_dir_all(&bogus_red).unwrap();
        fs::write(bogus_red.join("banner.png"), b"png_data").unwrap();
        fs::write(bogus_red.join("article.html"), b"<html>").unwrap();

        // 3. Setup Steam userdata with ONLY remotecache.vdf
        let steam_userdata = temp_dir.join("Steam").join("userdata").join("1141233138").join("1091500");
        fs::create_dir_all(&steam_userdata).unwrap();
        fs::write(steam_userdata.join("remotecache.vdf"), b"vdf_data").unwrap();

        // 4. Setup Detroit Become Human in Saved Games
        let detroit_save = temp_dir.join("Saved Games").join("Quantic Dream").join("Detroit Become Human").join("S");
        fs::create_dir_all(&detroit_save).unwrap();
        fs::write(detroit_save.join("checkpoint.bin"), b"checkpoint_data").unwrap();

        // 5. Setup Terraria in Documents\My Games
        let terraria_save = temp_dir.join("Documents").join("My Games").join("Terraria").join("Players");
        fs::create_dir_all(&terraria_save).unwrap();
        fs::write(terraria_save.join("player.plr"), b"plr_data").unwrap();

        // Verify save content validator
        assert!(has_valid_save_content(&cp_save_dir));
        assert!(has_valid_save_content(detroit_save.parent().unwrap()));
        assert!(has_valid_save_content(terraria_save.parent().unwrap()));
        assert!(!has_valid_save_content(&steam_userdata), "Steam userdata with only remotecache.vdf must NOT be treated as save directory");
        assert!(!has_valid_save_content(&bogus_red), "REDlauncher asset news folder must NOT be treated as save directory");

        // Verify search_root_directory
        let cp_matcher = TitleMatcher::new("Cyberpunk 2077");
        let found_cp = search_root_directory(&temp_dir.join("Saved Games"), &cp_matcher, 1, 3);
        assert_eq!(found_cp, Some(cp_save_dir));

        let detroit_matcher = TitleMatcher::new("Detroit: Become Human");
        let found_detroit = search_root_directory(&temp_dir.join("Saved Games"), &detroit_matcher, 1, 3);
        assert_eq!(found_detroit, Some(detroit_save.parent().unwrap().to_path_buf()));

        let terraria_matcher = TitleMatcher::new("Terraria");
        let found_terraria = search_root_directory(&temp_dir.join("Documents").join("My Games"), &terraria_matcher, 1, 2);
        assert_eq!(found_terraria, Some(terraria_save.parent().unwrap().to_path_buf()));

        // Clean up
        let _ = fs::remove_dir_all(&temp_dir);
    }
}
