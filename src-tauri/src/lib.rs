mod application;
mod commands;
mod error;
mod storage;

pub use commands::CommandError;
pub use error::{AppError, AppErrorCode as CommandErrorCode, AppResult};
pub use storage::documents;

use tauri::{
    menu::MenuBuilder,
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager, WebviewUrl, WebviewWindowBuilder,
};

#[cfg(target_os = "macos")]
use tauri::TitleBarStyle;

const MAIN_WINDOW_LABEL: &str = "main";
const TRAY_SHOW_MAIN_ID: &str = "tray-show-main";
const TRAY_QUIT_ID: &str = "tray-quit";

fn build_main_window(app: &tauri::App) -> tauri::Result<()> {
    let window_builder = WebviewWindowBuilder::new(app, MAIN_WINDOW_LABEL, WebviewUrl::default())
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

fn restore_main_window(app: &tauri::AppHandle) {
    if let Some(window) = app.get_webview_window(MAIN_WINDOW_LABEL) {
        let _ = window.unminimize();
        let _ = window.show();
        let _ = window.set_focus();
    }
}

fn build_tray(app: &tauri::App) -> tauri::Result<()> {
    let tray_menu = MenuBuilder::new(app)
        .text(TRAY_SHOW_MAIN_ID, "显示主窗口")
        .separator()
        .text(TRAY_QUIT_ID, "退出")
        .build()?;

    // 托盘图标优先复用应用默认图标，保持系统层表现一致。
    let default_icon = app
        .default_window_icon()
        .cloned()
        .expect("default window icon should be configured for the tray icon");

    TrayIconBuilder::with_id("main-tray")
        .icon(default_icon)
        .tooltip("StoneDraw")
        .menu(&tray_menu)
        .show_menu_on_left_click(false)
        .on_menu_event(|app, event| match event.id.as_ref() {
            TRAY_SHOW_MAIN_ID => restore_main_window(app),
            TRAY_QUIT_ID => app.exit(0),
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                restore_main_window(tray.app_handle());
            }
        })
        .build(app)?;

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    commands::register(tauri::Builder::default())
        .plugin(tauri_plugin_window_state::Builder::new().build())
        .setup(|app| {
            build_main_window(app)?;
            build_tray(app)?;

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
