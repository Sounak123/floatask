import { getCurrentWindow } from '@tauri-apps/api/window';
import { quitApp } from '../store';

interface BubbleProps {
  incompleteCount: number;
  onClick: () => void;
}

export function Bubble({ incompleteCount, onClick }: BubbleProps) {
  function handleMouseDown(e: React.MouseEvent) {
    if (e.button === 0) {
      getCurrentWindow().startDragging();
    }
  }

  function handleContextMenu(e: React.MouseEvent) {
    e.preventDefault();
    if (window.confirm('Quit Floatask?')) {
      quitApp();
    }
  }

  return (
    <div
      className="bubble"
      onMouseDown={handleMouseDown}
      onClick={onClick}
      onContextMenu={handleContextMenu}
    >
      <span className="bubble-badge">{incompleteCount}</span>
    </div>
  );
}
