use sysinfo::System;

#[tauri::command]
pub fn is_process_running(process_keyword: String) -> bool {
    let mut sys = System::new_all();
    sys.refresh_all();

    let needle = process_keyword.to_lowercase();
    for process in sys.processes().values() {
        let p_name = process.name().to_string_lossy().to_lowercase();
        if p_name.contains(&needle) {
            return true;
        }
    }
    false
}