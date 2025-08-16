import { PositionDetails } from "@pancakeswap/farms";
import { useTranslation } from "@pancakeswap/localization";
import { Box, Button, Flex, PreTitle, Text } from "@pancakeswap/uikit";
import { styled } from "styled-components";

const StyledLightGreyCard = styled("div")`
  padding: 0;
  border: 2px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: ${({ theme }) => theme.radii.card};
  box-shadow: ${({ theme }) => theme.shadows.card};
`
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

interface AvailableFarmingProps {
  lpSymbol: string;
  unstakedPositions: PositionDetails[];
  onClickViewAllButton: () => void;
}

const AvailableFarming: React.FunctionComponent<React.PropsWithChildren<AvailableFarmingProps>> = ({
  lpSymbol,
  unstakedPositions,
  onClickViewAllButton,
}) => {
  const { t } = useTranslation();

  return (
    <Box>
      <PreTitle color="textSubtle" mb="8px">
        {t("%totalAvailableFarm% LP Available for Farming", { totalAvailableFarm: unstakedPositions.length })}
      </PreTitle>
      <StyledLightGreyCard>
        <Flex padding="16px" justifyContent="space-between" flexWrap="wrap">
          <Flex flexDirection="column">
            <Text bold color="textSubtle" mb="4px">
              {lpSymbol}
            </Text>
            <Box>
              {unstakedPositions.map((position) => (
                <Text fontSize="12px" color="textSubtle" key={position.tokenId.toString()}>
                  {`(#${position.tokenId.toString()})`}
                </Text>
              ))}
            </Box>
          </Flex>
          <StyledButton className='button-hover' style={{ alignSelf: "center", whiteSpace: "nowrap" }} onClick={onClickViewAllButton}>
            {t("View All")}
          </StyledButton>
        </Flex>
      </StyledLightGreyCard>
    </Box>
  );
};

export default AvailableFarming;
