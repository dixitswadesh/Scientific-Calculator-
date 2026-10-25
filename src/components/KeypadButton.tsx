import React from 'react';
import { hapticEngine } from '../utils/haptics';

interface KeypadButtonProps {
  label: string | React.ReactNode;
  value: string;
  onClick: (val: string) => void;
  type?: 'number' | 'operator' | 'action' | 'equals' | 'scientific' | 'delete';
  className?: string;
  ariaLabel?: string;
  subLabel?: string;
}

export const KeypadButton: React.FC<KeypadButtonProps> = ({
  label,
  value,
  onClick,
  type = 'number',
  className = '',
  ariaLabel,
  subLabel,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    hapticEngine.playKeyFeedback(type === 'scientific' ? 'action' : type);
    onClick(value);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={ariaLabel || (typeof label === 'string' ? label : value)}
      className={`relative group overflow-hidden select-none font-medium flex flex-col items-center justify-center transition-all duration-100 active:scale-[0.92] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 touch-manipulation ${className}`}
    >
      <span className="flex items-center justify-center pointer-events-none text-center">
        {label}
      </span>
      {subLabel && (
        <span className="text-[10px] opacity-60 font-normal tracking-tight pointer-events-none">
          {subLabel}
        </span>
      )}
      {/* Subtle Material surface highlight ripple overlay */}
      <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-10 group-active:opacity-20 bg-white transition-opacity pointer-events-none" />
    </button>
  );
};
