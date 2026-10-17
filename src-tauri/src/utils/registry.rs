#[cfg(target_os = "windows")]
use winreg::enums::*;
#[cfg(target_os = "windows")]
use winreg::RegKey;

pub fn read_hkcu_string(subkey: &str, value_name: &str) -> Option<String> {
    #[cfg(target_os = "windows")]
    {
        let hkcu = RegKey::predef(HKEY_CURRENT_USER);
        if let Ok(key) = hkcu.open_subkey(subkey) {
            if let Ok(val) = key.get_value::<String, _>(value_name) {
                return Some(val);
            }
        }
    }
    let _ = (subkey, value_name);
    None
}

pub fn list_hklm_subkeys(subkey: &str) -> Vec<(String, String, String)> {
    let mut results = Vec::new();
    #[cfg(target_os = "windows")]
    {
        let hklm = RegKey::predef(HKEY_LOCAL_MACHINE);
        if let Ok(base_key) = hklm.open_subkey(subkey) {
            for name in base_key.enum_keys().flatten() {
                if let Ok(game_key) = base_key.open_subkey(&name) {
                    let game_id = game_key.get_value::<String, _>("gameID").unwrap_or(name);
                    let game_name = game_key.get_value::<String, _>("gamename").unwrap_or_default();
                    let exe_path = game_key.get_value::<String, _>("exe").unwrap_or_default();
                    if !game_name.is_empty() {
                        results.push((game_id, game_name, exe_path));
                    }
                }
            }
        }
    }
    let _ = subkey;
    results
}