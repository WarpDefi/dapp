import React, { ReactNode } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/utils';

interface ModalProps {
  title: string | ReactNode;
  description?: string;
  isOpen: boolean;
  onClose: () => void;
  children?: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  maxWidth?: string;
  maxHeight?: string;
}

export const Modal = ({
  title,
  description,
  isOpen,
  onClose,
  children,
  footer,
  size = 'md',
  maxWidth,
  maxHeight,
}: ModalProps) => {
  const onChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onChange}>
      <DialogContent
        className={cn(
          'max-h-full overflow-y-auto',
          size === 'sm' && 'max-w-sm',
          size === 'md' && 'max-w-md md:max-w-lg',
          size === 'lg' && 'max-w-[95vw] sm:max-w-2xl md:max-w-4xl lg:max-w-6xl',
        )}
        style={{
          ...(maxWidth && { maxWidth }),
          ...(maxHeight && { maxHeight }),
        }}
      >
        <DialogHeader>
          <DialogTitle className="p-0">
            <h4>{title}</h4>
          </DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {title ? <Separator /> : null}
        <>{children}</>
        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
};
