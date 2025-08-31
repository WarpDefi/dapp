import styled from 'styled-components';
import { Box } from '../BoxV3';

export const Visible = styled(Box)<{
  upToExtraSmall?: boolean;
  upToSmall?: boolean;
  upToMedium?: boolean;
  upToLarge?: boolean;
}>`
  display: none;
`;
