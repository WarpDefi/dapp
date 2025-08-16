export type Position = "top" | "top-right" | "bottom" | "bottom-left" | "bottom-right";

export interface PositionProps {
  position?: Position;
}

export interface DropdownProps extends PositionProps {
  target: React.ReactElement;
}
