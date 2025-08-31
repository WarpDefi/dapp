import { PositionDetails } from 'src/state/wallet/types';

export type IncreasePositionProps = {
  isOpen: boolean;
  position?: PositionDetails;
  onClose: () => void;
};
