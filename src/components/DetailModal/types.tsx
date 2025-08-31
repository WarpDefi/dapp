import { PositionDetails } from 'src/state/wallet/types';

export type DetailModalProps = {
  isOpen: boolean;
  position?: PositionDetails;
  addModal: () => void;
  onClose: () => void;
};

export type StatItemProps = {
  title: string;
  stat: string;
};
