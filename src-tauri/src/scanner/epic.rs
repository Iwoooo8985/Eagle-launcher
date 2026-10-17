use super::ScannedGame;
use serde::Deserialize;
use std::fs;
use std::path::PathBuf;

#[derive(Deserialize)]
#[serde(rename_all = "PascalCase")]
struct EpicManifest {
    display_name: Option<String>,
    app_name: Option<String>,
    install_location: Option<String>,
}

pub fn scan_epic_games() -> Vec<ScannedGame> {
    let mut discovered = Vec::new();
    let manifest_dir = PathBuf::from("C:\\ProgramData\\Epic\\EpicGamesLauncher\\Data\\Manifests");

    let Ok(entries) = fs::read_dir(manifest_dir) else {
        return discovered;
    };

    for entry in entries.flatten() {
        let path = entry.path();
        if path.extension().and_then(|e| e.to_str()) == Some("item") {
            if let Ok(raw) = fs::read_to_string(&path) {
                if let Ok(parsed) = serde_json::from_str::<EpicManifest>(&raw) {
                    if let (Some(title), Some(app_name)) = (parsed.display_name, parsed.app_name) {
                        discovered.push(ScannedGame {
                            id: format!("epic-{}", app_name),
                            title,
                            platform: "epic".to_string(),
                            launch_uri: format!(
                                "com.epicgames.launcher://apps/{}?action=launch&silent=true",
                                app_name
                            ),
                            install_path: parsed.install_location.unwrap_or_default(),
                            playtime_hours: Some(0.0),
                            last_played: Some("Installed".to_string()),
                        });
                    }
                }
            }
        }
    }

    discovered
}