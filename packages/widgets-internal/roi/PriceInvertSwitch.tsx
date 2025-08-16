import { useTranslation } from "@pancakeswap/localization";
import { Currency } from "@pancakeswap/sdk";
import { memo } from "react";
import { styled } from "styled-components";

import { Button, Flex, SyncAltIcon, Text } from "@pancakeswap/uikit";

const StyledButton = styled(Button)`
  border-radius: 8px;
  padding: 0 0.5em;
  font-size: 12px;
  svg {
    fill: ${({ theme }) => theme.colors.primary};
  }
  &:hover {
    svg {
      fill: ${({ theme }) => theme.colors.black};
    }
  }
  
  @media screen and (max-width: 575px) {
    border-radius: 6px;
  }
`;

interface Props {
  baseCurrency?: Currency | null;
  onSwitch?: () => void;
}

export const PriceInvertSwitch = memo(function PriceInvertSwitch({ baseCurrency, onSwitch }: Props) {
  const { t } = useTranslation();

  if (!baseCurrency) {
    return null;
  }

  return (
    <Flex justifyContent="flex-end" alignItems="center" mb="0.5em">
      <Text mr="0.5em" color="textSubtle" fontSize="14px">
        {t("View prices in")}
      </Text>
      <StyledButton
        variant="secondary"
        scale="sm"
        onClick={onSwitch}
        startIcon={<SyncAltIcon width="14px" />}
        className="button-hover"
      >
        {baseCurrency.symbol}
      </StyledButton>
    </Flex>
  );
});
