import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { debug } from '@/lib/debug';

interface DropdownMenuProps {
  children: React.ReactNode;
}

interface DropdownMenuTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
}

interface DropdownMenuContentProps {
  align?: 'start' | 'center' | 'end';
  className?: string;
  children: React.ReactNode;
}

interface DropdownMenuItemProps {
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
}

const DropdownMenuContext = React.createContext<{
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  triggerRef: React.RefObject<HTMLElement>;
}>({
  isOpen: false,
  setIsOpen: () => {},
  triggerRef: { current: null },
});

export function DropdownMenu({ children }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current && !triggerRef.current.contains(target)) {
        // Don't close if clicking on a dropdown menu item
        const dropdownContent = triggerRef.current.parentElement?.querySelector('[role="menu"], .dropdown-content');
        if (dropdownContent && dropdownContent.contains(target)) {
          return;
        }
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <DropdownMenuContext.Provider value={{ isOpen, setIsOpen, triggerRef }}>
      <div className="relative">
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
}

export function DropdownMenuTrigger({ asChild, children }: DropdownMenuTriggerProps) {
  const { setIsOpen, triggerRef } = React.useContext(DropdownMenuContext);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    debug.log('DropdownMenuTrigger clicked');
    setIsOpen((prev: boolean) => {
      debug.log('Dropdown state changing from', prev, 'to', !prev);
      return !prev;
    });
  };

  if (asChild) {
    return React.cloneElement(children as React.ReactElement, {
      onClick: (e: React.MouseEvent) => {
        handleClick(e);
        // Call original onClick if it exists
        const originalOnClick = (children as React.ReactElement).props.onClick;
        if (originalOnClick) {
          originalOnClick(e);
        }
      },
      ref: triggerRef,
    });
  }

  return (
    <button ref={triggerRef as any} onClick={handleClick}>
      {children}
    </button>
  );
}

export function DropdownMenuContent({ align = 'start', className, children }: DropdownMenuContentProps) {
  const { isOpen } = React.useContext(DropdownMenuContext);

  if (!isOpen) return null;

  const alignmentClasses = {
    start: 'left-0',
    center: 'left-1/2 transform -translate-x-1/2',
    end: 'right-0',
  };

  return (
    <div
      className={cn(
        'absolute top-full mt-1 z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md',
        'bg-white border-gray-200 text-gray-900',
        alignmentClasses[align],
        className
      )}
      role="menu"
    >
      {children}
    </div>
  );
}

export function DropdownMenuItem({ onClick, className, children, disabled = false }: DropdownMenuItemProps) {
  const { setIsOpen } = React.useContext(DropdownMenuContext);

  const handleClick = (e: React.MouseEvent) => {
    if (disabled) return;
    
    e.preventDefault();
    e.stopPropagation();
    debug.log('DropdownMenuItem clicked');
    
    // Close dropdown first
    setIsOpen(false);
    
    // Then execute onClick after a brief delay to prevent React warning
    if (onClick) {
      setTimeout(() => onClick(), 0);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        'relative flex select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors',
        disabled 
          ? 'cursor-default text-gray-500' 
          : 'cursor-pointer hover:bg-gray-100 focus:bg-gray-100',
        className
      )}
    >
      {children}
    </div>
  );
}

export function DropdownMenuSeparator() {
  return <div className="my-1 h-px bg-gray-200" />;
}