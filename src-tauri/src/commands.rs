use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
pub struct Task {
    pub id: String,
    pub text: String,
    pub completed: bool,
    pub created_at: String,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
pub struct WindowPosition {
    pub x: f64,
    pub y: f64,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
pub struct AppData {
    pub tasks: Vec<Task>,
    pub last_opened_date: String,
    pub window_position: Option<WindowPosition>,
}

impl Default for AppData {
    fn default() -> Self {
        AppData {
            tasks: vec![],
            last_opened_date: String::new(),
            window_position: None,
        }
    }
}

fn data_path() -> PathBuf {
    let home = std::env::var("HOME").unwrap_or_else(|_| ".".to_string());
    PathBuf::from(home)
        .join("Library")
        .join("Application Support")
        .join("floatask")
        .join("tasks.json")
}

#[tauri::command]
pub fn load_data() -> Result<AppData, String> {
    let path = data_path();
    if !path.exists() {
        return Ok(AppData::default());
    }
    let content = fs::read_to_string(&path).map_err(|e| e.to_string())?;
    serde_json::from_str(&content).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn save_data(data: AppData) -> Result<(), String> {
    let path = data_path();
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    let content = serde_json::to_string_pretty(&data).map_err(|e| e.to_string())?;
    fs::write(&path, content).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn resize_window(app: AppHandle, width: f64, height: f64) -> Result<(), String> {
    use tauri::LogicalSize;
    let window = app.get_webview_window("main").ok_or("window not found")?;
    window
        .set_size(LogicalSize::new(width, height))
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn save_position(app: AppHandle, x: f64, y: f64) -> Result<(), String> {
    let _ = app;
    let mut data = load_data()?;
    data.window_position = Some(WindowPosition { x, y });
    save_data(data)
}

#[tauri::command]
pub fn restore_position(app: AppHandle) -> Result<(), String> {
    let data = load_data()?;
    let window = app.get_webview_window("main").ok_or("window not found")?;

    if let Some(pos) = data.window_position {
        use tauri::PhysicalPosition;
        window
            .set_position(PhysicalPosition::new(pos.x as i32, pos.y as i32))
            .map_err(|e| e.to_string())?;
    } else {
        use tauri::LogicalPosition;
        let monitor = window.primary_monitor().map_err(|e| e.to_string())?;
        if let Some(monitor) = monitor {
            let size = monitor.size();
            let scale = monitor.scale_factor();
            let screen_w = size.width as f64 / scale;
            let screen_h = size.height as f64 / scale;
            let x = screen_w - 56.0 - 24.0;
            let y = screen_h - 56.0 - 24.0;
            window
                .set_position(LogicalPosition::new(x, y))
                .map_err(|e| e.to_string())?;
        }
    }
    Ok(())
}

#[tauri::command]
pub fn quit_app(app: AppHandle) {
    app.exit(0);
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::env;
    use std::fs;

    /// Set HOME to a unique temp dir, run f(), then clean up.
    /// Each call gets its own subdirectory to avoid parallel-test races.
    fn with_temp_data_path<F: FnOnce()>(label: &str, f: F) {
        let tmp = env::temp_dir().join(format!("floatask_test_{}", label));
        fs::create_dir_all(
            tmp.join("Library")
                .join("Application Support")
                .join("floatask"),
        )
        .unwrap();
        // Safety: tests that call this function each use a distinct HOME path,
        // so there is no shared mutable state between the two test threads.
        unsafe {
            env::set_var("HOME", tmp.to_str().unwrap());
        }
        f();
        fs::remove_dir_all(&tmp).ok();
    }

    #[test]
    fn test_load_returns_default_when_no_file() {
        with_temp_data_path("no_file", || {
            let result = load_data().unwrap();
            assert_eq!(result, AppData::default());
        });
    }

    #[test]
    fn test_save_and_load_roundtrip() {
        with_temp_data_path("roundtrip", || {
            let data = AppData {
                tasks: vec![Task {
                    id: "abc".to_string(),
                    text: "Test task".to_string(),
                    completed: false,
                    created_at: "2026-07-14T00:00:00Z".to_string(),
                }],
                last_opened_date: "2026-07-14".to_string(),
                window_position: Some(WindowPosition { x: 100.0, y: 200.0 }),
            };
            save_data(data.clone()).unwrap();
            let loaded = load_data().unwrap();
            assert_eq!(loaded, data);
        });
    }
}
