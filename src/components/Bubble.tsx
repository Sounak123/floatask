import { quitApp } from '../store';

interface BubbleProps {
  incompleteCount: number;
  onClick: () => void;
}

export function Bubble({ incompleteCount, onClick }: BubbleProps) {
  function handleContextMenu(e: React.MouseEvent) {
    e.preventDefault();
    if (window.confirm('Quit Floatask?')) {
      quitApp();
    }
  }

  return (
    <div
      className="bubble"
      data-tauri-drag-region
      onClick={onClick}
      onContextMenu={handleContextMenu}
    >
      <span className="bubble-badge">{incompleteCount}</span>
    </div>
  );
}
