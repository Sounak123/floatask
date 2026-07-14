import { Task } from '../types';

interface TaskRowProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TaskRow({ task, onToggle, onDelete }: TaskRowProps) {
  return (
    <div className="task-row">
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task.id)}
      />
      <span className={`task-text${task.completed ? ' completed' : ''}`}>
        {task.text}
      </span>
      <button
        className="task-delete"
        onClick={() => onDelete(task.id)}
        title="Delete task"
      >
        ×
      </button>
    </div>
  );
}
