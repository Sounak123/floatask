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
