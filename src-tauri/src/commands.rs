// commands implemented in Task 2

use tauri::AppHandle;

#[tauri::command]
pub fn load_data() -> String {
    String::new()
}

#[tauri::command]
pub fn save_data(_data: String) {}

#[tauri::command]
pub fn resize_window(_app: AppHandle) {}
