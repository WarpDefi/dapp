import { Colors } from "../../theme";

export type MenuItemVariant = "default" | "subMenu";

export interface MenuItemProps {
  isActive?: boolean;
  isDisabled?: boolean;
  isHeaderMenu?: boolean;
  href?: string;
  variant?: MenuItemVariant;
  statusColor?: keyof Colors;
  scrollLayerRef?: React.RefObject<HTMLDivElement>;
  type?: number;
}

export type StyledMenuItemProps = {
  $isActive?: boolean;
  $isDisabled?: boolean;
  $isHeaderMenu?: boolean;
  $variant?: MenuItemVariant;
  $statusColor?: keyof Colors;
};
