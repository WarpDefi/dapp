import { useTranslation } from "@pancakeswap/localization"
import { Box, Flex, Heading, SearchInput, Select, Tab, TabMenu } from "@pancakeswap/uikit"
import Container from "components/Layout/Container"
import debounce from "lodash/debounce"
import React, { useState } from 'react'
import styled, { useTheme } from "styled-components"
import Action from "../Components/Action"
import AllProjects from "../Components/AllProjects"
import { LAUNCHPAD_STATUS } from "../helpers"

const StyledFlex = styled(Flex)`
  // align-items: center;
  justify-content: space-between;
  // flex-direction: column;
  gap: 0;
  ${({ theme }) => theme.mediaQueries.lg} {
    flex-direction: row;
    gap: 30px;
  }
  ${({ theme }) => theme.mediaQueries.xl} {
    gap: 50px;
  }
`
export const LoansH1 = styled(Heading)`
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
    font-size: 38px;
    margin-bottom: 20px;
  }
  ${({ theme }) => theme.mediaQueries.xl} {
    font-size: 44px;
  }
  ${({ theme }) => theme.mediaQueries.xxl} {
    font-size: 52px;
  }
`
export const LoansText = styled.p`
  color: ${({ theme }) => theme.colors.textSubtle};
  font-size: 14px;
  font-weight: 500;
  line-height: calc(24 / 18);
  margin-bottom: 10px;
  ${({ theme }) => theme.mediaQueries.sm} {
    font-size: 16px;
    font-weight: 600;
    max-width: 600px;
  }
  ${({ theme }) => theme.mediaQueries.lg} {
    font-size: 18px;
    max-width: 440px;
  }
  ${({ theme }) => theme.mediaQueries.xxxl} {
    font-size: 20px;
    max-width: 480px;
  }
`
const Image = styled.img`
  --size: 100%;
  width: var(--size);
  height: calc(var(--size) * 410 / 493);
  margin-bottom: -35px;
  margin-top: 10px;
  display: none;
  ${({ theme }) => theme.mediaQueries.lg} {
    --size: 350px;
    max-height: 291px;
    display: block;
  }
  ${({ theme }) => theme.mediaQueries.xl} {
    --size: 385px;
    max-height: 320px;
    margin-bottom: -39px;
  }
  ${({ theme }) => theme.mediaQueries.xxl} {
    --size: 420px;
    margin-bottom: -43px;
    margin-right: 30px;
    max-height: 349px;
  }
  ${({ theme }) => theme.mediaQueries.xxxl} {
    margin-right: 50px;
  }
`
const StyledBoxTab = styled(Box)`
  position: relative;
  > div {
    > div {
      @media screen and (max-width: 479px) {
        display: block;
      }
    }
  }
`
const StyledFilter = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 5px 0;
  > div {
    @media screen and (max-width: 479px) {
      width: 100%;
    }
  }
  input {
    width: 480px;
    margin-right: 16px;
    @media screen and (max-width: 1199px) {
      width: 305px;
    }
    @media screen and (max-width: 991px) {
      width: 480px;
    }
    @media screen and (max-width: 767px) {
      width: 360px;
    }
    @media screen and (max-width: 575px) {
      width: 260px;
    }
    @media screen and (max-width: 479px) {
      width: 100%;
      margin-right: 0;
      margin-bottom: 10px;
    }
  }
  @media screen and (max-width: 991px) {
    position: relative;
    padding: 0;
    margin-bottom: 20px;
  }
  @media screen and (max-width: 479px) {
    flex-direction: column;
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

export const Overview: React.FC<React.PropsWithChildren> = () => {
  const { t } = useTranslation()
  const theme = useTheme()
  const [tab, setTab] = useState<number>(0)
	const [valueSearch, setValueSearch] = useState<string>('')
	const [filterType, setFilterType] = useState<string | null>('')

	const inputSearch = debounce((event: any) => {
		setValueSearch(event.target.value)
	}, 200)

	const handleSelectType = (item: any) => {
		setFilterType(item.value)
		
	}

  return (
    <>
      <Container>
        <Box
          className='border-neubrutal'
          mt="32px"
          mb={["32px", "32px", "32px", "32px", "50px", "60px"]}
          background={theme.colors.backgroundAlt}
          borderRadius={theme.radii.card}
          p={['20px', '20px', '20px 30px', '20px 30px', '0 40px']}
        >
          <StyledFlex>
            <Box py={["0", "0", "0", "0", "30px"]}>
              <LoansH1 as="h1" scale="xxl" color="text" mb="24px">
                {t('GROFI DEX Launchpad')}
              </LoansH1>
              <LoansText>
                {t(
                  `Leading launchpad platform U2U Chain Network. Projects are carefully researched, evaluated and tested by GroFi Dex's project team.`
                )}
              </LoansText>
            </Box>
            <Image src="/images/launchpad-image.svg"/>
          </StyledFlex>
        </Box>
        <StyledBoxTab>
          <StyledFilter>
            <SearchInput onChange={inputSearch} placeholder="Search symbol, the project name to find your launchpad" />
            <Select
							onOptionChange={handleSelectType}
							disableFilterSelected
              options={[
                {
                  label: t('All status'),
                  value: null,
                },
                {
                  label: t('Upcoming'),
                  value: LAUNCHPAD_STATUS.UPCOMING
                },
                {
                  label: t('On Going'),
                  value: LAUNCHPAD_STATUS.ON_GOING
                },
                {
                  label: t('Ended'),
                  value: LAUNCHPAD_STATUS.ENDED,
                },
								// {
                //   label: t('Cancelled'),
                //   value: `${LAUNCHPAD_STATUS.ENDED}-${LAUNCHPAD_STATUS.CANCELLED}`,
                // },
								// {
                //   label: t('Claimable'),
                //   value: `${LAUNCHPAD_STATUS.ENDED}-${LAUNCHPAD_STATUS.CLAIMABLE}`,
                // }
              ]}
            />
          </StyledFilter>
          <TabMenu activeIndex={tab} onItemClick={setTab} customWidth isShowBorderBottom={false}>
            <StyledTab>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 25" fill="none">
                <g clip-path="url(#clip0_1413_11020)">
                <path d="M7.66016 0.949707H4.66016C3.59929 0.949707 2.58187 1.37113 1.83173 2.12128C1.08158 2.87143 0.660156 3.88884 0.660156 4.94971L0.660156 7.94971C0.660156 9.01057 1.08158 10.028 1.83173 10.7781C2.58187 11.5283 3.59929 11.9497 4.66016 11.9497H7.66016C8.72102 11.9497 9.73844 11.5283 10.4886 10.7781C11.2387 10.028 11.6602 9.01057 11.6602 7.94971V4.94971C11.6602 3.88884 11.2387 2.87143 10.4886 2.12128C9.73844 1.37113 8.72102 0.949707 7.66016 0.949707V0.949707ZM9.66016 7.94971C9.66016 8.48014 9.44944 8.98885 9.07437 9.36392C8.6993 9.73899 8.19059 9.94971 7.66016 9.94971H4.66016C4.12972 9.94971 3.62102 9.73899 3.24594 9.36392C2.87087 8.98885 2.66016 8.48014 2.66016 7.94971V4.94971C2.66016 4.41927 2.87087 3.91057 3.24594 3.53549C3.62102 3.16042 4.12972 2.94971 4.66016 2.94971H7.66016C8.19059 2.94971 8.6993 3.16042 9.07437 3.53549C9.44944 3.91057 9.66016 4.41927 9.66016 4.94971V7.94971Z" fill="currentColor"/>
                <path d="M20.6601 0.949707H17.6602C16.5993 0.949707 15.5819 1.37113 14.8317 2.12128C14.0816 2.87143 13.6602 3.88884 13.6602 4.94971V7.94971C13.6602 9.01058 14.0816 10.028 14.8317 10.7781C15.5819 11.5283 16.5993 11.9497 17.6602 11.9497H20.6601C21.721 11.9497 22.7384 11.5283 23.4886 10.7781C24.2387 10.028 24.6601 9.01058 24.6601 7.94971V4.94971C24.6601 3.88884 24.2387 2.87143 23.4886 2.12128C22.7384 1.37113 21.721 0.949707 20.6601 0.949707V0.949707ZM22.6601 7.94971C22.6601 8.48015 22.4494 8.98885 22.0744 9.36393C21.6993 9.739 21.1906 9.94971 20.6601 9.94971H17.6602C17.1297 9.94971 16.621 9.739 16.2459 9.36393C15.8709 8.98885 15.6602 8.48015 15.6602 7.94971V4.94971C15.6602 4.41928 15.8709 3.91057 16.2459 3.5355C16.621 3.16042 17.1297 2.94971 17.6602 2.94971H20.6601C21.1906 2.94971 21.6993 3.16042 22.0744 3.5355C22.4494 3.91057 22.6601 4.41928 22.6601 4.94971V7.94971Z" fill="currentColor"/>
                <path d="M7.66016 13.9497H4.66016C3.59929 13.9497 2.58187 14.3711 1.83173 15.1213C1.08158 15.8714 0.660156 16.8888 0.660156 17.9497L0.660156 20.9497C0.660156 22.0106 1.08158 23.028 1.83173 23.7781C2.58187 24.5283 3.59929 24.9497 4.66016 24.9497H7.66016C8.72102 24.9497 9.73844 24.5283 10.4886 23.7781C11.2387 23.028 11.6602 22.0106 11.6602 20.9497V17.9497C11.6602 16.8888 11.2387 15.8714 10.4886 15.1213C9.73844 14.3711 8.72102 13.9497 7.66016 13.9497ZM9.66016 20.9497C9.66016 21.4802 9.44944 21.9889 9.07437 22.3639C8.6993 22.739 8.19059 22.9497 7.66016 22.9497H4.66016C4.12972 22.9497 3.62102 22.739 3.24594 22.3639C2.87087 21.9889 2.66016 21.4802 2.66016 20.9497V17.9497C2.66016 17.4193 2.87087 16.9106 3.24594 16.5355C3.62102 16.1604 4.12972 15.9497 4.66016 15.9497H7.66016C8.19059 15.9497 8.6993 16.1604 9.07437 16.5355C9.44944 16.9106 9.66016 17.4193 9.66016 17.9497V20.9497Z" fill="currentColor"/>
                <path d="M20.6601 13.9497H17.6602C16.5993 13.9497 15.5819 14.3711 14.8317 15.1213C14.0816 15.8714 13.6602 16.8888 13.6602 17.9497V20.9497C13.6602 22.0106 14.0816 23.028 14.8317 23.7781C15.5819 24.5283 16.5993 24.9497 17.6602 24.9497H20.6601C21.721 24.9497 22.7384 24.5283 23.4886 23.7781C24.2387 23.028 24.6601 22.0106 24.6601 20.9497V17.9497C24.6601 16.8888 24.2387 15.8714 23.4886 15.1213C22.7384 14.3711 21.721 13.9497 20.6601 13.9497ZM22.6601 20.9497C22.6601 21.4802 22.4494 21.9889 22.0744 22.3639C21.6993 22.739 21.1906 22.9497 20.6601 22.9497H17.6602C17.1297 22.9497 16.621 22.739 16.2459 22.3639C15.8709 21.9889 15.6602 21.4802 15.6602 20.9497V17.9497C15.6602 17.4193 15.8709 16.9106 16.2459 16.5355C16.621 16.1604 17.1297 15.9497 17.6602 15.9497H20.6601C21.1906 15.9497 21.6993 16.1604 22.0744 16.5355C22.4494 16.9106 22.6601 17.4193 22.6601 17.9497V20.9497Z" fill="currentColor"/>
                </g>
                <defs>
                <clipPath id="clip0_1413_11020">
                <rect width="24" height="24" fill="white" transform="translate(0.660156 0.949707)"/>
                </clipPath>
                </defs>
              </svg>
              {t('All projects')}
            </StyledTab>
            <StyledTab>
              <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25" fill="none">
                <g clip-path="url(#clip0_1413_11014)">
                <path d="M23.7422 16.95C23.477 16.95 23.2226 17.0554 23.0351 17.2429C22.8475 17.4304 22.7422 17.6848 22.7422 17.95V19.95C22.7422 20.7457 22.4261 21.5087 21.8635 22.0713C21.3009 22.6339 20.5378 22.95 19.7422 22.95H17.7422C17.477 22.95 17.2226 23.0554 17.0351 23.2429C16.8475 23.4304 16.7422 23.6848 16.7422 23.95C16.7422 24.2152 16.8475 24.4696 17.0351 24.6571C17.2226 24.8446 17.477 24.95 17.7422 24.95H19.7422C21.0678 24.9484 22.3386 24.4211 23.276 23.4838C24.2133 22.5464 24.7406 21.2756 24.7422 19.95V17.95C24.7422 17.6848 24.6368 17.4304 24.4493 17.2429C24.2617 17.0554 24.0074 16.95 23.7422 16.95Z" fill="currentColor"/>
                <path d="M1.74219 8.94971C2.0074 8.94971 2.26176 8.84435 2.44929 8.65681C2.63683 8.46928 2.74219 8.21492 2.74219 7.94971V5.94971C2.74219 5.15406 3.05826 4.391 3.62087 3.82839C4.18348 3.26578 4.94654 2.94971 5.74219 2.94971H7.74219C8.0074 2.94971 8.26176 2.84435 8.44929 2.65681C8.63683 2.46928 8.74219 2.21492 8.74219 1.94971C8.74219 1.68449 8.63683 1.43014 8.44929 1.2426C8.26176 1.05506 8.0074 0.949707 7.74219 0.949707H5.74219C4.41659 0.951295 3.14575 1.47859 2.20841 2.41593C1.27107 3.35326 0.743775 4.62411 0.742188 5.94971L0.742188 7.94971C0.742188 8.21492 0.847544 8.46928 1.03508 8.65681C1.22262 8.84435 1.47697 8.94971 1.74219 8.94971Z" fill="currentColor"/>
                <path d="M7.74219 22.95H5.74219C4.94654 22.95 4.18348 22.6339 3.62087 22.0713C3.05826 21.5087 2.74219 20.7457 2.74219 19.95V17.95C2.74219 17.6848 2.63683 17.4304 2.44929 17.2429C2.26176 17.0554 2.0074 16.95 1.74219 16.95C1.47697 16.95 1.22262 17.0554 1.03508 17.2429C0.847544 17.4304 0.742188 17.6848 0.742188 17.95L0.742188 19.95C0.743775 21.2756 1.27107 22.5464 2.20841 23.4838C3.14575 24.4211 4.41659 24.9484 5.74219 24.95H7.74219C8.0074 24.95 8.26176 24.8446 8.44929 24.6571C8.63683 24.4696 8.74219 24.2152 8.74219 23.95C8.74219 23.6848 8.63683 23.4304 8.44929 23.2429C8.26176 23.0554 8.0074 22.95 7.74219 22.95Z" fill="currentColor"/>
                <path d="M19.7422 0.949707H17.7422C17.477 0.949707 17.2226 1.05506 17.0351 1.2426C16.8475 1.43014 16.7422 1.68449 16.7422 1.94971C16.7422 2.21492 16.8475 2.46928 17.0351 2.65681C17.2226 2.84435 17.477 2.94971 17.7422 2.94971H19.7422C20.5378 2.94971 21.3009 3.26578 21.8635 3.82839C22.4261 4.391 22.7422 5.15406 22.7422 5.94971V7.94971C22.7422 8.21492 22.8475 8.46928 23.0351 8.65681C23.2226 8.84435 23.477 8.94971 23.7422 8.94971C24.0074 8.94971 24.2617 8.84435 24.4493 8.65681C24.6368 8.46928 24.7422 8.21492 24.7422 7.94971V5.94971C24.7406 4.62411 24.2133 3.35326 23.276 2.41593C22.3386 1.47859 21.0678 0.951295 19.7422 0.949707V0.949707Z" fill="currentColor"/>
                <path d="M12.7422 11.9496C13.5333 11.9496 14.3067 11.7151 14.9645 11.2755C15.6223 10.836 16.135 10.2113 16.4377 9.48038C16.7405 8.74948 16.8197 7.94521 16.6653 7.16929C16.511 6.39336 16.13 5.68063 15.5706 5.12122C15.0112 4.56181 14.2985 4.18085 13.5225 4.02651C12.7466 3.87217 11.9424 3.95138 11.2115 4.25413C10.4805 4.55688 9.85583 5.06957 9.41631 5.72737C8.97678 6.38516 8.74219 7.15852 8.74219 7.94965C8.74219 9.01051 9.16361 10.0279 9.91376 10.7781C10.6639 11.5282 11.6813 11.9496 12.7422 11.9496ZM12.7422 5.94965C13.1378 5.94965 13.5244 6.06695 13.8533 6.28671C14.1822 6.50647 14.4386 6.81883 14.5899 7.18428C14.7413 7.54973 14.7809 7.95187 14.7038 8.33983C14.6266 8.72779 14.4361 9.08416 14.1564 9.36386C13.8767 9.64357 13.5203 9.83405 13.1324 9.91122C12.7444 9.98839 12.3423 9.94878 11.9768 9.79741C11.6114 9.64603 11.299 9.38969 11.0792 9.06079C10.8595 8.73189 10.7422 8.34521 10.7422 7.94965C10.7422 7.41921 10.9529 6.91051 11.328 6.53543C11.703 6.16036 12.2118 5.94965 12.7422 5.94965Z" fill="currentColor"/>
                <path d="M18.7422 20.95C19.0074 20.95 19.2618 20.8447 19.4493 20.6571C19.6368 20.4696 19.7422 20.2152 19.7422 19.95C19.7406 18.3592 19.1079 16.834 17.9831 15.7091C16.8582 14.5843 15.333 13.9516 13.7422 13.95H11.7422C10.1514 13.9516 8.62618 14.5843 7.5013 15.7091C6.37643 16.834 5.74378 18.3592 5.74219 19.95C5.74219 20.2152 5.84754 20.4696 6.03508 20.6571C6.22262 20.8447 6.47697 20.95 6.74219 20.95C7.0074 20.95 7.26176 20.8447 7.44929 20.6571C7.63683 20.4696 7.74219 20.2152 7.74219 19.95C7.74219 18.8891 8.16361 17.8717 8.91376 17.1216C9.66391 16.3714 10.6813 15.95 11.7422 15.95H13.7422C14.8031 15.95 15.8205 16.3714 16.5706 17.1216C17.3208 17.8717 17.7422 18.8891 17.7422 19.95C17.7422 20.2152 17.8475 20.4696 18.0351 20.6571C18.2226 20.8447 18.477 20.95 18.7422 20.95Z" fill="currentColor"/>
                </g>
                <defs>
                <clipPath id="clip0_1413_11014">
                <rect width="24" height="24" fill="white" transform="translate(0.742188 0.949707)"/>
                </clipPath>
                </defs>
              </svg>
              {t('My Contributions')}
            </StyledTab>
          </TabMenu>
          {tab === 0 && <AllProjects filter={{valueSearch, filterType}} />}
					{tab === 1 && <AllProjects filter={{valueSearch, filterType}} isMyPool/>}
        </StyledBoxTab>
        <Action/>
      </Container>
    </>
  )
}