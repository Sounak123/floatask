import { useState } from 'react';
import { Card } from './components/Card';
import { Header } from './components/Header';
import { QuickAdd } from './components/QuickAdd';
import { TaskList } from './components/TaskList';
import { Task } from './types';

const MOCK: Task[] = [
  { id: '1', text: 'Buy groceries', completed: false, created_at: '' },
  { id: '2', text: 'Read a book', completed: true, created_at: '' },
];

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(MOCK);
  const [addOpen, setAddOpen] = useState(false);
  const toggle = (id: string) => setTasks(ts => ts.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  const del = (id: string) => setTasks(ts => ts.filter(t => t.id !== id));
  return (
    <Card>
      <Header onCollapse={() => {}} onAddToggle={() => setAddOpen(v => !v)} />
      <QuickAdd open={addOpen} onAdd={(text) => { setTasks(ts => [...ts, { id: Date.now().toString(), text, completed: false, created_at: '' }]); setAddOpen(false); }} onClose={() => setAddOpen(false)} />
      <TaskList tasks={tasks} onToggle={toggle} onDelete={del} />
    </Card>
  );
}
