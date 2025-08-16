import { useTranslation } from "@pancakeswap/localization"
import { Box, Flex, Heading, Tab, TabMenu, Text } from "@pancakeswap/uikit"
import { formatNumber } from "@pancakeswap/utils/formatBalance"
import Container from "components/Layout/Container"
import Page from 'components/Layout/Page'
import dayjs from "dayjs"
import { useContext, useEffect, useState } from 'react'
import styled, { useTheme } from "styled-components"
import { formatEther } from "viem"
import { formatDate } from "views/CakeStaking/components/DataSet/format"
import Available from "views/Loans/Components/Available"
import Borrowing from "../Components/Borrowing"
import { LoansHistory } from "../Components/History"
import LoanContext from "../LoanContext"
import { BorrowItem } from "../data/fetchListBorrowing"
import { useListBorrowing } from "../hooks/useListBorrowing"

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
    font-size: 16px;
    max-width: 100%;
  }
  ${({ theme }) => theme.mediaQueries.xl} {
    font-size: 18px;
  }
  ${({ theme }) => theme.mediaQueries.xxxl} {
    font-size: 20px;
  }
`
const StyledDate = styled.p`
  cursor: pointer;
  display: flex;
  align-items: center;
  font-style: italic;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textExtra};
  margin-top: 20px;
  @media screen and (max-width: 991px) {
    margin-top: 16px;
  }
`
const Image = styled.img`
  --size: 384px;
  width: var(--size);
  height: calc(var(--size) * 320 / 384);
  ${({ theme }) => theme.mediaQueries.lg} {
    max-height: 226px;
  }
  ${({ theme }) => theme.mediaQueries.xl} {
    max-height: 251px;
  }
  ${({ theme }) => theme.mediaQueries.xxl} {
    max-height: 276px;
    margin-right: 60px;
  }
  @media screen and (max-width: 991px) {
    display: none;
  }
`
const LoansInfo = styled.div`
  display: flex;
  gap: 100px;
  margin-top: 30px;
  @media screen and (max-width: 1199px) {
    margin-top: 20px;
    gap: 60px;
  }
  @media screen and (max-width: 991px) {
    margin-bottom: 10px;
  }
  @media screen and (max-width: 575px) {
    margin-top: 20px;
    gap: 0;
  }
  @media screen and (max-width: 374px) {
    flex-direction: column;
  }
  > div {
    &:last-child {
      @media screen and (max-width: 575px) {
        margin-left: 40px;
      }
      @media screen and (max-width: 424px) {
        margin-left: 30px;
      }
      @media screen and (max-width: 374px) {
        margin-left: 0;
        margin-top: 12px;
      }
    }
  }
`
const StyledPage = styled(Page)`
  max-width: 1488px;
`
const StyledBoxTab = styled(Box)`
  > div {
    > div {
      @media screen and (max-width: 479px) {
        display: block;
      }
    }
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
  const listBorrowing  = useListBorrowing()
  const { totalRepayable, totalRepayableU2U, totalInterestForBorrowingU2U, lastDueDate, totalCollateral, setTotalCollateral, setTotalRepayable } = useContext(LoanContext)

  useEffect(() => {
    if(totalRepayableU2U?.current) {
      totalRepayableU2U.current = 0
    }
    if(totalInterestForBorrowingU2U?.current) {
      totalInterestForBorrowingU2U.current = 0
    }
  }, [])



  useEffect(() => {
    if(listBorrowing.data?.length === 0) {
      if(setTotalRepayable) {
        setTotalRepayable(0)
      }
      if(setTotalCollateral) {
        setTotalCollateral(0)
      }
      if(lastDueDate.current) {
        lastDueDate.current = 0
      }
    } else {
      if(lastDueDate.current) {
        lastDueDate.current = 0
      }
      if(totalRepayableU2U?.current) {
        totalRepayableU2U.current = 0
      }
      if(totalInterestForBorrowingU2U?.current) {
        totalInterestForBorrowingU2U.current = 0
      }
      listBorrowing.data?.forEach((item: BorrowItem) => {
        if(lastDueDate?.current) {
          if(item.repayTime < lastDueDate.current) {
            lastDueDate.current = item.repayTime
          }
        } else {
          lastDueDate.current = item.repayTime
        }
        totalInterestForBorrowingU2U.current += Number(formatEther(item.stakeAmount))
        if(setTotalCollateral) {
          setTotalCollateral(totalInterestForBorrowingU2U.current)
        }
        const totalInterest = Number(formatEther(item?.borrowAmount)) * (Number(item?.loanPackage.annualRate)/100)
        const repaymentAmount = Number(totalInterest) + Number(formatEther(item?.borrowAmount))
        totalRepayableU2U.current += repaymentAmount
        if(setTotalRepayable) {
          setTotalRepayable(totalRepayableU2U.current)
        }
      })
      
    }
  }, [lastDueDate, listBorrowing.data, setTotalCollateral, setTotalRepayable, totalInterestForBorrowingU2U, totalRepayableU2U])



  return (
    <>
      <Container>
        <Box
          className='border-neubrutal'
          my="32px"
          background={theme.colors.backgroundAlt}
          borderRadius={theme.radii.card}
          p={['20px', '20px', '20px 30px', '20px 30px', '20px 40px']}
        >
          <StyledFlex>
            <Box maxWidth={["100%", "100%", "100%", "100%", "675px"]} py={["0", "0", "0", "0", "10px"]}>
              <LoansH1 as="h1" scale="xxl" color="text" mb="24px">
                {t('GROFI DEX Loans')}
              </LoansH1>
              <LoansText>
                {t(
                  'GroFi Dex Loans refer to the process of collateralizing stake shares to borrow U2U for use investment purposes to earn higher returns, or for withdrawal.',
                )}
              </LoansText>
              <LoansInfo>
                <Box>
                  <Text fontSize={["14px", "14px", "14px", "16px"]} color="textExtra">Total Repayable (U2U)</Text>
                  <Text fontSize={["20px", "24px", "24px", "28px", "32px"]} fontWeight="600" lineHeight="1" color="text" mt={["4px", "6px", "6px", "6px", "6px", "8px"]}>≈ {formatNumber(totalRepayable, 2, 6)}</Text>
                </Box>
                <Box>
                  <Text fontSize={["14px", "14px", "14px", "16px"]} color="textExtra">Total Collateral (U2U)</Text>
                  <Text fontSize={["20px", "24px", "24px", "28px", "32px"]} fontWeight="600" lineHeight="1" color="text" mt={["4px", "6px", "6px", "6px", "6px", "8px"]}>≈ {formatNumber(totalCollateral, 2, 6)}</Text>
                </Box>
              </LoansInfo>
              {
                Boolean(lastDueDate.current) && (
                  <StyledDate onClick={() => setTab(1)}>
                    Latest due date<Text color="hover" fontSize="12px" lineHeight="14px" ml="4px">{formatDate(dayjs.unix(lastDueDate.current || (Date.now()/ 1000)).utc())}</Text>
                  </StyledDate>
                )
              }
            </Box>
            <Image src="/images/loans-image.svg" alt="" />
          </StyledFlex>
        </Box>
        <StyledBoxTab>
          <TabMenu activeIndex={tab} onItemClick={setTab} customWidth isShowBorderBottom={false}>
            <StyledTab>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 25" fill="none">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M24.7546 12.0942C24.7546 11.4195 24.3279 10.784 23.69 10.2254C23.365 9.93948 22.9896 9.6658 22.6713 9.38543C22.4825 9.21899 22.2982 9.07154 22.2412 8.88723C22.1798 8.68616 22.2412 8.43706 22.3027 8.17009C22.3998 7.74562 22.5473 7.29433 22.6501 6.86874C22.8522 6.02873 22.8355 5.26245 22.4713 4.73856C22.0927 4.19344 21.38 3.93429 20.5288 3.87397C20.1099 3.84493 19.6542 3.85275 19.2386 3.81924C18.9996 3.80025 18.7739 3.79466 18.6265 3.68184C18.6265 3.68184 18.6265 3.68072 18.6254 3.68072C18.4723 3.56455 18.3964 3.33444 18.3014 3.09093C18.1439 2.68768 18.011 2.22969 17.8535 1.81974C17.5419 1.00095 17.0794 0.378764 16.4695 0.170995C15.8652 -0.0345395 15.1358 0.186634 14.4097 0.668076C14.0567 0.901537 13.6948 1.1875 13.3384 1.41426C13.1284 1.5483 12.9374 1.68346 12.7464 1.68346C12.5554 1.68346 12.3644 1.5483 12.1544 1.41426C11.7981 1.1875 11.4361 0.901537 11.0832 0.668076C10.3571 0.186634 9.62765 -0.0345395 9.02334 0.170995C8.41344 0.378764 7.95098 1.00095 7.63933 1.81974C7.48183 2.22969 7.3489 2.68768 7.1914 3.09093C7.09645 3.33444 7.02049 3.56455 6.86746 3.68072C6.86634 3.68072 6.86634 3.68184 6.86634 3.68184C6.71889 3.79466 6.49325 3.80025 6.25421 3.81924C5.83867 3.85275 5.38403 3.84493 4.96403 3.87397C4.11285 3.93317 3.40018 4.19233 3.0215 4.73744C2.65735 5.26133 2.64059 6.02873 2.84278 6.86874C2.94554 7.29433 3.09299 7.74562 3.19018 8.17009C3.25161 8.43706 3.31305 8.68616 3.25161 8.88723C3.19464 9.07154 3.01033 9.21899 2.82155 9.38543C2.5032 9.6658 2.12787 9.93948 1.80282 10.2254C1.16499 10.784 0.738281 11.4195 0.738281 12.0942C0.738281 12.7689 1.16499 13.4045 1.80282 13.963C2.12787 14.2479 2.5032 14.5227 2.82155 14.8031C3.01033 14.9695 3.19464 15.1169 3.25161 15.3012C3.31305 15.5023 3.25161 15.7514 3.19018 16.0184C3.09299 16.4429 2.94554 16.8941 2.84278 17.3197C2.64059 18.1597 2.65735 18.926 3.0215 19.4499C3.40018 19.995 4.11285 20.2542 4.96403 20.3145C5.38292 20.3435 5.83867 20.3357 6.25421 20.3692C6.49325 20.3882 6.71889 20.3938 6.86634 20.5066C6.86634 20.5066 6.86634 20.5078 6.86746 20.5078C7.02049 20.6239 7.09645 20.854 7.1914 21.0975C7.3489 21.5008 7.48183 21.9588 7.63933 22.3687C7.95098 23.1864 8.41344 23.8097 9.02334 24.0175C9.62765 24.223 10.3571 24.0018 11.0832 23.5204C11.4361 23.2869 11.7981 23.001 12.1544 22.7742C12.3644 22.6402 12.5554 22.505 12.7464 22.505C12.9374 22.505 13.1284 22.6402 13.3384 22.7742C13.6948 23.001 14.0567 23.2869 14.4097 23.5204C15.1358 24.0018 15.8652 24.223 16.4695 24.0175C17.0794 23.8097 17.5419 23.1864 17.8535 22.3687C18.011 21.9588 18.1439 21.5008 18.3014 21.0975C18.3964 20.854 18.4723 20.6239 18.6254 20.5078C18.6265 20.5078 18.6265 20.5066 18.6265 20.5066C18.7739 20.3938 18.9996 20.3882 19.2386 20.3692C19.6542 20.3357 20.1088 20.3435 20.5288 20.3145C21.38 20.2553 22.0927 19.9962 22.4713 19.451C22.8355 18.926 22.8522 18.1597 22.6501 17.3197C22.5473 16.8941 22.3998 16.4429 22.3027 16.0184C22.2412 15.7514 22.1798 15.5023 22.2412 15.3012C22.2982 15.1169 22.4825 14.9695 22.6713 14.8031C22.9896 14.5227 23.365 14.2479 23.69 13.963C24.3279 13.4045 24.7546 12.7689 24.7546 12.0942ZM9.54946 1.76277C9.56957 1.76724 9.63101 1.77953 9.66787 1.79293C9.73266 1.81751 9.79968 1.8499 9.86782 1.88788C10.0711 1.99847 10.28 2.14592 10.4922 2.29783C10.8899 2.58268 11.2954 2.87981 11.6852 3.07529C12.0483 3.25848 12.408 3.35902 12.7464 3.35902C13.0849 3.35902 13.4446 3.25848 13.8076 3.07529C14.1974 2.87981 14.6029 2.58268 15.0006 2.29783C15.2128 2.14592 15.4217 1.99847 15.625 1.88788C15.6932 1.8499 15.7602 1.81751 15.825 1.79293C15.8618 1.77953 15.9233 1.76724 15.9434 1.76277C16.0104 1.79517 16.0372 1.88229 16.083 1.96384C16.2204 2.204 16.3254 2.5056 16.4293 2.81279C16.589 3.28306 16.7454 3.76673 16.9409 4.15658C17.1241 4.52073 17.3497 4.81451 17.61 5.01335C17.8781 5.21776 18.2221 5.35404 18.6176 5.42777C19.0376 5.50484 19.5313 5.51266 20.0127 5.52718C20.2674 5.535 20.5176 5.54506 20.7433 5.58192C20.8851 5.60538 21.027 5.59644 21.0951 5.69474C21.1476 5.76958 21.1197 5.87123 21.1108 5.9807C21.0862 6.25884 21.0013 6.56826 20.9131 6.88327C20.6617 7.78471 20.4372 8.72302 20.6416 9.38319C20.8405 10.0266 21.5531 10.6432 22.2736 11.2241C22.5171 11.4207 22.7551 11.6161 22.9293 11.8273C23.0019 11.9155 23.079 11.9937 23.079 12.0942C23.079 12.1948 23.0019 12.273 22.9293 12.3612C22.7551 12.5723 22.5171 12.7678 22.2736 12.9644C21.5531 13.5453 20.8405 14.1619 20.6416 14.8053C20.4372 15.4643 20.6617 16.4038 20.9131 17.3052C21.0013 17.6202 21.0862 17.9296 21.1108 18.2089C21.1197 18.3184 21.1476 18.42 21.0951 18.4949C21.027 18.5932 20.8851 18.5842 20.7433 18.6066C20.5176 18.6434 20.2674 18.6535 20.0127 18.6613C19.5313 18.6758 19.0376 18.6836 18.6176 18.7607C18.2221 18.8344 17.8781 18.9707 17.61 19.174C17.3497 19.3728 17.1241 19.6677 16.9409 20.0319C16.7454 20.4217 16.589 20.9054 16.4293 21.3757C16.3254 21.6829 16.2204 21.9845 16.083 22.2246C16.0372 22.3062 16.0104 22.3933 15.9434 22.4257C15.9233 22.4212 15.8618 22.4089 15.825 22.3955C15.7602 22.371 15.6932 22.3375 15.625 22.3006C15.4217 22.19 15.2128 22.0426 15.0006 21.8906C14.6029 21.6058 14.1974 21.3087 13.8076 21.1132C13.4446 20.93 13.0849 20.8295 12.7464 20.8295C12.408 20.8295 12.0483 20.93 11.6852 21.1132C11.2954 21.3087 10.8899 21.6058 10.4922 21.8906C10.28 22.0426 10.0711 22.19 9.86782 22.3006C9.79968 22.3375 9.73266 22.371 9.66787 22.3955C9.63101 22.4089 9.56957 22.4212 9.54946 22.4257C9.48244 22.3933 9.45563 22.3062 9.40983 22.2246C9.27244 21.9845 9.16744 21.6829 9.06355 21.3757C8.90382 20.9054 8.74743 20.4217 8.55195 20.0319C8.36875 19.6677 8.14311 19.3728 7.88284 19.174C7.61476 18.9707 7.27071 18.8344 6.87528 18.7607C6.45527 18.6836 5.96154 18.6758 5.4801 18.6613C5.22542 18.6535 4.9752 18.6434 4.74956 18.6066C4.60769 18.5831 4.46583 18.592 4.39769 18.4937C4.34519 18.4189 4.37312 18.3172 4.38205 18.2078C4.40663 17.9296 4.49152 17.6202 4.57977 17.3052C4.8311 16.4038 5.05563 15.4643 4.85121 14.8053C4.65238 14.1619 3.93971 13.5453 3.21922 12.9644C2.9757 12.7678 2.73778 12.5723 2.56352 12.3612C2.49091 12.273 2.41384 12.1948 2.41384 12.0942C2.41384 11.9937 2.49091 11.9155 2.56352 11.8273C2.73778 11.6161 2.9757 11.4207 3.21922 11.2241C3.93971 10.6432 4.65238 10.0266 4.85121 9.38319C5.05563 8.72302 4.8311 7.78471 4.57977 6.88327C4.49152 6.56826 4.40663 6.25884 4.38205 5.97958C4.37312 5.87011 4.34519 5.76846 4.39769 5.69362C4.46583 5.59532 4.60769 5.60426 4.74956 5.58192C4.9752 5.54506 5.22542 5.535 5.4801 5.52718C5.96154 5.51266 6.45527 5.50484 6.87528 5.42777C7.27071 5.35404 7.61476 5.21776 7.88284 5.01335C8.14311 4.81451 8.36875 4.52073 8.55195 4.15658C8.74743 3.76673 8.90382 3.28306 9.06355 2.81279C9.16744 2.5056 9.27244 2.204 9.40983 1.96384C9.45563 1.88229 9.48244 1.79517 9.54946 1.76277Z" fill="currentColor"/>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M8.80309 12.6862L11.0372 14.9203C11.3644 15.2476 11.8939 15.2476 12.2212 14.9203L16.6894 10.4522C17.0167 10.126 17.0167 9.59429 16.6894 9.26811C16.3632 8.94082 15.8315 8.94082 15.5053 9.26811L11.6292 13.1431L9.98714 11.5022C9.66097 11.1749 9.12926 11.1749 8.80309 11.5022C8.47579 11.8284 8.47579 12.3601 8.80309 12.6862Z" fill="currentColor"/>
              </svg>
              {t('Available')}
            </StyledTab>
            <StyledTab>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 25" fill="none">
                <path d="M22.4767 18.2742V12.0942C22.4765 10.5508 22.0298 9.04047 21.1906 7.7452C20.3513 6.44994 19.1553 5.4251 17.7467 4.79424L19.3667 1.54424C19.4434 1.39201 19.48 1.2227 19.4728 1.05238C19.4657 0.882066 19.4151 0.716401 19.326 0.57112C19.2368 0.425839 19.112 0.305766 18.9633 0.222301C18.8147 0.138837 18.6472 0.0947541 18.4767 0.0942383H6.47673C6.30627 0.0947541 6.13877 0.138837 5.99013 0.222301C5.8415 0.305766 5.71667 0.425839 5.62749 0.57112C5.53832 0.716401 5.48777 0.882066 5.48063 1.05238C5.4735 1.2227 5.51002 1.39201 5.58673 1.54424L7.20673 4.79424C5.79816 5.4251 4.60214 6.44994 3.76289 7.7452C2.92363 9.04047 2.47696 10.5508 2.47673 12.0942V18.2742C1.81536 18.5142 1.25937 18.979 0.90596 19.5874C0.552547 20.1957 0.424192 20.9089 0.543333 21.6023C0.662474 22.2957 1.02153 22.9252 1.55774 23.3807C2.09395 23.8362 2.77319 24.0888 3.47673 24.0942H21.4767C22.1803 24.0888 22.8595 23.8362 23.3957 23.3807C23.9319 22.9252 24.291 22.2957 24.4101 21.6023C24.5293 20.9089 24.4009 20.1957 24.0475 19.5874C23.6941 18.979 23.1381 18.5142 22.4767 18.2742ZM9.09673 4.09424L8.09673 2.09424H16.8567L15.8567 4.09424H9.09673ZM21.4767 22.0942H3.47673C3.21151 22.0942 2.95716 21.9889 2.76962 21.8013C2.58209 21.6138 2.47673 21.3595 2.47673 21.0942C2.47673 20.829 2.58209 20.5747 2.76962 20.3871C2.95716 20.1996 3.21151 20.0942 3.47673 20.0942H4.47673C4.74195 20.0942 4.9963 19.9889 5.18384 19.8013C5.37137 19.6138 5.47673 19.3595 5.47673 19.0942C5.47673 18.829 5.37137 18.5747 5.18384 18.3871C4.9963 18.1996 4.74195 18.0942 4.47673 18.0942V12.0942C4.47673 10.5029 5.10887 8.97682 6.23409 7.8516C7.35931 6.72638 8.88543 6.09424 10.4767 6.09424H14.4767C16.068 6.09424 17.5942 6.72638 18.7194 7.8516C19.8446 8.97682 20.4767 10.5029 20.4767 12.0942V18.0942C20.2115 18.0942 19.9572 18.1996 19.7696 18.3871C19.5821 18.5747 19.4767 18.829 19.4767 19.0942C19.4767 19.3595 19.5821 19.6138 19.7696 19.8013C19.9572 19.9889 20.2115 20.0942 20.4767 20.0942H21.4767C21.7419 20.0942 21.9963 20.1996 22.1838 20.3871C22.3714 20.5747 22.4767 20.829 22.4767 21.0942C22.4767 21.3595 22.3714 21.6138 22.1838 21.8013C21.9963 21.9889 21.7419 22.0942 21.4767 22.0942Z" fill="currentColor"/>
                <path d="M10.4766 12.0942C10.4766 11.829 10.3712 11.5747 10.1837 11.3871C9.99613 11.1996 9.74178 11.0942 9.47656 11.0942C9.27878 11.0942 9.08544 11.1529 8.92099 11.2628C8.75654 11.3727 8.62837 11.5288 8.55268 11.7116C8.477 11.8943 8.45719 12.0953 8.49578 12.2893C8.53436 12.4833 8.6296 12.6615 8.76946 12.8013C8.90931 12.9412 9.08749 13.0364 9.28147 13.075C9.47545 13.1136 9.67652 13.0938 9.85925 13.0181C10.042 12.9424 10.1982 12.8143 10.308 12.6498C10.4179 12.4854 10.4766 12.292 10.4766 12.0942Z" fill="currentColor"/>
                <path d="M15.4766 15.0942C15.2788 15.0942 15.0854 15.1529 14.921 15.2628C14.7565 15.3726 14.6284 15.5288 14.5527 15.7116C14.477 15.8943 14.4572 16.0953 14.4958 16.2893C14.5344 16.4833 14.6296 16.6615 14.7695 16.8013C14.9093 16.9412 15.0875 17.0364 15.2815 17.075C15.4755 17.1136 15.6765 17.0938 15.8592 17.0181C16.042 16.9424 16.1982 16.8143 16.308 16.6498C16.4179 16.4854 16.4766 16.292 16.4766 16.0942C16.4766 15.829 16.3712 15.5747 16.1837 15.3871C15.9961 15.1996 15.7418 15.0942 15.4766 15.0942Z" fill="currentColor"/>
                <path d="M15.0265 10.2643C14.806 10.1195 14.5373 10.0678 14.2788 10.1202C14.0204 10.1726 13.7931 10.3251 13.6465 10.5443L9.64647 16.5443C9.50173 16.7647 9.44995 17.0334 9.5024 17.2919C9.55484 17.5504 9.70725 17.7776 9.92647 17.9243C10.0875 18.0371 10.2799 18.0965 10.4765 18.0943C10.6412 18.0934 10.8031 18.0519 10.9479 17.9734C11.0927 17.8949 11.2159 17.7818 11.3065 17.6443L15.3065 11.6443C15.4512 11.4238 15.503 11.1551 15.4505 10.8966C15.3981 10.6382 15.2457 10.4109 15.0265 10.2643Z" fill="currentColor"/>
              </svg>
              {t('Borrowing')}
            </StyledTab>
          </TabMenu>
          {tab === 0 && <Available refreshListBorrowing={listBorrowing.refetch}/>}
          {tab === 1 && <Borrowing {...listBorrowing} /> }
          {/* {tab === 2  && <div><Liquidation/></div> } */}
          {/* <div style={{"display": tab === 0 ? 'block': 'none' }}>
            <Available />
          </div>
          <div style={{"display": tab === 1 ? 'block': 'none' }}>
            <Borrowing />
          </div> */}
        </StyledBoxTab>
        <Heading scale="lg" mt="40px" mb="16px">
          {t('Transactions')}
        </Heading>
        <LoansHistory/>
      </Container>
    </>
  )
}