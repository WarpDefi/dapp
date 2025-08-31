import { Box } from '@/components/BoxV3';
import { Text } from '@/components/TextV3';
import styled from 'styled-components';

export const HoverWrapper = styled.div`
  --border-size: 5px;
  --b: 3px; /* the border thickness*/
  --g: 2px; /* the gap on hover */
  --border-angle: 0turn;
  padding: calc(var(--g) + var(--b));
  width: 100%;
  /* background-image: conic-gradient(from var(--border-angle), #213, #112 50%, #213),
    conic-gradient(from var(--border-angle), transparent 20%, var(--c), var(--c)); */
  background-size: calc(100% - (var(--border-size) * 2)) calc(100% - (var(--border-size) * 2)), cover;
  background-position: center center;
  background-repeat: no-repeat;
  cursor: pointer;
  animation: bg-spin 6s linear infinite;
  animation-play-state: paused;
  @keyframes bg-spin {
    to {
      --border-angle: 1turn;
    }
  }
  @property --border-angle {
    syntax: '<angle>';
    inherits: true;
    initial-value: 0turn;
  }
  &:hover {
    transition-delay: 1s; /* delays for 1 second */
    -webkit-transition-delay: 1s; /* for Safari & Chrome */

    animation-play-state: running;
  }
`;

export const Card = styled.div`
  border-radius: 10px;
  padding: 32px;
  display: flex;
  flex-direction: row;
  width: 100%;
`;

export const Row = styled(Box)`
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: space-between;
`;

export const BlackBox = styled(Box)`
  border-radius: 7px;
  display: flex;
  flex-direction: row;
`;

export const BlackBoxContent = styled(Text)`
  padding: 0.1rem 1rem;
`;

export const Data = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  padding-right: 30px;
`;

export const DesktopWrapper = styled(Box)`
  display: flex;
`;

export const MobileWrapper = styled(Box)`
  display: none;
`;

export const Panel = styled(Box)`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding: 20px;
  border-radius: 10px;
  * {
    box-sizing: border-box;
  }
`;

export const OptionButton = styled.div`
  font-weight: 500;
  width: fit-content;
  white-space: nowrap;
  padding: 2px 6px;
  border-radius: 6px;
  font-size: 13px;
`;

export const OptionsWrapper = styled.div`
  display: grid;
  align-items: center;
  grid-template-columns: auto auto;
  grid-gap: 10px;
`;
