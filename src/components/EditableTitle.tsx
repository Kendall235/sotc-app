import { useState, useRef, useEffect } from 'react';

interface EditableTitleProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
}

export function EditableTitle({ value, onChange, maxLength = 30 }: EditableTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleClick = () => {
    setEditValue(value);
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    const trimmed = editValue.trim().toUpperCase();
    if (trimmed && trimmed !== value) {
      onChange(trimmed);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      inputRef.current?.blur();
    } else if (e.key === 'Escape') {
      setEditValue(value);
      setIsEditing(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.slice(0, maxLength).toUpperCase();
    setEditValue(newValue);
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={editValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        maxLength={maxLength}
        className="font-display text-[26px] uppercase tracking-wide text-primary leading-none bg-transparent border-b border-brick outline-none w-full"
        style={{ caretColor: 'var(--color-brick)' }}
      />
    );
  }

  return (
    <h2
      onClick={handleClick}
      className="font-display text-[26px] uppercase tracking-wide text-primary leading-none cursor-pointer hover:text-brick transition-colors"
      title="Click to edit"
    >
      {value}
    </h2>
  );
}
