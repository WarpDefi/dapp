import React from "react";
import styled, { keyframes } from "styled-components";
import { Box } from "../Box";
import { SpinnerProps } from "./types";

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
`;

const bounce = keyframes`
  0%, 100% {
    transform: translateY(-25%);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }
  50% {
    transform: translateY(0);
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
`;
const AnimatedImg = styled.div`
  animation: ${bounce} 500ms linear infinite 1700ms;
  padding-top: 30px;
`;

const AnimatedShadow = styled.div`
  animation: ${pulse} 500ms linear infinite;
  width: 50px;
  height: 5px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
`;

const Spinner: React.FC<React.PropsWithChildren<SpinnerProps>> = ({ size = 50 }) => {
  return (
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
  );
};

export default Spinner;
