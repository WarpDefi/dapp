import { BoxProps } from "../Box";
import { MenuItemsType } from "../MenuItems/types";

export interface BottomNavProps extends BoxProps {
  items: MenuItemsType[];
  type?: number;
  activeItem?: string;
  activeSubItem?: string;
}
