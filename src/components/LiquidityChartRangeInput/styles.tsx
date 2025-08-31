import styled from 'styled-components';
import { Button } from '../ButtonV3';

export const ChartWrapper = styled.div`
  position: relative;

  justify-content: center;
  align-content: center;
`;

export const StyledLine = styled.line`
  opacity: 0.5;
  stroke-width: 2;
  stroke: black;
  fill: none;
`;

export const Handle = styled.path<{ color: string }>`
  cursor: ew-resize;
  pointer-events: none;

  stroke-width: 3;
  stroke: ${({ color }) => color};
  fill: ${({ color }) => color};
`;

export const HandleAccent = styled.path`
  cursor: ew-resize;
  pointer-events: none;

  stroke-width: 1.5;
  stroke: ${({ theme }) => theme?.text1};
`;

export const LabelGroup = styled.g<{ visible: boolean }>`
  opacity: ${({ visible }) => (visible ? '1' : '0')};
  transition: opacity 300ms;
`;

export const TooltipBackground = styled.rect`
  fill: ${({ theme }) => theme?.text1};
`;

export const Tooltip = styled.text`
  text-anchor: middle;
  font-size: 13px;
  fill: ${({ theme }) => theme?.text1};
`;

export const StyledGroup = styled.g`
  line {
    display: none;
  }

  text {
    transform: translateY(5px);
  }
`;

export const Path = styled.path<{ fill: string | undefined }>`
  opacity: 0.5;
  stroke: ${({ fill, theme }) => fill ?? theme?.text1};
  fill: ${({ fill, theme }) => fill ?? theme?.text1};
`;

export const ZoomWrapper = styled.div<{ count: number }>`
  display: grid;
  grid-template-columns: repeat(${({ count }) => count.toString()}, 20px);
  grid-gap: 6px;
  justify-content: end;
  top: -28px;
  right: 0;
`;

export const CustomButton = styled(Button)`
  width: 32px;
  height: 32px;
  padding: 4px;
`;

export const ZoomOverlay = styled.rect`
  fill: transparent;
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
`;
