interface HeaderProps {
  onCollapse: () => void;
  onAddToggle: () => void;
}

export function Header({ onCollapse, onAddToggle }: HeaderProps) {
  return (
    <div className="header" data-tauri-drag-region>
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
