import { getCurrentWindow } from '@tauri-apps/api/window';

interface HeaderProps {
  onCollapse: () => void;
  onAddToggle: () => void;
}

export function Header({ onCollapse, onAddToggle }: HeaderProps) {
  function handleMouseDown(e: React.MouseEvent) {
    if (e.button === 0 && (e.target as HTMLElement).tagName !== 'BUTTON') {
      getCurrentWindow().startDragging();
    }
  }

  return (
    <div className="header" onMouseDown={handleMouseDown}>
      <span className="header-title">Floatask</span>
      <button className="header-btn" onClick={onCollapse} title="Collapse">
        ↙
      </button>
      <button className="header-btn" onClick={onAddToggle} title="Add task">
        ＋
      </button>
    </div>
  );
}
