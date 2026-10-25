#![windows_subsystem = "windows"]

mod process {
    pub mod launcher;
    pub mod tracker;
    pub mod save_backup;
}
mod scanner;
mod utils {
    pub mod registry;
}

use process::launcher::launch_game_uri;
use process::tracker::is_process_running;
use process::save_backup::{
    validate_or_create_cloud_dir,
    detect_game_save_path,
    backup_single_game_save,
    backup_all_games_saves,
    open_folder_in_explorer,
};
use scanner::scan_all_games;

#[tauri::command]
fn minimize_window(window: tauri::Window) {
    let _ = window.minimize();
}

#[tauri::command]
fn toggle_maximize_window(window: tauri::Window) {
    if let Ok(is_maximized) = window.is_maximized() {
        if is_maximized {
            let _ = window.unmaximize();
        } else {
            let _ = window.maximize();
        }
    }
}

#[tauri::command]
fn close_window(window: tauri::Window) {
    let _ = window.close();
}

#[tauri::command]
fn pick_game_file() -> Result<Option<String>, String> {
    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        let mut cmd = std::process::Command::new("powershell");
        cmd.creation_flags(0x08000000); // CREATE_NO_WINDOW
        cmd.args([
            "-NoProfile",
            "-Command",
            "[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; Add-Type -AssemblyName System.Windows.Forms; $dialog = New-Object System.Windows.Forms.OpenFileDialog; $dialog.Filter = 'Game Executables & ROMs (*.exe;*.lnk;*.bat;*.cmd;*.iso;*.bin;*.sfc;*.gba)|*.exe;*.lnk;*.bat;*.cmd;*.iso;*.bin;*.sfc;*.smc;*.gba;*.chd;*.nsp;*.xci|All Files (*.*)|*.*'; $dialog.Title = 'Select Game Executable or ROM'; if ($dialog.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) { Write-Output $dialog.FileName }",
        ]);

        let output = cmd.output().map_err(|e| e.to_string())?;
        let path_str = String::from_utf8_lossy(&output.stdout).trim().to_string();
        if path_str.is_empty() {
            Ok(None)
        } else {
            Ok(Some(path_str))
        }
    }
    #[cfg(not(target_os = "windows"))]
    {
        Ok(None)
    }
}

#[tauri::command]
fn pick_folder() -> Result<Option<String>, String> {
    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        let mut cmd = std::process::Command::new("powershell");
        cmd.creation_flags(0x08000000); // CREATE_NO_WINDOW
        cmd.args([
            "-NoProfile",
            "-Command",
            "[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; Add-Type -AssemblyName System.Windows.Forms; $dialog = New-Object System.Windows.Forms.FolderBrowserDialog; $dialog.Description = 'Select Google Drive Game Saves Folder'; $dialog.ShowNewFolderButton = $true; if ($dialog.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) { Write-Output $dialog.SelectedPath }",
        ]);

        let output = cmd.output().map_err(|e| e.to_string())?;
        let path_str = String::from_utf8_lossy(&output.stdout).trim().to_string();
        if path_str.is_empty() {
            Ok(None)
        } else {
            Ok(Some(path_str))
        }
    }
    #[cfg(not(target_os = "windows"))]
    {
        Ok(None)
    }
}

#[tauri::command]
fn resolve_game_icon(app_id: Option<String>, launch_uri: Option<String>) -> Option<String> {
    // 1. Check Steam local librarycache/<app_id>/<40-char-sha1>.jpg for the official square game icon
    if let Some(ref id) = app_id {
        if !id.is_empty() {
            if let Some(steam_path) = utils::registry::read_hkcu_string("Software\\Valve\\Steam", "SteamPath") {
                let cache_dir = std::path::PathBuf::from(&steam_path)
                    .join("appcache")
                    .join("librarycache")
                    .join(id);
                if let Ok(entries) = std::fs::read_dir(&cache_dir) {
                    for entry in entries.flatten() {
                        let path = entry.path();
                        if path.is_file() {
                            if let (Some(stem), Some(ext)) = (
                                path.file_stem().and_then(|s| s.to_str()),
                                path.extension().and_then(|e| e.to_str()),
                            ) {
                                if ext.eq_ignore_ascii_case("jpg")
                                    && stem.len() == 40
                                    && stem.chars().all(|c| c.is_ascii_hexdigit())
                                {
                                    return Some(format!(
                                        "https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/apps/{}/{}.jpg",
                                        id, stem
                                    ));
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // 2. For standalone .exe games, extract the associated Windows executable icon as base64 PNG
    #[cfg(target_os = "windows")]
    if let Some(ref uri) = launch_uri {
        let path = std::path::Path::new(uri);
        if path.is_file() {
            if let Some(ext) = path.extension().and_then(|e| e.to_str()) {
                if ext.eq_ignore_ascii_case("exe") {
                    use std::os::windows::process::CommandExt;
                    let escaped = uri.replace('\'', "''");
                    let mut cmd = std::process::Command::new("powershell");
                    cmd.creation_flags(0x08000000);
                    cmd.args([
                        "-NoProfile",
                        "-Command",
                        &format!(
                            "try {{ Add-Type -AssemblyName System.Drawing; $ico = [System.Drawing.Icon]::ExtractAssociatedIcon('{}'); if ($ico) {{ $bmp = $ico.ToBitmap(); $ms = New-Object System.IO.MemoryStream; $bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png); [Convert]::ToBase64String($ms.ToArray()) }} }} catch {{}}",
                            escaped
                        ),
                    ]);
                    if let Ok(output) = cmd.output() {
                        let b64 = String::from_utf8_lossy(&output.stdout).trim().to_string();
                        if !b64.is_empty() {
                            return Some(format!("data:image/png;base64,{}", b64));
                        }
                    }
                }
            }
        }
    }

    None
}

#[tauri::command]
fn query_steam_artwork(title: String) -> Result<Option<String>, String> {
    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        let sanitized: String = title
            .chars()
            .filter(|c| c.is_alphanumeric() || *c == ' ')
            .collect();
        let trimmed = sanitized.trim();
        if trimmed.is_empty() {
            return Ok(None);
        }

        let mut cmd = std::process::Command::new("powershell");
        cmd.creation_flags(0x08000000); // CREATE_NO_WINDOW
        cmd.args([
            "-NoProfile",
            "-Command",
            &format!(
                r#"try {{
                    $res = Invoke-RestMethod -Uri "https://store.steampowered.com/api/storesearch/?term={}&l=english&cc=US" -TimeoutSec 4;
                    if ($res.items -and $res.items.Count -gt 0) {{
                        Write-Output $res.items[0].id
                    }}
                }} catch {{}}"#,
                trimmed
            ),
        ]);

        if let Ok(output) = cmd.output() {
            let id = String::from_utf8_lossy(&output.stdout).trim().to_string();
            if !id.is_empty() && id.chars().all(|c| c.is_ascii_digit()) {
                return Ok(Some(format!(
                    "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/{}/header.jpg",
                    id
                )));
            }
        }
    }
    Ok(None)
}

#[tauri::command]
fn fetch_steam_specials() -> Result<String, String> {
    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        let mut cmd = std::process::Command::new("powershell");
        cmd.creation_flags(0x08000000); // CREATE_NO_WINDOW
        cmd.args([
            "-NoProfile",
            "-Command",
            r#"try {
                $res = Invoke-RestMethod -Uri "https://store.steampowered.com/api/featuredcategories/?l=english&cc=US" -TimeoutSec 6;
                $items = @();
                if ($res.specials -and $res.specials.items) {
                    $now = [int][double]::Parse((Get-Date (Get-Date).ToUniversalTime() -UFormat %s));
                    foreach ($item in $res.specials.items) {
                        $orig = [math]::Round($item.original_price / 100, 2);
                        $final = [math]::Round($item.final_price / 100, 2);
                        $expStr = "Limited Time Deal";
                        if ($item.discount_expiration -and $item.discount_expiration -gt $now) {
                            $diff = $item.discount_expiration - $now;
                            if ($diff -gt 86400) {
                                $days = [math]::Round($diff / 86400);
                                $expStr = "Ends in $days days";
                            } elseif ($diff -gt 3600) {
                                $hrs = [math]::Round($diff / 3600);
                                $expStr = "Ends in $hrs hours";
                            } else {
                                $expStr = "Ends in under an hour";
                            }
                        }
                        $items += [PSCustomObject]@{
                            id = "steam-" + [string]$item.id;
                            title = $item.name;
                            store = "Steam";
                            originalPrice = "$" + [string]$orig;
                            salePrice = "$" + [string]$final;
                            discount = "-" + [string]$item.discount_percent + "%";
                            discountPercent = [int]$item.discount_percent;
                            headerUrl = $item.header_image;
                            expires = $expStr;
                            storeUrl = "https://store.steampowered.com/app/" + [string]$item.id;
                            isHistoricalLow = ($item.discount_percent -ge 60);
                        }
                    }
                }
                if ($items.Count -gt 0) {
                    $items | ConvertTo-Json -Compress
                } else {
                    "[]"
                }
            } catch {
                "[]"
            }"#,
        ]);

        if let Ok(output) = cmd.output() {
            let json = String::from_utf8_lossy(&output.stdout).trim().to_string();
            if json.starts_with('[') {
                return Ok(json);
            }
        }
    }
    Ok("[]".to_string())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            scan_all_games,
            launch_game_uri,
            is_process_running,
            minimize_window,
            toggle_maximize_window,
            close_window,
            pick_game_file,
            pick_folder,
            resolve_game_icon,
            query_steam_artwork,
            fetch_steam_specials,
            validate_or_create_cloud_dir,
            detect_game_save_path,
            backup_single_game_save,
            backup_all_games_saves,
            open_folder_in_explorer
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}