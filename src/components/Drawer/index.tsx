import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils';
import { ReactNode } from 'react';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children?: ReactNode;
  title?: string;
  pb?: number;
  pt?: number;
  px?: number;
  backgroundColor?: string;
}

export default function Drawer({ isOpen, onClose, children, title }: DrawerProps) {
  return (
    <div
      className={cn(
        'absolute overflow-hidden z-50 flex-col right-0 rounded-md',
        isOpen ? 'flex w-full h-full' : 'hidden',
      )}
    >
      <div className="bg-slate-900/50 backdrop-blur-sm absolute top-0 left-0 w-full h-full z-10" onClick={onClose} />
      <div
        className={cn(
          'absolute overflow-hidden z-50 w-full flex flex-col h-full max-w-full rounded-md gap-4 bg-background p-4 transition-all',
          isOpen ? 'right-0' : 'right-full',
        )}
      >
        {title && (
          <div className="flex items-center justify-between">
            <h4>{title}</h4>
          </div>
        )}

        <div className="absolute right-4 top-4">
          <Button variant="ghost" onClick={onClose}>
            <Icons.x className="size-4" />
          </Button>
        </div>

        <div className="h-full flex-1 flex flex-col gap-4">{children}</div>
      </div>
    </div>
  );
}
