use super::ScannedGame;
use std::path::Path;
use walkdir::WalkDir;

const VALID_EXTENSIONS: &[&str] = &["sfc", "smc", "gba", "iso", "chd", "nsp", "xci", "bin"];

pub fn scan_rom_directory(base_dir: &str) -> Vec<ScannedGame> {
    let mut discovered = Vec::new();
    let root = Path::new(base_dir);
    if !root.exists() {
        return discovered;
    }

    for entry in WalkDir::new(root).max_depth(3).into_iter().flatten() {
        let path = entry.path();
        if !path.is_file() {
            continue;
        }

        let Some(ext) = path.extension().and_then(|e| e.to_str()) else {
            continue;
        };

        let ext_lower = ext.to_lowercase();
        if !VALID_EXTENSIONS.contains(&ext_lower.as_str()) {
            continue;
        }

        let platform = path
            .parent()
            .and_then(|p| p.file_name())
            .and_then(|n| n.to_str())
            .unwrap_or("retro")
            .to_lowercase();

        let raw_stem = path
            .file_stem()
            .and_then(|s| s.to_str())
            .unwrap_or("Unknown ROM");

        let clean_title = sanitize_rom_title(raw_stem);
        let full_path = path.to_string_lossy().to_string();

        discovered.push(ScannedGame {
            id: format!("rom-{}-{}", platform, clean_title.to_lowercase().replace(' ', "-")),
            title: clean_title,
            platform,
            launch_uri: full_path.clone(),
            install_path: full_path,
            playtime_hours: Some(0.0),
            last_played: Some("Ready".to_string()),
        });
    }

    discovered
}

fn sanitize_rom_title(raw: &str) -> String {
    let mut result = String::new();
    let mut depth_paren = 0;
    let mut depth_bracket = 0;

    for ch in raw.chars() {
        match ch {
            '(' => depth_paren += 1,
            ')' if depth_paren > 0 => depth_paren -= 1,
            '[' => depth_bracket += 1,
            ']' if depth_bracket > 0 => depth_bracket -= 1,
            _ if depth_paren == 0 && depth_bracket == 0 => result.push(ch),
            _ => {}
        }
    }

    result.trim().to_string()
}