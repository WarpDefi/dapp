import { m as Motion } from "framer-motion";
import { styled } from "styled-components";

export const Arrow = styled.div`
  &,
  &::before, &::after {
    position: absolute;
    width: 10px;
    height: 10px;
    border-radius: 2px;
    z-index: -1;
  }

  &::before, &::after {
    content: "";
    transform: rotate(45deg);
    background: ${({ theme }) => theme.tooltip.background};
  }
  &::after {
    background: ${({ theme }) => theme.colors.cardBorder};
    z-index: -2;
  }
`;

export const StyledTooltip = styled(Motion.div)`
  padding: 16px;
  font-size: 16px;
  line-height: 130%;
  border-radius: 8px;
  max-width: 360px;
  z-index: 101;
  background: ${({ theme }) => theme.tooltip.background};
  color: ${({ theme }) => theme.tooltip.text};
  box-shadow: ${({ theme }) => theme.shadows.input};
  border: 2px solid ${({ theme }) => theme.colors.cardBorder};

  &[data-popper-placement^="top"] > ${Arrow} {
    bottom: -4px;
    &:after {
      bottom: -2px;
    }
  }

  &[data-popper-placement^="bottom"] > ${Arrow} {
    top: -4px;
    &:after {
      top: -2px;
    }
  }

  &[data-popper-placement^="left"] > ${Arrow} {
    right: -4px;
    &:after {
      right: -2px;
    }
  }

  &[data-popper-placement^="right"] > ${Arrow} {
    left: -4px;
    &:after {
      left: -2px;
    }
  }

  @media screen and (max-width: 575px) {
    font-size: 15px;
    max-width: 320px;
  }
  @media screen and (max-width: 424px) {
    font-size: 14px;
  }
` as typeof Motion.div;
