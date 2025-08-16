import { useTranslation } from "@pancakeswap/localization";
import { useCallback } from "react";
import { styled } from "styled-components";
import { ChevronDownIcon, ChevronUpIcon } from "../Svg";
import { Text } from "../Text";

export interface ExpandableSectionButtonProps {
  onClick?: () => void;
  expanded?: boolean;
}

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  div {
    color: ${({ theme }) => theme.colors.primary};
  }
  svg {
    fill: ${({ theme }) => theme.colors.primary};
  }
  &:hover {
    div {
      color: ${({ theme }) => theme.colors.hover};
    }
    svg {
      fill: ${({ theme }) => theme.colors.hover};
    }
  }
`;

const ExpandableSectionButton: React.FC<React.PropsWithChildren<ExpandableSectionButtonProps>> = ({
  onClick,
  expanded = false,
}) => {
  const { t } = useTranslation();
  const handleOnClick = useCallback(() => onClick?.(), [onClick]);

  return (
    <Wrapper aria-label={t("Hide or show expandable content")} role="button" onClick={handleOnClick}>
      <Text bold>{expanded ? t("Hide") : t("Details")}</Text>
      {expanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
    </Wrapper>
  );
};

export default ExpandableSectionButton;
