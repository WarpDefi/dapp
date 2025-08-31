export type SidebarProps = {
  setMenu: (value: string) => void;
  changeAddLiquidityModalStatus: () => void;
  activeMenu: string;
  menuItems: Array<{ label: string; value: string }>;
};

export enum MenuType {
  allpools = 'allpools',
  v3pools = 'v3pools',
  v2pools = 'v2pools',
  allPositions = 'allPositions',
  openPositions = 'openPositions',
  closedPositions = 'closedPositions',
}
