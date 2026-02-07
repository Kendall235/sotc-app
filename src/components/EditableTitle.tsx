import { useState, useRef, useEffect } from 'react';

interface EditableTitleProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
}

export function EditableTitle({ value, onChange, maxLength = 30 }: EditableTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
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
        className="font-oswald text-[20px] font-semibold uppercase tracking-wide text-bright leading-none bg-transparent border-b outline-none w-full"
        style={{ caretColor: 'var(--color-gshock-red)', borderColor: 'var(--color-gshock-red)' }}
      />
    );
  }

  return (
    <h2
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="font-oswald text-[20px] font-semibold uppercase tracking-wide leading-none cursor-pointer transition-all"
      style={{
        color: isHovered ? 'var(--color-gshock-red)' : 'var(--color-text-bright)',
        textDecoration: isHovered ? 'underline' : 'none',
        textDecorationColor: 'var(--color-gshock-red)',
        textUnderlineOffset: '3px',
      }}
      title="Click to edit"
    >
      {value}
    </h2>
  );
}
