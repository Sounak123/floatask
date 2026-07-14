import { useRef } from 'react';
import { moveWindowBy } from '../store';

interface HeaderProps {
  onCollapse: () => void;
  onAddToggle: () => void;
}

export function Header({ onCollapse, onAddToggle }: HeaderProps) {
  const pendingDxRef = useRef(0);
  const pendingDyRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  function handleMouseDown(e: React.MouseEvent) {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).tagName === 'BUTTON') return;
    e.preventDefault();

    let lastX = e.screenX;
    let lastY = e.screenY;

    function flush() {
      rafRef.current = null;
      const dx = pendingDxRef.current;
      const dy = pendingDyRef.current;
      if (dx !== 0 || dy !== 0) {
        pendingDxRef.current = 0;
        pendingDyRef.current = 0;
        moveWindowBy(dx, dy).catch(() => {});
      }
    }

    function onMove(me: MouseEvent) {
      const dx = me.screenX - lastX;
      const dy = me.screenY - lastY;
      lastX = me.screenX;
      lastY = me.screenY;
      pendingDxRef.current += dx;
      pendingDyRef.current += dy;
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(flush);
      }
    }

    function onUp() {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
        flush();
      }
    }

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }

  return (
    <div className="header" onMouseDown={handleMouseDown} style={{ cursor: 'grab' }}>
      <span className="header-title">Floatask</span>
      <button className="header-btn" onClick={onCollapse} title="Collapse">↙</button>
      <button className="header-btn" onClick={onAddToggle} title="Add task">＋</button>
    </div>
  );
}
