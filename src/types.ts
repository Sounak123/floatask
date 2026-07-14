export interface Task {
  id: string;
  text: string;
  completed: boolean;
  created_at: string;
}

export interface WindowPosition {
  x: number;
  y: number;
}

export interface AppData {
  tasks: Task[];
  last_opened_date: string;
  window_position: WindowPosition | null;
}

export type AppMode = 'bubble' | 'card';
