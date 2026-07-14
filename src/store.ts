import { invoke } from '@tauri-apps/api/core';
import { AppData } from './types';

export async function loadData(): Promise<AppData> {
  return invoke<AppData>('load_data');
}

export async function saveData(data: AppData): Promise<void> {
  return invoke<void>('save_data', { data });
}

export async function resizeWindow(width: number, height: number): Promise<void> {
  return invoke<void>('resize_window', { width, height });
}

export async function expandWindow(width: number, height: number): Promise<void> {
  return invoke<void>('expand_window', { width, height });
}

export async function collapseWindow(x: number, y: number): Promise<void> {
  return invoke<void>('collapse_window', { x, y });
}

export async function moveWindowBy(dx: number, dy: number): Promise<void> {
  return invoke<void>('move_window_by', { dx, dy });
}

export async function regenerateGif(count: number): Promise<void> {
  return invoke<void>('regenerate_gif', { count });
}

export async function savePosition(x: number, y: number): Promise<void> {
  return invoke<void>('save_position', { x, y });
}

export async function restorePosition(): Promise<void> {
  return invoke<void>('restore_position');
}

export async function quitApp(): Promise<void> {
  return invoke<void>('quit_app');
}
