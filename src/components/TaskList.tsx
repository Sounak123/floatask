import { Task } from '../types';
import { TaskRow } from './TaskRow';

interface TaskListProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TaskList({ tasks, onToggle, onDelete }: TaskListProps) {
  const sorted = [
    ...tasks.filter((t) => !t.completed),
    ...tasks.filter((t) => t.completed),
  ];

  return (
    <div className="task-list">
      {sorted.map((task) => (
        <TaskRow
          key={task.id}
          task={task}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
