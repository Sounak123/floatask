interface BubbleProps {
  incompleteCount: number;
  onClick: () => void;
}

export function Bubble({ incompleteCount, onClick }: BubbleProps) {
  return (
    <div
      className="bubble"
      data-tauri-drag-region
      onClick={onClick}
      onContextMenu={(e) => e.preventDefault()}
    >
      <span className="bubble-badge">{incompleteCount}</span>
    </div>
  );
}
