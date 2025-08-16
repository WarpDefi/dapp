import { Box } from '@pancakeswap/uikit';
import { css, keyframes, styled } from 'styled-components';

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`

const StyledSVG = styled.svg<{ size: string; stroke?: string }>`
  animation: 2s ${rotate} linear infinite;
  height: ${({ size }) => size};
  width: ${({ size }) => size};
  path {
    stroke: ${({ stroke, theme }) => stroke ?? theme.colors.primary};
  }
`

/**
 * Takes in custom size and stroke for circle color, default to primary color as fill,
 * need ...rest for layered styles on top
 */
export default function Loader({
  size = '16px',
  stroke,
  ...rest
}: {
  size?: string
  stroke?: string
  [k: string]: any
}) {
  return (
    <StyledSVG viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" size={size} stroke={stroke} {...rest}>
      <path
        d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 9.27455 20.9097 6.80375 19.1414 5"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </StyledSVG>
  )
}

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
`

const bounce = keyframes`
  0%, 100% {
    transform: translateY(-20%);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }
  50% {
    transform: translateY(0);
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
`

const Wrapper = styled.div<{ fill: number; height?: string }>`
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme, fill }) => (fill ? 'black' : theme.colors.background)};
  height: 100%;
  width: 100%;
  ${(props) =>
    props.fill && !props.height
      ? css`
          height: 100vh;
        `
      : css`
          height: 180px;
        `}
`

const AnimatedImg = styled.div`
  animation: ${bounce} 500ms linear infinite 1700ms;
  padding-top: 30px;
`

const AnimatedShadow = styled.div`
  animation: ${pulse} 500ms linear infinite;
  width: 50px;
  height: 5px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
`

export const LocalLoader = ({ fill }: { fill: boolean }) => {
  return (
    <Wrapper fill={fill ? 1 : 0}>
      <Box>
        <AnimatedImg>
          <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50" fill="none">
            <mask id="mask0_2003_1021" maskUnits="userSpaceOnUse" x="26" y="0" width="20" height="50">
            <path d="M33.427 37.9906V12.0094L38.5092 14.9368V35.0628L33.427 37.9906ZM26.4795 0.00274467V49.9973L45.4572 39.0653V10.9347L26.4795 0.00274467Z" fill="white"/>
            </mask>
            <g mask="url(#mask0_2003_1021)">
            <path d="M45.4572 0.00274467H26.4795V49.9973H45.4572V0.00274467Z" fill="#8EF102"/>
            </g>
            <path d="M10.6964 14.932V35.0602L15.7831 37.9903V24.6367L22.7295 28.6529V50L3.75 39.0686V10.9314L22.7139 0H22.7295V8.00906L15.7831 12.0019L14.0797 12.9864L10.6964 14.932Z" fill="#8EF102"/>
          </svg>
        </AnimatedImg>
        <AnimatedShadow />
      </Box>
    </Wrapper>
  )
}

const loadingAnimation = keyframes`
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`

export const LoadingRows = styled.div`
  display: grid;
  min-width: 75%;
  max-width: 100%;
  grid-column-gap: 0.5em;
  grid-row-gap: 0.8em;
  grid-template-columns: repeat(1, 1fr);
  & > div {
    animation: ${loadingAnimation} 1.5s infinite;
    animation-fill-mode: both;
    background: linear-gradient(
      to left,
      ${({ theme }) => theme.colors.background} 25%,
      ${({ theme }) => theme.colors.backgroundAlt} 50%,
      ${({ theme }) => theme.colors.backgroundItem} 75%
    );
    background-size: 400%;
    border-radius: 6px;
    height: 2.4em;
    will-change: background-position;
  }
  & > div:nth-child(4n + 1) {
    grid-column: 1 / 3;
  }
  & > div:nth-child(4n) {
    grid-column: 3 / 4;
    margin-bottom: 2em;
  }
`
