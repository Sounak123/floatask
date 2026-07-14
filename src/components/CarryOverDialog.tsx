interface CarryOverDialogProps {
  count: number;
  onKeep: () => void;
  onClear: () => void;
}

export function CarryOverDialog({ count, onKeep, onClear }: CarryOverDialogProps) {
  return (
    <div className="dialog-overlay">
      <div className="dialog-box">
        <div className="dialog-title">Tasks from yesterday</div>
        <div className="dialog-message">
          You have {count} incomplete {count === 1 ? 'task' : 'tasks'} from yesterday. What would you like to do?
        </div>
        <div className="dialog-actions">
          <button className="btn-secondary" onClick={onClear}>
            Clear them
          </button>
          <button className="btn-primary" onClick={onKeep}>
            Keep them
          </button>
        </div>
      </div>
    </div>
  );
}
