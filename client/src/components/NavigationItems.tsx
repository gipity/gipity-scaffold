import { Button } from '@/components/ui/button';
import { NavigationItem } from '@shared/navigation-config';

interface NavigationItemsProps {
  items: NavigationItem[];
  layout: 'desktop' | 'mobile';
  onNavigate?: (path: string) => void;
  onClose?: () => void;
  handlers?: Record<string, (e?: any) => void>;
}

export function NavigationItems({ 
  items, 
  layout, 
  onNavigate, 
  onClose, 
  handlers = {} 
}: NavigationItemsProps) {
  const handleClick = (item: NavigationItem, e?: any) => {
    if (item.onClick && handlers[item.onClick]) {
      handlers[item.onClick](e);
    } else if (item.path && onNavigate) {
      onNavigate(item.path);
    }
    
    if (onClose) {
      onClose();
    }
  };

  const getButtonClassName = (item: NavigationItem) => {
    const baseClass = item.className || '';
    
    if (layout === 'mobile') {
      return `w-full justify-start ${baseClass}`;
    }
    
    return baseClass;
  };

  return (
    <>
      {items.map((item) => (
        <Button
          key={item.id}
          variant={item.variant || 'ghost'}
          size="sm"
          onClick={(e) => handleClick(item, e)}
          className={getButtonClassName(item)}
        >
          {item.label}
        </Button>
      ))}
    </>
  );
}