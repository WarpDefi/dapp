import { useTranslation } from "@pancakeswap/localization";
import { Balance, Button, Flex, Text } from "@pancakeswap/uikit";
import styled from "styled-components";
import { ActionContent, ActionTitles } from "./styles";

const StyledButton = styled(Button)`
  @media screen and (max-width: 991px) {
    height: 44px;
  }
  @media screen and (max-width: 575px) {
    height: 40px;
  }
`

export interface HarvestActionProps {
  earnings: number;
  earningsBusd: number;
  pendingTx: boolean;
  userDataReady: boolean;
  handleHarvest: () => void;
  disabled?: boolean;
}

const HarvestAction: React.FunctionComponent<React.PropsWithChildren<HarvestActionProps>> = ({
  earnings,
  earningsBusd,
  pendingTx,
  userDataReady,
  handleHarvest,
  disabled,
}) => {
  const { t } = useTranslation();

  return (
    <Flex height="100%" flexDirection="column" width="100%">
      <ActionTitles>
        <Text bold textTransform="uppercase" color="secondary" fontSize="12px" pr="4px">
          U2U
        </Text>
        <Text bold textTransform="uppercase" color="textSubtle" fontSize="12px">
          {t("Earned")}
        </Text>
      </ActionTitles>
      <ActionContent style={{ height: "100%" }}>
        <div>
          <Balance fontSize={20} bold decimals={4} value={earnings} />
          {earningsBusd > 0 && (
            <Balance fontSize="12px" color="textSubtle" decimals={4} value={earningsBusd} unit=" USD" prefix="~" />
          )}
        </div>
        <StyledButton
          className="button-hover"
          ml="4px"
          disabled={pendingTx || !userDataReady || disabled}
          onClick={handleHarvest}
        >
          {pendingTx ? t("Harvesting") : t("Harvest")}
        </StyledButton>
      </ActionContent>
    </Flex>
  );
};

export default HarvestAction;
