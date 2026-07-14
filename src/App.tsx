import { useEffect, useState, useCallback } from 'react';
import { AppData, AppMode, Task } from './types';
import { loadData, saveData, resizeWindow, savePosition, restorePosition } from './store';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { Bubble } from './components/Bubble';
import { Card } from './components/Card';
import { Header } from './components/Header';
import { QuickAdd } from './components/QuickAdd';
import { TaskList } from './components/TaskList';
import { CarryOverDialog } from './components/CarryOverDialog';

const BUBBLE_W = 56;
const BUBBLE_H = 56;
const CARD_W = 320;
const CARD_H = 480;

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function App() {
  const [mode, setMode] = useState<AppMode>('bubble');
  const [appData, setAppData] = useState<AppData | null>(null);
  const [showCarryOver, setShowCarryOver] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  // Load data on mount
  useEffect(() => {
    loadData().then((data) => {
      const today = todayISO();
      const isNewDay = data.last_opened_date !== today;
      const hasIncomplete = data.tasks.some(t => !t.completed);

      if (isNewDay && hasIncomplete) {
        setShowCarryOver(true);
      }

      const updated: AppData = { ...data, last_opened_date: today };
      setAppData(updated);
      saveData(updated);
      restorePosition();
    });
  }, []);

  useEffect(() => {
    let debounce: ReturnType<typeof setTimeout>;
    const win = getCurrentWindow();
    const unlisten = win.onMoved(({ payload }) => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        savePosition(payload.x, payload.y);
      }, 300);
    });
    return () => { unlisten.then(fn => fn()); };
  }, []);

  const persist = useCallback((tasks: Task[]) => {
    if (!appData) return;
    const updated: AppData = { ...appData, tasks };
    setAppData(updated);
    saveData(updated);
  }, [appData]);

  function expand() {
    setMode('card');
    resizeWindow(CARD_W, CARD_H);
  }

  function collapse() {
    setMode('bubble');
    setAddOpen(false);
    resizeWindow(BUBBLE_W, BUBBLE_H);
  }

  function handleAdd(text: string) {
    if (!appData) return;
    const task: Task = {
      id: generateId(),
      text,
      completed: false,
      created_at: new Date().toISOString(),
    };
    persist([...appData.tasks, task]);
    setAddOpen(false);
  }

  function handleToggle(id: string) {
    if (!appData) return;
    persist(appData.tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  }

  function handleDelete(id: string) {
    if (!appData) return;
    persist(appData.tasks.filter(t => t.id !== id));
  }

  function handleKeep() {
    setShowCarryOver(false);
    expand();
  }

  function handleClear() {
    if (!appData) return;
    const cleared = appData.tasks.filter(t => t.completed);
    persist(cleared);
    setShowCarryOver(false);
    expand();
  }

  const incompleteTasks = appData?.tasks.filter(t => !t.completed) ?? [];

  if (mode === 'bubble') {
    return (
      <Bubble
        incompleteCount={incompleteTasks.length}
        onClick={expand}
      />
    );
  }

  return (
    <Card>
      <Header onCollapse={collapse} onAddToggle={() => setAddOpen(v => !v)} />
      <QuickAdd open={addOpen} onAdd={handleAdd} onClose={() => setAddOpen(false)} />
      {appData && (
        <TaskList
          tasks={appData.tasks}
          onToggle={handleToggle}
          onDelete={handleDelete}
        />
      )}
      {showCarryOver && appData && (
        <CarryOverDialog
          count={incompleteTasks.length}
          onKeep={handleKeep}
          onClear={handleClear}
        />
      )}
    </Card>
  );
}
