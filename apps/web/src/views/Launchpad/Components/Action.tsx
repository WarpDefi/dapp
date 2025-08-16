import { useTranslation } from "@pancakeswap/localization";
import { Box, Button, Flex, OpenNewIcon, Text } from "@pancakeswap/uikit";
import styled from "styled-components";
import { StyledNeubrutal } from "../styles";


const StyledTitle = styled(Text)`
  font-family: 'Metuo', sans-serif;
  font-size: 32px;
  font-weight: 900;
  line-height: calc(40/32);
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 30px;
  @media screen and (max-width: 1439px) {
    font-size: 30px;
  }
  @media screen and (max-width: 1199px) {
    font-size: 28px;
  }
  @media screen and (max-width: 991px) {
    font-size: 26px;
    text-align: center;
    margin-bottom: 16px;
  }
  @media screen and (max-width: 767px) {
    margin-bottom: 12px;
  }
  @media screen and (max-width: 575px) {
    font-size: 24px;
    margin-bottom: 8px;
  }
  @media screen and (max-width: 424px) {
    font-size: 20px;
  }
`
const StyledButton = styled(Button)`
  font-weight: 700;
  height: 42px;
`
const Image = styled.img`
  --size: 20px;
  min-width: var(--size);
  height: var(--size);
  @media screen and (max-width: 991px) {
    --size: 18px;
  }
  @media screen and (max-width: 575px) {
    --size: 16px;
  }
  @media screen and (max-width: 424px) {
    --size: 14px;
  }
`
const StyledText = styled(Text)`
  font-size: 18px;
  font-weight: 600;
  line-height: calc(22/18);
  color: ${({ theme }) => theme.colors.textHighlight};
  margin-left: 12px;
  @media screen and (max-width: 1439px) {
    font-size: 17px;
  }
  @media screen and (max-width: 991px) {
    font-size: 16px;
    margin-left: 10px;
  }
  @media screen and (max-width: 424px) {
    font-size: 15px;
    margin-left: 8px;
  }
`
const StyledItem = styled(Flex)`
  margin-top: 24px;
  @media screen and (max-width: 1439px) {
    margin-top: 20px;
  }
  @media screen and (max-width: 575px) {
    margin-top: 16px;
  }
`

export default function Action() {
  const { t } = useTranslation()

  return (
    <StyledNeubrutal mt="40px" p={["20px", "25px", "30px", "35px", "40px", "50px", "60px"]} style={{ background: 'url(/images/launchpad/action-background.png) center no-repeat', backgroundSize: 'cover' }}>
      <Flex alignItems="center" justifyContent="space-between" flexDirection={["column", "column", "column", "column", "row"]}>
        <Box mr={["0", "0", "0", "0", "60px"]}>
          <StyledTitle>
            {t('Want to launch')}
            <br />
            {t('your project on GroFi Dex?')}
          </StyledTitle>
          {/* <NextLink href=":" passHref> */}
            <StyledButton className="button-hover" display={["none", "none", "none", "none", "inline-flex"]}>
              {t('Apply to Launch')}
              <OpenNewIcon ml="6px" color="black"/>
            </StyledButton>
          {/* </NextLink> */}
        </Box>
        <Flex flex={["1", "1", "1", "1", "1", "unset", "unset"]} flexDirection="column">
          <StyledItem>
            <Image src="/images/launchpad/icon-check.svg" alt="" />
            <StyledText>{t('Multiple layers of Security audit, penetration testing & Incident')}</StyledText>
          </StyledItem>
          <StyledItem>
            <Image src="/images/launchpad/icon-check.svg" alt="" />
            <StyledText>{t(`Maximum protection of investors' interests`)}</StyledText>
          </StyledItem>
          <StyledItem>
            <Image src="/images/launchpad/icon-check.svg" alt="" />
            <StyledText>{t('Unique fictionless token sale process')}</StyledText>
          </StyledItem>
        </Flex>
        <Box mt="24px" display={["block", "block", "block", "block", "none"]}>
          {/* <NextLink href="#" passHref> */}
            <StyledButton className="button-hover">
              {t('Apply to Launch')}
              <OpenNewIcon ml="6px" color="black"/>
            </StyledButton>
          {/* </NextLink> */}
        </Box>
      </Flex>
    </StyledNeubrutal>
  )
}
