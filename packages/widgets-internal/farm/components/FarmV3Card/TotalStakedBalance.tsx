import { PositionDetails } from "@pancakeswap/farms";
import { useTranslation } from "@pancakeswap/localization";
import { Balance, Box, Button, Flex, Heading, PreTitle, Text } from "@pancakeswap/uikit";
import { styled } from "styled-components";

const LightGreyCard = styled("div")`
  padding: 0;
  border: 2px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: ${({ theme }) => theme.radii.card};
  box-shadow: ${({ theme }) => theme.shadows.card};
`;
const StyledButton = styled(Button)`
  @media screen and (max-width: 991px) {
    height: 44px;
    padding: 0 20px;
  }
  @media screen and (max-width: 575px) {
    height: 40px;
    padding: 0 16px;
  }
`

interface TotalStakedBalanceProps {
  stakedPositions: PositionDetails[];
  earnings: number;
  earningsBusd: number;
  onClickViewAllButton: () => void;
}

const TotalStakedBalance: React.FunctionComponent<React.PropsWithChildren<TotalStakedBalanceProps>> = ({
  stakedPositions,
  earnings,
  earningsBusd,
  onClickViewAllButton,
}) => {
  const { t } = useTranslation();

  return (
    <Box mt="24px">
      <PreTitle color="textSubtle" mb="8px">
        {t("%totalStakedFarm% Staked Farming", { totalStakedFarm: stakedPositions.length })}
      </PreTitle>
      <LightGreyCard>
        <Flex padding="16px" justifyContent="space-between">
          <Flex flexDirection="column">
            <Flex>
              <Text bold textTransform="uppercase" color="textSubtle" fontSize="12px" pr="4px">
                U2U
              </Text>
              <Text bold textTransform="uppercase" color="textSubtle" fontSize="12px">
                {t("Earned")}
              </Text>
            </Flex>
            <Box>
              <Flex flexDirection="column" alignItems="flex-start">
                <Heading>{earnings}</Heading>
                <Balance fontSize="12px" color="textSubtle" decimals={2} value={earningsBusd} unit=" USD" prefix="~" />
              </Flex>
            </Box>
          </Flex>
          <StyledButton
            className="button-hover"
            style={{ alignSelf: "center", whiteSpace: "nowrap" }}
            onClick={onClickViewAllButton}
          >
            {t("View All")}
          </StyledButton>
        </Flex>
      </LightGreyCard>
    </Box>
  );
};

export default TotalStakedBalance;
