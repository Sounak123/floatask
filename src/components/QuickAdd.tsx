import { useRef, useEffect } from 'react';

interface QuickAddProps {
  open: boolean;
  onAdd: (text: string) => void;
  onClose: () => void;
}

export function QuickAdd({ open, onAdd, onClose }: QuickAddProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      const text = inputRef.current?.value.trim();
      if (text) {
        onAdd(text);
        if (inputRef.current) inputRef.current.value = '';
      }
    } else if (e.key === 'Escape') {
      if (inputRef.current) inputRef.current.value = '';
      onClose();
    }
  }

  return (
    <div className={`quick-add-wrapper${open ? ' open' : ''}`}>
      <input
        ref={inputRef}
        className="quick-add-input"
        type="text"
        placeholder="Add a task…"
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}
