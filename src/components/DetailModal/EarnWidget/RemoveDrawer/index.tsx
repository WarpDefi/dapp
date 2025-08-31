import { Modal } from '@/components/ui/modal';
import { FC } from 'react';
import Remove from '../Remove';
import { RemoveDrawerProps } from './types';

const RemoveDrawer: FC<RemoveDrawerProps> = ({ isOpen, position, onClose }) => {
  return (
    <Modal title="Remove" isOpen={isOpen} onClose={onClose}>
      <Remove position={position} />
    </Modal>
  );
};
export default RemoveDrawer;
