pub mod epic;
pub mod gog;
pub mod roms;
pub mod standalone;
pub mod steam;
pub mod xbox;

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ScannedGame {
    pub id: String,
    pub title: String,
    pub platform: String,
    pub launch_uri: String,
    pub install_path: String,
    pub playtime_hours: Option<f64>,
    pub last_played: Option<String>,
}

#[tauri::command]
pub fn scan_all_games(rom_dir: Option<String>) -> Vec<ScannedGame> {
    let mut games = Vec::new();
    games.extend(steam::scan_steam_games());
    games.extend(epic::scan_epic_games());
    games.extend(gog::scan_gog_games());
    games.extend(xbox::scan_xbox_games());
    games.extend(standalone::scan_standalone_games());

    if let Some(dir) = rom_dir {
        games.extend(roms::scan_rom_directory(&dir));
    }
    games
}