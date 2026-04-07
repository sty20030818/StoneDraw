pub mod commands;
pub mod storage;

use tauri::{TitleBarStyle, WebviewUrl, WebviewWindowBuilder};

fn build_main_window(app: &tauri::App) -> tauri::Result<()> {
    let window_builder = WebviewWindowBuilder::new(app, "main", WebviewUrl::default())
        .title("StoneDraw")
        .inner_size(1360.0, 1000.0)
        .min_inner_size(900.0, 680.0)
        .resizable(true)
        .fullscreen(false);

    #[cfg(target_os = "macos")]
    let window_builder = window_builder
        .decorations(true)
        .title_bar_style(TitleBarStyle::Overlay)
        .hidden_title(true);

    #[cfg(not(target_os = "macos"))]
    let window_builder = window_builder.decorations(false);

    window_builder.build()?;

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    commands::register(tauri::Builder::default())
        .setup(|app| {
            build_main_window(app)?;

            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
