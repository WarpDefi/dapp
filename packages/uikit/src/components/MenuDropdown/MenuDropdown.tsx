import React from "react";
import styled from "styled-components";
import Button from "../Button/Button";
import Dropdown from "../Dropdown/Dropdown";
import { Position } from "../Dropdown/types";
import MenuItems from "../MenuItems";
import { ChevronDownIcon } from "../Svg";

const StyledMenuItems = styled(MenuItems)`
  flex-direction: column;
  min-width: 110px;
  padding: 10px;
  bottom: -135px;
  > div {
    padding: 0;
    a {
      // color: ${({ theme }) => theme.colors.text};
    }
  }
`
const StyledButton = styled(Button)`
  color: ${({ theme }) => theme.colors.textSubtle};
  font-size: 16px;
  font-weight: 400;
  padding: 0 16px;
  @media screen and (max-width: 991px) and (min-width: 1200px) {
    display: none;
  }
  &:hover {
    color: ${({ theme }) => theme.colors.hover};
  }
  svg {
    margin-left: 4px;
  }
`

interface Props {
  dropdownPosition?: Position;
  items: any;
  activeItem?: string;
  activeSubItem?: string;
}

const MenuDropdown: React.FC<React.PropsWithChildren<Props>> = ({
  items = [],
  activeItem,
  activeSubItem,
  dropdownPosition = "bottom-left",
}) => (
  <Dropdown
    position={dropdownPosition}
    target={
      <StyledButton scale="md" variant="text" endIcon={<ChevronDownIcon color="currentColor" />}>
        More
      </StyledButton>
    }
  >
    <StyledMenuItems items={items} activeItem={activeItem} activeSubItem={activeSubItem} headerMenu/>
  </Dropdown>
)

export default React.memo(MenuDropdown);
