import React, { useEffect, useState } from "react";
import { usePopper } from "react-popper";
import { styled } from "styled-components";
import { Box, Flex } from "../../../../components/Box";
import { ChevronDownIcon } from "../../../../components/Svg";
import MenuIcon from "./MenuIcon";
import { UserMenuItem } from "./styles";
import { UserMenuProps, variants } from "./types";

export const StyledUserMenu = styled(Flex)`
  align-items: center;
  background-color: ${({ theme }) => theme.colors.backgroundItem};
  border-radius: 8px;
  border: 2px solid ${({ theme }) => theme.colors.cardBorder};
  cursor: pointer;
  display: inline-flex;
  padding: 8px 8px 8px 24px;
  position: relative;
  height: 36px;
  white-space: nowrap;

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.button};
    color: ${({ theme }) => theme.colors.black};
    opacity: 0.8;
  }
  ${({ theme }) => theme.mediaQueries.sm} {
    padding: 8px 8px 8px 32px;
  }
`;

export const LabelText = styled.div`
  color: ${({ theme }) => theme.colors.text};
  display: none;
  font-size: 15px;

  ${({ theme }) => theme.mediaQueries.sm} {
    display: block;
    margin-left: 8px;
    margin-right: 4px;
  }
`;

const Menu = styled.div<{ $isOpen: boolean }>`
  background-color: ${({ theme }) => theme.colors.backgroundItem};
  // border: 2px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 8px;
  padding-bottom: 4px;
  padding-top: 4px;
  pointer-events: auto;
  width: 280px;
  visibility: visible;
  z-index: 1001;
  box-shadow: ${({ theme }) => theme.shadows.dropdown};
  ${({ $isOpen }) =>
    !$isOpen &&
    `
    pointer-events: none;
    visibility: hidden;
  `}

  ${UserMenuItem}:first-child {
    border-radius: 8px 8px 0 0;
  }

  ${UserMenuItem}:last-child {
    border-radius: 0 0 8px 8px;
  }

  // ${({ theme }) => theme.mediaQueries.sm} {
  //   backdrop-filter: blur(12px) saturate(200%) contrast(80%) brightness(80%);
  //   background-color: ${({ theme }) => theme.colors.dropdownBlur};
  // }
`;
const StyledArrowIcon = styled.div`
  display: none;
  ${({ theme }) => theme.mediaQueries.sm} {
    display: block;
  }
`;

const UserMenu: React.FC<UserMenuProps> = ({
  account,
  text,
  avatarSrc,
  avatarClassName,
  variant = variants.DEFAULT,
  children,
  disabled,
  placement = "bottom-end",
  recalculatePopover,
  ellipsis = true,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [targetRef, setTargetRef] = useState<HTMLDivElement | null>(null);
  const [tooltipRef, setTooltipRef] = useState<HTMLDivElement | null>(null);

  const { styles, attributes, update } = usePopper(targetRef, tooltipRef, {
    strategy: "fixed",
    placement,
    modifiers: [{ name: "offset", options: { offset: [0, 0] } }],
  });

  const accountEllipsis = account ? `${account.substring(0, 2)}...${account.substring(account.length - 4)}` : null;

  // recalculate the popover position
  useEffect(() => {
    if (recalculatePopover && isOpen && update) update();
  }, [isOpen, update, recalculatePopover]);

  useEffect(() => {
    const showDropdownMenu = () => {
      setIsOpen(true);
    };

    const hideDropdownMenu = (evt: MouseEvent | TouchEvent) => {
      const target = evt.target as Node;
      if (target && !tooltipRef?.contains(target)) {
        setIsOpen(false);
        evt.stopPropagation();
      }
    };

    targetRef?.addEventListener("mouseenter", showDropdownMenu);
    targetRef?.addEventListener("mouseleave", hideDropdownMenu);

    return () => {
      targetRef?.removeEventListener("mouseenter", showDropdownMenu);
      targetRef?.removeEventListener("mouseleave", hideDropdownMenu);
    };
  }, [targetRef, tooltipRef, setIsOpen]);

  return (
    <Flex alignItems="center" height="100%" ref={setTargetRef} {...props}>
      <StyledUserMenu
        onTouchStart={() => {
          setIsOpen((s) => !s);
        }}
      >
        <MenuIcon className={avatarClassName} avatarSrc={avatarSrc} variant={variant} />
        <LabelText title={typeof text === "string" ? text || account : account}>
          {text || (ellipsis ? accountEllipsis : account)}
        </LabelText>
        <StyledArrowIcon>{!disabled && <ChevronDownIcon color="text" width="24px" />}</StyledArrowIcon>
      </StyledUserMenu>
      {!disabled && (
        <Menu style={styles.popper} ref={setTooltipRef} {...attributes.popper} $isOpen={isOpen}>
          <Box onClick={() => setIsOpen(false)}>{children?.({ isOpen })}</Box>
        </Menu>
      )}
    </Flex>
  );
};

export default UserMenu;
