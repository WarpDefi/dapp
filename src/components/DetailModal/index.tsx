import { Modal } from '@/components/ui/modal';
import { Token } from '@pangolindex/sdk';
import { useWindowSize } from 'react-use';
import Header from './Header';
import DetailTab from './Tabs/DetailTab';
import { DetailModalProps } from './types';

const DetailModal = ({ isOpen, position, addModal, onClose }: DetailModalProps) => {
  const { height } = useWindowSize();

  const headerArgs = {
    token0: position?.token0 as Token,
    token1: position?.token1 as Token,
    statItems: [],
    addModal,
    onClose,
    position,
  };

  return (
    <Modal title="Position Detail" isOpen={isOpen} onClose={onClose} size="lg">
      <div className="bg-background overflow-y-auto rounded-lg flex flex-col gap-4" style={{ maxHeight: height - 150 }}>
        <Header {...headerArgs} />
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4">
            <DetailTab position={position} />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default DetailModal;
