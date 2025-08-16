import { useTranslation } from '@pancakeswap/localization'
import { Box, Flex, Text } from '@pancakeswap/uikit'
import Container from 'components/Layout/Container'
import styled, { useTheme } from 'styled-components'
import FormStaking from '../Components/FormStaking'
import FormStakingBtn from '../Components/FormStakingBtn'
import StakingList from '../Components/StakingList'
import { BorderLayout, StakingH1, StakingText } from '../style'

const StyledFlex = styled(Flex)`
  // align-items: center;
  justify-content: space-between;
  // flex-direction: column;
  gap: 0;
  ${({ theme }) => theme.mediaQueries.lg} {
    flex-direction: row;
    gap: 50px;
  }
`
const Image = styled.img`
  --size: 100%;
  height: calc(var(--size) * 300 / 502);
  width: var(--size);
  max-width: 300px;
  margin-top: 30px;
  display: none;
  ${({ theme }) => theme.mediaQueries.sm} {
    --size: 342px;
    max-width: 100%;
  }
  ${({ theme }) => theme.mediaQueries.lg} {
    --size: 502px;
    // min-width: var(--size);
    margin-top: 16px;
    display: block;
    max-height: 250px;
  }
  ${({ theme }) => theme.mediaQueries.xl} {
    max-height: 275px;
  }
  ${({ theme }) => theme.mediaQueries.xxl} {
    max-height: 300px;
  }
`

export const Overview: React.FC<React.PropsWithChildren> = () => {
  const { t } = useTranslation()
  const theme = useTheme()

  return (
    <>
      <Container>
        <Box
          className='border-neubrutal'
          my="32px"
          background={theme.colors.backgroundAlt}
          borderRadius={theme.radii.card}
          p={['20px', '20px', '20px 30px', '20px 30px', '0 40px']}
        >
          <StyledFlex>
            <Box maxWidth={["100%", "100%", "100%", "100%", "620px"]} py={["0", "0", "0", "0", "30px"]}>
              <StakingH1 as="h1" scale="xxl" color="text" mb="24px">
                {t('Become a participant on our journey')}
              </StakingH1>
              <StakingText>
                {t(
                  'Staking is simple and accessible process. You can contribute to the security and stability of the U2U Network while earning U2U Tokens as Reward.',
                )}
              </StakingText>
            </Box>
            <Image src="/images/staking/staking-banner-image.png" alt="" />
          </StyledFlex>
        </Box>
        <Flex
          flexDirection={['column', 'column', 'column', 'column', 'row']}
          justifyContent="center"
          position="relative"
          alignItems="flex-start"
          width="100%"
          style={{ gap: '16px' }}
          py={["24px", "24px", "16px", "16px"]}
        >
          <Flex
            flexDirection="column"
            order={['2', '2', '2', '2', '1']}
            width={['100%', '100%', '100%', '100%', 'auto']}
            flex={1}
          >
            <StakingList />
          </Flex>
          <Flex
            flexDirection="column"
            order={['1', '1', '1', '1', '2']}
            width={['100%', '100%', '100%', '100%', '360px', '360px', '420px', '420px']}
            mb={['20px', '20px', '24px', '24px', '0']}
          >
            <BorderLayout p={["24px 16px", "24px 16px", "30px 16px"]} m="auto" width={["100%", "100%", "400px", "400px", "100%"]}>
              <Text fontFamily="'Metuo', sans-serif" fontSize={["20px", "20px", "24px"]} fontWeight="900" mb={["20px", "20px", "28px", "28px","36px"]}>
                {t('Staking')}
              </Text>
              <FormStaking />
              <FormStakingBtn />
            </BorderLayout>
          </Flex>
        </Flex>
      </Container>
    </>
  )
}
