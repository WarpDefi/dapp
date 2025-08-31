import get from 'lodash.get';
import styled from 'styled-components';
import { PositionProps, SpaceProps, TypographyProps, position, space, typography } from 'styled-system';

export interface TextProps {
  color?: string;
  cursor?: string;
}

const Text = styled.div<TextProps & TypographyProps & SpaceProps & PositionProps>`
  ${space}
  ${typography}
  ${position}
  color: ${({ color, theme }) => color && (get(theme, color, color) as string)};
  cursor: ${props => props.cursor && props.cursor};
`;

// responsive text
export const Label = styled.small<{ end?: number }>`
  display: flex;
  font-size: 16px;
  font-weight: 400;
  justify-content: ${({ end }) => (end ? 'flex-end' : 'flex-start')};
  align-items: center;
  font-variant-numeric: tabular-nums;
  @media screen and (max-width: 640px) {
    font-size: 14px;
  }
`;

export const ClickableText = styled(Label)`
  text-align: end;
  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }
  user-select: none;
  @media screen and (max-width: 640px) {
    font-size: 12px;
  }
`;

export default Text;
