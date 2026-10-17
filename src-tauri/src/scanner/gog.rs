use super::ScannedGame;
use crate::utils::registry::list_hklm_subkeys;

pub fn scan_gog_games() -> Vec<ScannedGame> {
    let mut discovered = Vec::new();
    let records = list_hklm_subkeys("SOFTWARE\\WOW6432Node\\GOG.com\\Games");

    for (game_id, title, exe_path) in records {
        let launch_uri = if !exe_path.is_empty() {
            exe_path.clone()
        } else {
            format!("goggalaxy://openGameView/{}", game_id)
        };

        discovered.push(ScannedGame {
            id: format!("gog-{}", game_id),
            title,
            platform: "gog".to_string(),
            launch_uri,
            install_path: exe_path,
            playtime_hours: Some(0.0),
            last_played: Some("Installed".to_string()),
        });
    }

    discovered
}