import React from "react";
import Svg from "../Svg";
import { SvgProps } from "../types";

const Icon: React.FC<React.PropsWithChildren<SvgProps>> = (props) => {
  return (
    <Svg xmlns="http://www.w3.org/2000/svg" width={props.width || 24} height={props.height || 24} {...props} viewBox="0 0 40 40" fill="none">
    <mask id="mask0_2004_1107" maskUnits="userSpaceOnUse" x="21" y="0" width="16" height="40">
    <path d="M26.7416 30.3925V9.60755L30.8073 11.9494V28.0502L26.7416 30.3925ZM21.1836 0.00219727V39.9978L36.3657 31.2523V8.74776L21.1836 0.00219727Z" fill="white"/>
    </mask>
    <g mask="url(#mask0_2004_1107)">
    <path d="M36.3657 0.00219727H21.1836V39.9978H36.3657V0.00219727Z" fill="url(#paint0_linear_2004_1107)"/>
    </g>
    <path d="M8.55712 11.9456V28.0481L12.6265 30.3922V19.7093L18.1836 22.9223V40L3 31.2549V8.74512L18.1711 0H18.1836V6.40725L12.6265 9.6015L11.2638 10.3891L8.55712 11.9456Z" fill="#8EF102"/>
    <defs>
    <linearGradient id="paint0_linear_2004_1107" x1="21.2463" y1="20.8431" x2="36.5271" y2="20.8431" gradientUnits="userSpaceOnUse">
    <stop stop-color="#8EF102"/>
    <stop offset="1" stop-color="#528B01"/>
    </linearGradient>
    </defs>
    </Svg>
  );
};

export default Icon;
