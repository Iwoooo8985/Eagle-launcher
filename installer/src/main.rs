#![windows_subsystem = "windows"]

use std::env;
use std::fs;
use std::os::windows::ffi::OsStrExt;
use std::path::{Path, PathBuf};
use std::process::Command;

#[link(name = "user32")]
extern "system" {
    fn MessageBoxW(
        hwnd: *mut std::ffi::c_void,
        lpText: *const u16,
        lpCaption: *const u16,
        uType: u32,
    ) -> i32;
}

const MB_OK: u32 = 0x00000000;
const MB_YESNO: u32 = 0x00000004;
const MB_ICONERROR: u32 = 0x00000010;
const MB_ICONQUESTION: u32 = 0x00000020;
const MB_ICONINFORMATION: u32 = 0x00000040;
const IDYES: i32 = 6;

static EMBEDDED_LAUNCHER: &[u8] = include_bytes!("../../Eagle Launcher.exe");

fn to_wide(s: &str) -> Vec<u16> {
    std::ffi::OsStr::new(s)
        .encode_wide()
        .chain(std::iter::once(0))
        .collect()
}

fn show_message(title: &str, text: &str, flags: u32) -> i32 {
    let t = to_wide(title);
    let m = to_wide(text);
    unsafe { MessageBoxW(std::ptr::null_mut(), m.as_ptr(), t.as_ptr(), flags) }
}

fn create_shortcut(target_exe: &Path, shortcut_path: &Path, description: &str) -> Result<(), String> {
    let target_str = target_exe.to_string_lossy().replace('\'', "''");
    let shortcut_str = shortcut_path.to_string_lossy().replace('\'', "''");
    let working_dir = target_exe
        .parent()
        .unwrap_or(target_exe)
        .to_string_lossy()
        .replace('\'', "''");

    let script = format!(
        r#"$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('{}'); $s.TargetPath = '{}'; $s.WorkingDirectory = '{}'; $s.Description = '{}'; $s.IconLocation = '{},0'; $s.Save();"#,
        shortcut_str, target_str, working_dir, description, target_str
    );

    let output = Command::new("powershell")
        .args(["-NoProfile", "-Command", &script])
        .output()
        .map_err(|e| e.to_string())?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }

    Ok(())
}

fn main() {
    let confirm = show_message(
        "Eagle Launcher Setup",
        "Welcome to Eagle Launcher Setup!\n\nWould you like to install Eagle Launcher on your PC?\n\n• Installs to: %LOCALAPPDATA%\\EagleLauncher\n• Creates Windows Start Menu shortcut (searchable)\n• Creates Desktop shortcut",
        MB_YESNO | MB_ICONQUESTION,
    );

    if confirm != IDYES {
        return;
    }

    let local_appdata = match env::var("LOCALAPPDATA") {
        Ok(val) => PathBuf::from(val),
        Err(_) => {
            show_message(
                "Installation Failed",
                "Unable to determine %LOCALAPPDATA% folder path on this system.",
                MB_OK | MB_ICONERROR,
            );
            return;
        }
    };

    let install_dir = local_appdata.join("EagleLauncher");
    if let Err(e) = fs::create_dir_all(&install_dir) {
        show_message(
            "Installation Failed",
            &format!("Failed to create installation directory:\n{}", e),
            MB_OK | MB_ICONERROR,
        );
        return;
    }

    let installed_exe = install_dir.join("Eagle Launcher.exe");

    // Close any running Eagle Launcher instance before copying
    let _ = Command::new("powershell")
        .args([
            "-NoProfile",
            "-Command",
            "Get-Process -Name 'Eagle Launcher' -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue; Start-Sleep -Milliseconds 400",
        ])
        .output();

    if let Err(e) = fs::write(&installed_exe, EMBEDDED_LAUNCHER) {
        show_message(
            "Installation Failed",
            &format!("Failed to write Eagle Launcher executable:\n{}\n\nPlease ensure Eagle Launcher is closed and try again.", e),
            MB_OK | MB_ICONERROR,
        );
        return;
    }

    // 1. Create Start Menu shortcut
    if let Ok(appdata) = env::var("APPDATA") {
        let start_menu_dir = PathBuf::from(appdata)
            .join("Microsoft")
            .join("Windows")
            .join("Start Menu")
            .join("Programs");

        if start_menu_dir.exists() {
            let shortcut_path = start_menu_dir.join("Eagle Launcher.lnk");
            let _ = create_shortcut(
                &installed_exe,
                &shortcut_path,
                "Eagle Launcher - Unified PC Gaming Hub",
            );
        }
    }

    // 2. Create Desktop shortcut
    if let Ok(userprofile) = env::var("USERPROFILE") {
        let desktop_dir = PathBuf::from(userprofile).join("Desktop");
        if desktop_dir.exists() {
            let shortcut_path = desktop_dir.join("Eagle Launcher.lnk");
            let _ = create_shortcut(
                &installed_exe,
                &shortcut_path,
                "Eagle Launcher - Unified PC Gaming Hub",
            );
        }
    }

    // Prompt user to launch immediately
    let launch_choice = show_message(
        "Installation Complete!",
        "Eagle Launcher has been successfully installed!\n\n• Start Menu shortcut created (search for 'Eagle Launcher')\n• Desktop shortcut created\n\nWould you like to launch Eagle Launcher now?",
        MB_YESNO | MB_ICONINFORMATION,
    );

    if launch_choice == IDYES {
        let _ = Command::new(&installed_exe).spawn();
    }
}
