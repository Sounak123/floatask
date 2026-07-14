import { useRef } from 'react';
import { moveWindowBy, quitApp } from '../store';

interface BubbleProps {
  incompleteCount: number;
  onClick: () => void;
}

export function Bubble({ incompleteCount, onClick }: BubbleProps) {
  const draggedRef = useRef(false);
  const pendingDxRef = useRef(0);
  const pendingDyRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  function handleMouseDown(e: React.MouseEvent) {
    if (e.button !== 0) return;
    e.preventDefault();

    draggedRef.current = false;
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
      if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
        draggedRef.current = true;
      }
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

  function handleClick() {
    if (draggedRef.current) return;
    onClick();
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
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      <div className="bubble-inner">
        <img className="bubble-gif" src={`/goku.gif?v=${incompleteCount}`} alt="" draggable={false} />
      </div>
    </div>
  );
}
