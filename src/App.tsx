import { useEffect, useState, useCallback, useRef } from 'react';
import { AppData, AppMode, Task } from './types';
import { loadData, saveData, resizeWindow, expandWindow, collapseWindow, savePosition, restorePosition, regenerateGif } from './store';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { Bubble } from './components/Bubble';
import { Card } from './components/Card';
import { Header } from './components/Header';
import { QuickAdd } from './components/QuickAdd';
import { TaskList } from './components/TaskList';
import { CarryOverDialog } from './components/CarryOverDialog';

const BUBBLE_W = 72;
const BUBBLE_H = 72;
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
  // Keep modeRef current so callbacks never capture stale mode
  useEffect(() => { modeRef.current = mode; }, [mode]);
  const [appData, setAppData] = useState<AppData | null>(null);
  const [showCarryOver, setShowCarryOver] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  // Logical position of the bubble before expanding, so collapse restores it
  const bubblePosRef = useRef<{ x: number; y: number } | null>(null);
  // Ref tracking mode so onMoved never captures a stale closure value
  const modeRef = useRef<AppMode>('bubble');

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
      if (modeRef.current !== 'bubble') return;
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        savePosition(payload.x, payload.y).catch(console.error);
      }, 300);
    });
    return () => { clearTimeout(debounce); unlisten.then(fn => fn()); };
  }, []);

  const persist = useCallback((tasks: Task[]) => {
    if (!appData) return;
    const updated: AppData = { ...appData, tasks };
    setAppData(updated);
    saveData(updated);
  }, [appData]);

  async function expand() {
    const win = getCurrentWindow();
    const pos = await win.outerPosition();
    const scale = await win.scaleFactor();
    bubblePosRef.current = { x: pos.x / scale, y: pos.y / scale };
    setMode('card');
    expandWindow(CARD_W, CARD_H);
  }

  async function collapse() {
    setMode('bubble');
    setAddOpen(false);
    if (bubblePosRef.current) {
      const { x, y } = bubblePosRef.current;
      await collapseWindow(x, y);
    } else {
      await resizeWindow(BUBBLE_W, BUBBLE_H);
    }
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
  const incompleteCount = incompleteTasks.length;

  // Regenerate GIF whenever task count changes
  useEffect(() => {
    regenerateGif(incompleteCount).catch(console.error);
  }, [incompleteCount]);

  if (mode === 'bubble') {
    return (
      <Bubble
        incompleteCount={incompleteCount}
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
