import { useState, useRef, useEffect } from 'react';
import type { WatchTier } from '../utils/watchTiers';

interface EditableChipProps {
  value: string;
  originalValue: string;
  tier: WatchTier;
  onChange: (newValue: string) => void;
  fontSize?: number; // Font size in pixels (default 11)
}

/**
 * Get tier-based styling for chips
 * Following PRD specifications:
 * - Standard: elevated bg with subtle border
 * - Rare: gold accent (collaborations)
 * - Premium: red accent (Full Metal, MR-G, etc.)
 */
function getTierStyles(tier: WatchTier) {
  switch (tier) {
    case 'premium':
      return {
        background: 'rgba(212, 43, 30, 0.15)',
        borderColor: '#D42B1E',
        textColor: '#D42B1E',
      };
    case 'rare':
      return {
        background: 'rgba(201, 162, 39, 0.15)',
        borderColor: '#C9A227',
        textColor: '#C9A227',
      };
    default:
      return {
        background: 'var(--color-bg-elevated)',
        borderColor: 'var(--color-border-subtle)',
        textColor: '#E8E5DC',
      };
  }
}

/**
 * EditableChip - Click-to-edit chip component
 * Following EditableTitle.tsx pattern for inline editing
 */
export function EditableChip({
  value,
  originalValue,
  tier,
  onChange,
  fontSize = 11,
}: EditableChipProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  const styles = getTierStyles(tier);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Sync value when it changes externally
  useEffect(() => {
    setEditValue(value);
  }, [value]);

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
    // Allow any input, convert to uppercase
    const newValue = e.target.value.toUpperCase();
    setEditValue(newValue);
  };

  // Check if value has been edited from original
  const isEdited = value !== originalValue;

  if (isEditing) {
    return (
      <div
        style={{
          padding: '6px 10px',
          borderRadius: '2px',
          background: styles.background,
          borderLeft: `3px solid var(--color-gshock-red)`,
          boxShadow: '0 0 0 1px var(--color-gshock-red)',
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          style={{
            fontFamily: 'var(--font-roboto-mono)',
            fontSize: `${fontSize}px`,
            fontWeight: 600,
            lineHeight: '1',
            color: '#E8E5DC',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            width: '140px',
            caretColor: 'var(--color-gshock-red)',
          }}
        />
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      style={{
        padding: '6px 10px',
        borderRadius: '2px',
        background: styles.background,
        borderLeft: `3px solid ${styles.borderColor}`,
        cursor: 'pointer',
        transition: 'transform 0.15s ease, border-color 0.15s ease',
        whiteSpace: 'nowrap',
        maxWidth: '100%',
      }}
      title={value}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.02)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      <span
        className="editable-chip-text"
        style={{
          fontFamily: 'var(--font-roboto-mono)',
          fontSize: `${fontSize}px`,
          fontWeight: 600,
          lineHeight: '1',
          color: styles.textColor,
          letterSpacing: '0.02em',
          display: 'block',
        }}
      >
        {value}
        {isEdited && (
          <span style={{ marginLeft: '4px', fontSize: '8px', opacity: 0.6 }}>*</span>
        )}
      </span>
    </div>
  );
}
