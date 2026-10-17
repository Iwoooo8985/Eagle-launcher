use std::process::Command;

#[tauri::command]
pub fn launch_game_uri(uri: String, platform: String, optimize_power: bool) -> Result<String, String> {
    if optimize_power {
        #[cfg(target_os = "windows")]
        {
            // Activate Windows High Performance Power Scheme
            let _ = Command::new("powercfg")
                .args(["/setactive", "8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c"])
                .spawn();
        }
    }

    #[cfg(target_os = "windows")]
    {
        if uri.contains("://") || uri.starts_with("shell:") {
            Command::new("cmd")
                .args(["/C", "start", "", &uri])
                .spawn()
                .map_err(|e| e.to_string())?;
        } else {
            // Standalone EXE or Emulator injection
            match platform.as_str() {
                "snes" | "gba" => {
                    Command::new("retroarch.exe")
                        .arg(&uri)
                        .spawn()
                        .map_err(|e| format!("RetroArch launch failed: {}", e))?;
                }
                "ps2" => {
                    Command::new("pcsx2-qt.exe")
                        .args(["-nogui", &uri])
                        .spawn()
                        .map_err(|e| format!("PCSX2 launch failed: {}", e))?;
                }
                _ => {
                    let mut cmd = Command::new(&uri);
                    if let Some(parent) = std::path::Path::new(&uri).parent() {
                        cmd.current_dir(parent);
                    }
                    cmd.spawn().map_err(|e| e.to_string())?;
                }
            }
        }
    }

    Ok(format!("Launched {}", uri))
}