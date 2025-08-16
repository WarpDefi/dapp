import { styled } from "styled-components";
import { borderColor, color } from "styled-system";
import { TabProps } from "./types";

const getBorderRadius = ({ scale }: TabProps) => (scale === "md" ? "8px" : "24px");

const getPadding = ({ scale }: TabProps) => (scale === "md" ? "8px" : "16px");

const Tab = styled.button<TabProps>`
  font-family: 'Metuo', sans-serif;
  text-transform: uppercase;
  display: inline-flex;
  justify-content: center;
  cursor: pointer;
  border: 0;
  outline: 0;
  flex-grow: 1;
  padding: 12px 8px;
  border-radius: ${({ isCustom }) => (isCustom ? "0" : `6px`)};
  font-size: 16px;
  font-weight: 900;
  // border: ${({ isCustom }) => (isCustom ? "0" : "2px solid")};
  border-bottom: ${({ isCustom }) => (isCustom ? "1px solid" : "0")};
  // margin: ${({ isCustom }) => (isCustom ? "0" : "-2px")};

  ${({ theme }) => theme.mediaQueries.md} {
    flex-grow: 0;
  }

  ${color}
  ${borderColor}
  &:hover {
    color: ${({ isCustom, theme }) => (isCustom ? theme.colors.hover : "inherit")};
  }

  @media screen and (max-width: 575px) {
    --rounded: 6px;
    font-size: 15px;
    padding: 10px 8px;
  }
`;

Tab.defaultProps = {
  scale: "md",
};

export default Tab;
