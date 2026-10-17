use super::ScannedGame;
use std::path::PathBuf;
use walkdir::WalkDir;

pub fn scan_xbox_games() -> Vec<ScannedGame> {
    let mut discovered = Vec::new();

    // 1. Scan [Drive]:\XboxGames across all available drive letters
    for drive_letter in b'C'..=b'Z' {
        let drive_char = drive_letter as char;
        let xbox_root = PathBuf::from(format!("{}:\\XboxGames", drive_char));
        if !xbox_root.exists() || !xbox_root.is_dir() {
            continue;
        }

        if let Ok(entries) = std::fs::read_dir(&xbox_root) {
            for entry in entries.flatten() {
                let path = entry.path();
                if !path.is_dir() {
                    continue;
                }

                let dir_name = path
                    .file_name()
                    .and_then(|n| n.to_str())
                    .unwrap_or("")
                    .to_string();

                // Skip non-game folders
                if dir_name.eq_ignore_ascii_case("GameSave") || dir_name.starts_with('.') {
                    continue;
                }

                // Look for gamelaunchhelper.exe or main executable
                let mut launch_exe: Option<PathBuf> = None;

                // Priority 1: Content/gamelaunchhelper.exe
                let content_helper = path.join("Content").join("gamelaunchhelper.exe");
                if content_helper.exists() {
                    launch_exe = Some(content_helper);
                }

                // Priority 2: root gamelaunchhelper.exe
                if launch_exe.is_none() {
                    let root_helper = path.join("gamelaunchhelper.exe");
                    if root_helper.exists() {
                        launch_exe = Some(root_helper);
                    }
                }

                // Priority 3: Search Content/ or root for first valid game .exe
                if launch_exe.is_none() {
                    let search_dir = if path.join("Content").exists() {
                        path.join("Content")
                    } else {
                        path.clone()
                    };

                    for entry in WalkDir::new(&search_dir).max_depth(2).into_iter().flatten() {
                        let p = entry.path();
                        if p.is_file() {
                            if let Some(ext) = p.extension() {
                                if ext.eq_ignore_ascii_case("exe") {
                                    let filename = p
                                        .file_name()
                                        .and_then(|n| n.to_str())
                                        .unwrap_or("")
                                        .to_lowercase();

                                    let is_helper_or_game = !filename.contains("unins")
                                        && !filename.contains("crash")
                                        && !filename.contains("redist")
                                        && !filename.contains("setup")
                                        && !filename.contains("install")
                                        && !filename.contains("unitycrash");

                                    if is_helper_or_game {
                                        launch_exe = Some(p.to_path_buf());
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }

                if let Some(exe_path) = launch_exe {
                    let id_title = dir_name
                        .to_lowercase()
                        .chars()
                        .filter(|c| c.is_alphanumeric() || *c == '-')
                        .collect::<String>();

                    discovered.push(ScannedGame {
                        id: format!("xbox-{}", id_title),
                        title: dir_name.clone(),
                        platform: "xbox".to_string(),
                        launch_uri: exe_path.to_string_lossy().to_string(),
                        install_path: path.to_string_lossy().to_string(),
                        playtime_hours: Some(0.0),
                        last_played: Some("Installed".to_string()),
                    });
                }
            }
        }
    }

    // 2. Query PowerShell Get-StartApps for any installed UWP/Store Xbox games
    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        let mut cmd = std::process::Command::new("powershell");
        cmd.creation_flags(0x08000000); // CREATE_NO_WINDOW
        cmd.args([
            "-NoProfile",
            "-Command",
            r#"try {
                Get-StartApps | Where-Object {
                    $_.AppID -match '!' -and (
                        $_.AppID -match 'Innersloth' -or
                        $_.AppID -match 'MinecraftUWP' -or
                        $_.AppID -match 'Bethesda' -or
                        $_.AppID -match 'Forza' -or
                        $_.AppID -match 'Halo' -or
                        $_.AppID -match 'SeaOfThieves' -or
                        $_.AppID -match 'StateOfDecay'
                    ) -and $_.AppID -notmatch 'Microsoft\.XboxApp' -and $_.AppID -notmatch 'Microsoft\.GamingApp'
                } | ForEach-Object { $_.Name + '|' + $_.AppID }
            } catch {}"#,
        ]);

        if let Ok(output) = cmd.output() {
            let text = String::from_utf8_lossy(&output.stdout);
            for line in text.lines() {
                let trimmed = line.trim();
                if let Some((name, app_id)) = trimmed.split_once('|') {
                    let name = name.trim();
                    let app_id = app_id.trim();

                    // If not already discovered from folder
                    let already_exists = discovered.iter().any(|g| {
                        g.title.eq_ignore_ascii_case(name)
                            || name.to_lowercase().contains(&g.title.to_lowercase())
                    });

                    if !already_exists && !name.is_empty() && !app_id.is_empty() {
                        let id_name = name
                            .to_lowercase()
                            .chars()
                            .filter(|c| c.is_alphanumeric() || *c == '-')
                            .collect::<String>();

                        discovered.push(ScannedGame {
                            id: format!("xbox-uwp-{}", id_name),
                            title: name.to_string(),
                            platform: "xbox".to_string(),
                            launch_uri: format!("shell:AppsFolder\\{}", app_id),
                            install_path: String::new(),
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
