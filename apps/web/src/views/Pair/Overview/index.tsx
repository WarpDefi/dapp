import { useTranslation } from '@pancakeswap/localization'
import { Box, Button, Flex, Heading, Tab, TabMenu, Text } from '@pancakeswap/uikit'
import replaceBrowserHistory from '@pancakeswap/utils/replaceBrowserHistory'
import Container from 'components/Layout/Container'
import InternalLink from 'components/Links'
import { useRouter } from 'next/router'
import Liquidity from 'pages/liquidity'
import { useEffect, useState } from 'react'
import styled from 'styled-components'
import Pools from 'views/V3Info/views/PoolsPage'

const BorderLayout = styled(Box)`
  border: 2px solid ${({ theme }) => theme.colors.cardBorder};
  box-shadow: ${({ theme }) => theme.shadows.card};
  border-radius: 8px;
`
const Image = styled.img`
  --size: 100%;
  display: block;
  height: calc(var(--size) * 278 / 450);
  width: var(--size);
  max-width: 300px;
  margin-top: 30px;
  display: none;
  ${({ theme }) => theme.mediaQueries.sm} {
    --size: 350px;
    max-width: 100%;
  }
  ${({ theme }) => theme.mediaQueries.lg} {
    --size: 366px;
    min-width: var(--size);
    margin-top: 0;
    display: block;
    max-height: 226px;
  }
  ${({ theme }) => theme.mediaQueries.xl} {
    --size: 407px;
    max-height: 251px;
  }
  ${({ theme }) => theme.mediaQueries.xxl} {
    --size: 448px;
    max-height: 276px;
  }
`
const ImageIcon = styled.img`
  --size: 74px;
  height: calc(var(--size) * 94 / 134);
  min-width: var(--size);
  ${({ theme }) => theme.mediaQueries.sm} {
    --size: 94px;
  }
  ${({ theme }) => theme.mediaQueries.md} {
    --size: 114px;
  }
  ${({ theme }) => theme.mediaQueries.lg} {
    --size: 134px;
  }
`
const StyledFlex = styled(Flex)`
  justify-content: space-between;
  // flex-direction: column;
  gap: 0;
  ${({ theme }) => theme.mediaQueries.lg} {
    flex-direction: row;
    gap: 50px;
  }
`
const StyledHeading = styled(Heading)`
  font-size: 24px;
  font-weight: 700;
  line-height: calc(56 / 52);
  margin-bottom: 12px;
  ${({ theme }) => theme.mediaQueries.sm} {
    font-size: 32px;
    font-weight: 900;
    margin-bottom: 16px;
  }
  ${({ theme }) => theme.mediaQueries.lg} {
    font-size: 36px;
    margin-bottom: 20px;
  }
  ${({ theme }) => theme.mediaQueries.xl} {
    font-size: 44px;
  }
  ${({ theme }) => theme.mediaQueries.xxl} {
    font-size: 52px;
  }
`
const StyledButton = styled(Button)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${({ theme }) => theme.colors.hover};
  padding: 10px 20px;
  height: 50px;
  width: 100%;
  font-size: 15px;
  box-shadow: ${({ theme }) => theme.shadows.card};
  ${({ theme }) => theme.mediaQueries.sm} {
    padding: 10px 20px;
    height: 60px;
    font-size: 16px;
  }
  ${({ theme }) => theme.mediaQueries.md} {
    padding: 15px 30px;
    height: 70px;
  }
  ${({ theme }) => theme.mediaQueries.lg} {
    padding: 20px 40px;
    height: 80px;
    font-size: 18px;
  }
  
  @media screen and (max-width: 424px) {
    width: 100%;
  }
`
const StylesInternalLink = styled(InternalLink)`
  &:hover {
    text-decoration: none;
  }
`
const StyledTab = styled(Tab)`
  text-transform: capitalize;
  font-size: 20px;
  align-items: center;
  padding: 12px;
  font-weight: 700;
  margin-left: 0 !important;
  @media screen and (max-width: 991px) {
    font-size: 18px;
    padding: 10px 12px;
  }
  @media screen and (max-width: 424px) {
    font-size: 16px;
    padding: 8px 12px;
  }
  svg {
    --size: 24px;
    width: var(--size);
    height: var(--size);
    margin-right: 10px;
    @media screen and (max-width: 991px) {
      --size: 20px;
      margin-right: 8px;
    }
    @media screen and (max-width: 424px) {
      --size: 16px;
      margin-right: 6px;
    }
  }
`

export const Overview = () => {
  const { t } = useTranslation()
  const [tab, setTab] = useState(0)
  const { query } = useRouter()

  const handleTypeChange = (index: number) => {
    setTab(index)
    replaceBrowserHistory('tab', tab)
  }

  useEffect(() => {
    if (query?.tab) {
      setTab(Number(query.tab))
    }
  }, [query.tab])
  return (
    <>
      <Container>
        <BorderLayout
          p={['20px', '20px', '20px 30px', '20px 30px', '20px 40px']}
          my="32px"
          background="var(--colors-backgroundAlt)"
        >
          <StyledFlex>
            <Box py={["0", "0", "0", "0", "10px"]}>
              <StyledHeading maxWidth={["100%", "100%", "560px", "560px", "620px"]}>{t('Put your funds to work by providing liquidity.')}</StyledHeading>
              <Text maxWidth={["100%", "100%", "400px", "400px", "490px"]} mb="10px" fontSize={['14px', '14px', '16px', '16px', '18px', '18px', '18px', '20px']} fontWeight={["500", "500", "600"]} color="textSubtle">
                {t(
                  'When you add liquidity to a pair, you can receive a share of its trading volume and potentially snag extra rewards when there are incentives involved!',
                )}
              </Text>
            </Box>
            <Image src="/images/pair/pair-banner-image.png" />
          </StyledFlex>
        </BorderLayout>
        <Box width={["fit-content", "50%"]} mb={['20px', '30px', '30px', '40px', '50px']}>
          <StylesInternalLink href="/add">
            <StyledButton>
              {t('Add Liquidity')}
              <ImageIcon src="/images/pair/pair-icon.svg" />
            </StyledButton>
          </StylesInternalLink>
        </Box>
        <TabMenu customWidth isShowBorderBottom={false} activeIndex={tab} onItemClick={handleTypeChange}>
          <StyledTab>
            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25" fill="none">
              <g clip-path="url(#clip0_1659_9503)">
              <path d="M7.4082 18.0339H1.7832C1.53456 18.0339 1.29611 17.9351 1.12029 17.7593C0.944475 17.5835 0.845703 17.345 0.845703 17.0964C0.845703 16.8477 0.944475 16.6093 1.12029 16.4335C1.29611 16.2576 1.53456 16.1589 1.7832 16.1589H7.4082C9.40977 16.1589 11.0387 14.5684 11.0387 12.6133C11.0387 10.6581 9.40977 9.06763 7.4082 9.06763H1.7832C1.53456 9.06763 1.29611 8.96885 1.12029 8.79304C0.944475 8.61722 0.845703 8.37877 0.845703 8.13013C0.845703 7.88149 0.944475 7.64303 1.12029 7.46721C1.29611 7.2914 1.53456 7.19263 1.7832 7.19263H7.4082C10.4438 7.19263 12.9137 9.6245 12.9137 12.6133C12.9137 15.602 10.4438 18.0339 7.4082 18.0339Z" fill="currentColor"/>
              <path d="M22.1969 18.0339H16.5719C13.5362 18.0339 11.0664 15.602 11.0664 12.6133C11.0664 9.6245 13.5362 7.19263 16.5719 7.19263H22.1969C22.4455 7.19263 22.684 7.2914 22.8598 7.46721C23.0356 7.64303 23.1344 7.88149 23.1344 8.13013C23.1344 8.37877 23.0356 8.61722 22.8598 8.79304C22.684 8.96885 22.4455 9.06763 22.1969 9.06763H16.5719C14.5698 9.06763 12.9414 10.6581 12.9414 12.6133C12.9414 14.5684 14.5698 16.1589 16.5719 16.1589H22.1969C22.4455 16.1589 22.684 16.2576 22.8598 16.4335C23.0356 16.6093 23.1344 16.8477 23.1344 17.0964C23.1344 17.345 23.0356 17.5835 22.8598 17.7593C22.684 17.9351 22.4455 18.0339 22.1969 18.0339Z" fill="currentColor"/>
              <path d="M21.2229 11.9439C21.0371 11.9439 20.8554 11.8887 20.7009 11.7853C20.5465 11.6818 20.4263 11.5348 20.3556 11.3629C20.2849 11.191 20.2669 11.0019 20.3039 10.8197C20.3409 10.6376 20.4313 10.4705 20.5634 10.3398L22.7965 8.13012L20.5634 5.92043C20.3866 5.74551 20.2866 5.50753 20.2853 5.25884C20.2839 5.01015 20.3815 4.77112 20.5564 4.59433C20.7313 4.41755 20.9693 4.31749 21.218 4.31618C21.4667 4.31486 21.7057 4.41238 21.8825 4.5873L24.4137 7.09277C24.5508 7.2285 24.6597 7.39007 24.734 7.56812C24.8082 7.74617 24.8465 7.93719 24.8465 8.13012C24.8465 8.32304 24.8082 8.51406 24.734 8.69211C24.6597 8.87016 24.5508 9.03173 24.4137 9.16746L21.8825 11.6729C21.7069 11.8466 21.4699 11.9439 21.2229 11.9439Z" fill="currentColor"/>
              <path d="M21.2229 20.9102C21.0371 20.9102 20.8554 20.855 20.7009 20.7516C20.5465 20.6481 20.4263 20.5011 20.3556 20.3292C20.2849 20.1573 20.2669 19.9682 20.3039 19.786C20.3409 19.6039 20.4313 19.4368 20.5634 19.3061L22.7965 17.0964L20.5634 14.8867C20.4759 14.8001 20.4063 14.6971 20.3585 14.5836C20.3108 14.4701 20.2859 14.3483 20.2853 14.2251C20.2846 14.102 20.3082 13.9799 20.3547 13.8659C20.4013 13.7519 20.4698 13.6482 20.5564 13.5606C20.643 13.4731 20.746 13.4035 20.8595 13.3558C20.973 13.308 21.0948 13.2831 21.218 13.2825C21.3411 13.2818 21.4632 13.3054 21.5772 13.352C21.6912 13.3985 21.7949 13.467 21.8825 13.5536L24.4137 16.0591C24.5508 16.1948 24.6597 16.3564 24.734 16.5344C24.8082 16.7125 24.8465 16.9035 24.8465 17.0964C24.8465 17.2894 24.8082 17.4804 24.734 17.6584C24.6597 17.8365 24.5508 17.998 24.4137 18.1338L21.8825 20.6392C21.7069 20.8129 21.4699 20.9102 21.2229 20.9102Z" fill="currentColor"/>
              </g>
              <defs>
              <clipPath id="clip0_1659_9503">
              <rect width="24" height="24" fill="white" transform="translate(0.845703 0.613281)"/>
              </clipPath>
              </defs>
            </svg>
            {t(`All Pairs`)}
          </StyledTab>
          <StyledTab>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <g mask="url(#mask0_3008_2917)">
              <mask id="path-2-inside-1_3008_2917" fill="white">
              <path d="M19.6373 3.87902C18.6026 2.84432 17.3742 2.02355 16.0223 1.46358C14.6704 0.903602 13.2215 0.615386 11.7582 0.615386C10.2949 0.615386 8.84596 0.903602 7.49406 1.46358C6.14216 2.02355 4.9138 2.84432 3.8791 3.87902C2.8444 4.91372 2.02363 6.14208 1.46366 7.49398C0.903686 8.84588 0.61547 10.2948 0.61547 11.7581C0.61547 13.2214 0.903686 14.6704 1.46366 16.0223C2.02364 17.3742 2.8444 18.6025 3.8791 19.6372L5.26168 18.2546C4.40855 17.4015 3.7318 16.3887 3.27009 15.274C2.80838 14.1593 2.57074 12.9646 2.57074 11.7581C2.57074 10.5516 2.80838 9.3569 3.27009 8.24223C3.7318 7.12755 4.40855 6.11473 5.26168 5.2616C6.11482 4.40846 7.12764 3.73172 8.24231 3.27001C9.35699 2.80829 10.5517 2.57065 11.7582 2.57065C12.9647 2.57065 14.1594 2.80829 15.2741 3.27001C16.3888 3.73172 17.4016 4.40846 18.2547 5.2616L19.6373 3.87902Z"/>
              </mask>
              <path d="M19.6373 3.87902C18.6026 2.84432 17.3742 2.02355 16.0223 1.46358C14.6704 0.903602 13.2215 0.615386 11.7582 0.615386C10.2949 0.615386 8.84596 0.903602 7.49406 1.46358C6.14216 2.02355 4.9138 2.84432 3.8791 3.87902C2.8444 4.91372 2.02363 6.14208 1.46366 7.49398C0.903686 8.84588 0.61547 10.2948 0.61547 11.7581C0.61547 13.2214 0.903686 14.6704 1.46366 16.0223C2.02364 17.3742 2.8444 18.6025 3.8791 19.6372L5.26168 18.2546C4.40855 17.4015 3.7318 16.3887 3.27009 15.274C2.80838 14.1593 2.57074 12.9646 2.57074 11.7581C2.57074 10.5516 2.80838 9.3569 3.27009 8.24223C3.7318 7.12755 4.40855 6.11473 5.26168 5.2616C6.11482 4.40846 7.12764 3.73172 8.24231 3.27001C9.35699 2.80829 10.5517 2.57065 11.7582 2.57065C12.9647 2.57065 14.1594 2.80829 15.2741 3.27001C16.3888 3.73172 17.4016 4.40846 18.2547 5.2616L19.6373 3.87902Z" stroke="url(#paint0_linear_3008_2917)" stroke-width="4" mask="url(#path-2-inside-1_3008_2917)"/>
              <mask id="path-3-inside-2_3008_2917" fill="white">
              <path d="M20.1213 4.3627C21.156 5.3974 21.9768 6.62576 22.5367 7.97766C23.0967 9.32956 23.3849 10.7785 23.3849 12.2418C23.3849 13.7051 23.0967 15.154 22.5367 16.5059C21.9768 17.8578 21.156 19.0862 20.1213 20.1209C19.0866 21.1556 17.8582 21.9764 16.5063 22.5363C15.1544 23.0963 13.7055 23.3845 12.2422 23.3845C10.7789 23.3845 9.32995 23.0963 7.97805 22.5363C6.62615 21.9764 5.39778 21.1556 4.36309 20.1209L5.74567 18.7383C6.5988 19.5915 7.61162 20.2682 8.7263 20.7299C9.84097 21.1916 11.0357 21.4293 12.2422 21.4293C13.4487 21.4293 14.6434 21.1916 15.7581 20.7299C16.8728 20.2682 17.8856 19.5915 18.7387 18.7383C19.5918 17.8852 20.2686 16.8724 20.7303 15.7577C21.192 14.643 21.4297 13.4483 21.4297 12.2418C21.4297 11.0353 21.192 9.84058 20.7303 8.72591C20.2686 7.61123 19.5918 6.59841 18.7387 5.74528L20.1213 4.3627Z"/>
              </mask>
              <path d="M20.1213 4.3627C21.156 5.3974 21.9768 6.62576 22.5367 7.97766C23.0967 9.32956 23.3849 10.7785 23.3849 12.2418C23.3849 13.7051 23.0967 15.154 22.5367 16.5059C21.9768 17.8578 21.156 19.0862 20.1213 20.1209C19.0866 21.1556 17.8582 21.9764 16.5063 22.5363C15.1544 23.0963 13.7055 23.3845 12.2422 23.3845C10.7789 23.3845 9.32995 23.0963 7.97805 22.5363C6.62615 21.9764 5.39778 21.1556 4.36309 20.1209L5.74567 18.7383C6.5988 19.5915 7.61162 20.2682 8.7263 20.7299C9.84097 21.1916 11.0357 21.4293 12.2422 21.4293C13.4487 21.4293 14.6434 21.1916 15.7581 20.7299C16.8728 20.2682 17.8856 19.5915 18.7387 18.7383C19.5918 17.8852 20.2686 16.8724 20.7303 15.7577C21.192 14.643 21.4297 13.4483 21.4297 12.2418C21.4297 11.0353 21.192 9.84058 20.7303 8.72591C20.2686 7.61123 19.5918 6.59841 18.7387 5.74528L20.1213 4.3627Z" stroke="url(#paint1_linear_3008_2917)" stroke-width="4" mask="url(#path-3-inside-2_3008_2917)"/>
              <ellipse cx="16.8183" cy="2.42046" rx="2.31179" ry="2.31179" transform="rotate(15 16.8183 2.42046)" fill="none"/>
              <ellipse cx="6.89152" cy="21.7068" rx="2.31179" ry="2.31179" transform="rotate(15 6.89152 21.7068)" fill="none"/>
              <ellipse cx="12.242" cy="12.2418" rx="6.04817" ry="6.04817" transform="rotate(15 12.242 12.2418)" fill="none"/>
              <path fill-rule="evenodd" clip-rule="evenodd" d="M12.2421 17.333C15.054 17.333 17.3334 15.0536 17.3334 12.2418C17.3334 9.42995 15.054 7.15051 12.2421 7.15051C9.43031 7.15051 7.15088 9.42995 7.15088 12.2418C7.15088 15.0536 9.43031 17.333 12.2421 17.333ZM14.7614 12.2418L12.2421 9.72251L9.72288 12.2418L12.2421 14.761L14.7614 12.2418Z" fill="currentColor"/>
              <path fill-rule="evenodd" clip-rule="evenodd" d="M16.8181 4.36655C17.8929 4.36655 18.7641 3.49528 18.7641 2.42052C18.7641 1.34575 17.8929 0.474487 16.8181 0.474487C15.7433 0.474487 14.8721 1.34575 14.8721 2.42052C14.8721 3.49528 15.7433 4.36655 16.8181 4.36655ZM17.7811 2.42027L16.8182 1.45733L15.8552 2.42027L16.8182 3.38321L17.7811 2.42027Z" fill="currentColor"/>
              <path fill-rule="evenodd" clip-rule="evenodd" d="M6.89134 23.6532C7.96611 23.6532 8.83737 22.7819 8.83737 21.7071C8.83737 20.6324 7.96611 19.7611 6.89134 19.7611C5.81658 19.7611 4.94531 20.6324 4.94531 21.7071C4.94531 22.7819 5.81658 23.6532 6.89134 23.6532ZM7.8543 21.7069L6.89136 20.744L5.92842 21.7069L6.89136 22.6699L7.8543 21.7069Z" fill="currentColor"/>
              </g>
              <defs>
              <linearGradient id="paint0_linear_3008_2917" x1="2.50046" y1="17.3423" x2="19.4131" y2="4.14224" gradientUnits="userSpaceOnUse">
              <stop stop-color="currentColor"/>
              <stop offset="1" stop-color="currentColor" stop-opacity="0"/>
              </linearGradient>
              <linearGradient id="paint1_linear_3008_2917" x1="22.1978" y1="6.92668" x2="6.41953" y2="20.4362" gradientUnits="userSpaceOnUse">
              <stop stop-color="currentColor"/>
              <stop offset="1" stop-color="currentColor" stop-opacity="0"/>
              </linearGradient>
              </defs>
            </svg>
            {t(`Your Liquidity`)}
          </StyledTab>
        </TabMenu>
      </Container>
      {tab === 0 && <Pools />}
      {tab === 1 && <Liquidity isPair />}
    </>
  )
}
