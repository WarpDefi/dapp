import { useTranslation } from '@pancakeswap/localization'
import { Currency } from '@pancakeswap/sdk'
import { Box, Flex, Tab, TabMenu, useModal } from '@pancakeswap/uikit'
import replaceBrowserHistory from '@pancakeswap/utils/replaceBrowserHistory'
import { AppBody } from 'components/App'
import { useCallback, useContext, useMemo, useState } from 'react'
import { useSwapActionHandlers } from 'state/swap/useSwapActionHandlers'

import isUndefinedOrNull from '@pancakeswap/utils/isUndefinedOrNull'
import Container from 'components/Layout/Container'
import CurrencySearchModal from 'components/SearchModal/CurrencySearchModal'
import { BigNumber } from 'ethers'
import { useCurrency } from 'hooks/Tokens'
import useNativeCurrency from 'hooks/useNativeCurrency'
import { Field } from 'state/swap/actions'
import { useDefaultsFromURLSearch, useSingleTokenSwapInfo, useSwapState } from 'state/swap/hooks'
import styled from 'styled-components'
import TransactionsTable from 'views/V3Info/components/TransactionsTable'
import { useProtocolTransactionDataWidthPair, useTopPoolsData } from 'views/V3Info/hooks'
import { useAccount } from 'wagmi'
import { SwapFeaturesContext } from './SwapFeaturesContext'
import { V3SwapForm } from './V3Swap'
import { TopHolders } from './V3Swap/containers/TopHolders'
import PriceChartContainer from './components/Chart/PriceChartContainer'
import useWarningImport from './hooks/useWarningImport'
import { StyledInputCurrencyWrapper, StyledSwapContainer } from './styles'

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

export default function Swap() {
  // const { query } = useRouter()
  // const { isDesktop } = useMatchBreakpoints()
  const {
    isChartExpanded,
    isChartDisplayed,
    setIsChartExpanded,
    isChartSupported,
    // isHotTokenSupported,
  } = useContext(SwapFeaturesContext)
  // const [isSwapHotTokenDisplay, setIsSwapHotTokenDisplay] = useSwapHotTokenDisplay()
  const { t } = useTranslation()
  const { address: account } = useAccount()
  const [isOnlyMyTransaction, setOnlyMyTransaction] = useState<boolean>(false)
  const [tab, setTab] = useState<number>(0)
  // const [timeFetchTransaction, updateTimeFetchTransaction] = useState<number>(0)
  // const [firstTime, setFirstTime] = useState(true)

  // useEffect(() => {
  //   if (firstTime && query.showTradingReward) {
  //     setFirstTime(false)
  //     setIsSwapHotTokenDisplay(true)
  //     if (!isSwapHotTokenDisplay && isChartDisplayed) {
  //       setIsChartDisplayed?.((currentIsChartDisplayed) => !currentIsChartDisplayed)
  //     }
  //   }
  // }, [firstTime, isChartDisplayed, isSwapHotTokenDisplay, query, setIsSwapHotTokenDisplay, setIsChartDisplayed])

  // swap state & price data
  const {
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
  } = useSwapState()
  const inputCurrency = useCurrency(inputCurrencyId)
  const outputCurrency = useCurrency(outputCurrencyId)

  const currencies: { [field in Field]?: Currency } = {
    [Field.INPUT]: inputCurrency ?? undefined,
    [Field.OUTPUT]: outputCurrency ?? undefined,
  }

  const transactionData = useProtocolTransactionDataWidthPair({
    token0: inputCurrency?.wrapped.address?.toLowerCase() || '',
    token1: outputCurrency?.wrapped.address?.toLowerCase() || '',
    origin: isOnlyMyTransaction && account ? account : null,
  })

  const { onSelectPair } = useSwapActionHandlers()
  const native = useNativeCurrency()
  const getAddress = (token: any) => {
    if (native.wrapped.address.toLowerCase() === token.wrapped.address?.toLowerCase()) {
      return native.symbol
    }
    return token.address
  }

  const handleSelectCurrency = (listCurrency: Array<Currency>) => {
    if (listCurrency[0] && listCurrency[1]) {
      let input = listCurrency[0]
      let output = listCurrency[1]

      if (
        !BigNumber.from(listCurrency[0].wrapped.address).lt(BigNumber.from(listCurrency[1].wrapped.address)) &&
        output.wrapped?.address?.toLowerCase() !== input?.wrapped?.address?.toLowerCase()
      ) {
        input = listCurrency[1]
        output = listCurrency[0]
      }
      const _inputCurrencyId = getAddress(input) || ''
      const _outputCurrencyId = _inputCurrencyId === 'U2U' ? output.wrapped?.address : getAddress(output) || ''
      onSelectPair(_inputCurrencyId, _outputCurrencyId)
      replaceBrowserHistory('inputCurrency', _inputCurrencyId)
      replaceBrowserHistory('outputCurrency', _outputCurrencyId)
    }
  }
  const [onPresentCurrencyModal] = useModal(
    <CurrencySearchModal onMultiCurrencySelect={handleSelectCurrency} isSelectMulti />,
  )
  const onCurrencySelectClick = useCallback(() => {
    onPresentCurrencyModal()
  }, [onPresentCurrencyModal])

  const singleTokenPrice = useSingleTokenSwapInfo(
    inputCurrencyId,
    inputCurrency,
    outputCurrencyId,
    outputCurrency,
    isChartSupported,
  )

  const warningSwapHandler = useWarningImport()
  useDefaultsFromURLSearch()
  const { onCurrencySelection } = useSwapActionHandlers()

  // const handleOutputSelect = useCallback(
  //   (newCurrencyOutput: Currency) => {
  //     onCurrencySelection(Field.OUTPUT, newCurrencyOutput)
  //     warningSwapHandler(newCurrencyOutput)

  //     const newCurrencyOutputId = currencyId(newCurrencyOutput)
  //     if (newCurrencyOutputId === inputCurrencyId) {
  //       replaceBrowserHistory('inputCurrency', outputCurrencyId)
  //     }
  //     replaceBrowserHistory('outputCurrency', newCurrencyOutputId)
  //   },

  //   [inputCurrencyId, outputCurrencyId, onCurrencySelection, warningSwapHandler],
  // )

  const topPoolsData = useTopPoolsData()

  const poolDatas = useMemo(() => {
    if (topPoolsData)
      return Object.values(topPoolsData)
        .map((p) => p)
        .filter((p) => !isUndefinedOrNull(p))
    return []
  }, [topPoolsData])

  const handleFilter = () => {
    setOnlyMyTransaction(!isOnlyMyTransaction)
  }

  return (
    <Box mt="24px">
      <Container>
        <Flex
          flexDirection={['column', 'column', 'column', 'column', 'row']}
          justifyContent="center"
          position="relative"
          alignItems="flex-start"
          width="100%"
        >
          <Flex
            flexDirection="column"
            order={['2', '2', '2', '2', '1']}
            width={['100%', '100%', '100%', '100%', 'auto']}
            flexGrow={2}
            style={{ minWidth: `calc(100vw - 510px)` }}
          >
            {isChartSupported && (
              <PriceChartContainer
                onCurrencySelectClick={onCurrencySelectClick}
                inputCurrencyId={inputCurrencyId}
                inputCurrency={currencies[Field.INPUT]}
                outputCurrencyId={outputCurrencyId}
                outputCurrency={currencies[Field.OUTPUT]}
                isChartExpanded={isChartExpanded}
                setIsChartExpanded={setIsChartExpanded}
                isChartDisplayed={isChartDisplayed}
                currentSwapPrice={singleTokenPrice}
                poolDatas={poolDatas}
              />
            )}
            {/* {!isDesktop && isChartSupported && (
              <BottomDrawer
                content={
                  <PriceChartContainer
                    inputCurrencyId={inputCurrencyId}
                    inputCurrency={currencies[Field.INPUT]}
                    outputCurrencyId={outputCurrencyId}
                    outputCurrency={currencies[Field.OUTPUT]}
                    isChartExpanded={isChartExpanded}
                    setIsChartExpanded={setIsChartExpanded}
                    isChartDisplayed={isChartDisplayed}
                    currentSwapPrice={singleTokenPrice}
                    isFullWidthContainer
                    isMobile
                    poolDatas={poolDatas}
                  />
                }
                isOpen={isChartDisplayed}
                setIsOpen={(isOpen) => setIsChartDisplayed?.(isOpen)}
              />
            )} */}
            {/* {isSwapHotTokenDisplay && isHotTokenSupported && <HotTokenList handleOutputSelect={handleOutputSelect} />} */}
            {/* <ModalV2
              isOpen={!isDesktop && isSwapHotTokenDisplay && isHotTokenSupported}
              onDismiss={() => setIsSwapHotTokenDisplay(false)}
            >
              <Modal
                style={{ padding: 0 }}
                title={t('Top Token')}
                onDismiss={() => setIsSwapHotTokenDisplay(false)}
                bodyPadding="0px"
              >
                <HotTokenList
                  handleOutputSelect={(newCurrencyOutput: Currency) => {
                    handleOutputSelect(newCurrencyOutput)
                    setIsSwapHotTokenDisplay(false)
                  }}
                />
              </Modal>
            </ModalV2> */}
            <Box mt={['30px', '30px', '36px', '40px', '48px']}>
              <TabMenu activeIndex={tab} onItemClick={setTab} customWidth isShowBorderBottom={false}>
                <StyledTab>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
                    <g clip-path="url(#clip0_70_5308)">
                    <path d="M19 22.0006H5C3.67441 21.999 2.40356 21.4717 1.46622 20.5344C0.528882 19.5971 0.00158786 18.3262 0 17.0006L0 7.00061C0.00158786 5.67502 0.528882 4.40417 1.46622 3.46683C2.40356 2.52949 3.67441 2.0022 5 2.00061H19C20.3256 2.0022 21.5964 2.52949 22.5338 3.46683C23.4711 4.40417 23.9984 5.67502 24 7.00061V17.0006C23.9984 18.3262 23.4711 19.5971 22.5338 20.5344C21.5964 21.4717 20.3256 21.999 19 22.0006ZM5 4.00061C4.20435 4.00061 3.44129 4.31668 2.87868 4.87929C2.31607 5.4419 2 6.20496 2 7.00061V17.0006C2 17.7963 2.31607 18.5593 2.87868 19.1219C3.44129 19.6845 4.20435 20.0006 5 20.0006H19C19.7956 20.0006 20.5587 19.6845 21.1213 19.1219C21.6839 18.5593 22 17.7963 22 17.0006V7.00061C22 6.20496 21.6839 5.4419 21.1213 4.87929C20.5587 4.31668 19.7956 4.00061 19 4.00061H5Z" fill="currentColor"/>
                    <path d="M19 13.0006H11C10.7348 13.0006 10.4804 12.8953 10.2929 12.7077C10.1054 12.5202 10 12.2658 10 12.0006C10 11.7354 10.1054 11.481 10.2929 11.2935C10.4804 11.106 10.7348 11.0006 11 11.0006H19C19.2652 11.0006 19.5196 11.106 19.7071 11.2935C19.8946 11.481 20 11.7354 20 12.0006C20 12.2658 19.8946 12.5202 19.7071 12.7077C19.5196 12.8953 19.2652 13.0006 19 13.0006Z" fill="currentColor"/>
                    <path d="M6.99999 13.0006H5C4.73478 13.0006 4.48043 12.8953 4.29289 12.7077C4.10536 12.5202 4 12.2658 4 12.0006C4 11.7354 4.10536 11.481 4.29289 11.2935C4.48043 11.106 4.73478 11.0006 5 11.0006H6.99999C7.26521 11.0006 7.51956 11.106 7.7071 11.2935C7.89464 11.481 7.99999 11.7354 7.99999 12.0006C7.99999 12.2658 7.89464 12.5202 7.7071 12.7077C7.51956 12.8953 7.26521 13.0006 6.99999 13.0006Z" fill="currentColor"/>
                    <path d="M13 17.9994H5C4.73478 17.9994 4.48043 17.894 4.29289 17.7065C4.10536 17.519 4 17.2646 4 16.9994C4 16.7342 4.10536 16.4798 4.29289 16.2923C4.48043 16.1047 4.73478 15.9994 5 15.9994H13C13.2652 15.9994 13.5196 16.1047 13.7071 16.2923C13.8946 16.4798 14 16.7342 14 16.9994C14 17.2646 13.8946 17.519 13.7071 17.7065C13.5196 17.894 13.2652 17.9994 13 17.9994Z" fill="currentColor"/>
                    <path d="M19 17.9994H17C16.7348 17.9994 16.4804 17.894 16.2929 17.7065C16.1054 17.519 16 17.2646 16 16.9994C16 16.7342 16.1054 16.4798 16.2929 16.2923C16.4804 16.1047 16.7348 15.9994 17 15.9994H19C19.2652 15.9994 19.5196 16.1047 19.7071 16.2923C19.8946 16.4798 20 16.7342 20 16.9994C20 17.2646 19.8946 17.519 19.7071 17.7065C19.5196 17.894 19.2652 17.9994 19 17.9994Z" fill="currentColor"/>
                    </g>
                    <defs>
                    <clipPath id="clip0_70_5308">
                    <rect width="24" height="24" fill="white"/>
                    </clipPath>
                    </defs>
                  </svg>
                  {t('Transactions')}
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
                  {t('Holders')}
                </StyledTab>
              </TabMenu>
            </Box>
            {transactionData && tab === 0 && (
              <TransactionsTable
                transactions={transactionData}
                type="SWAP_TRANSACTION"
                filterFn={handleFilter}
                toggleFilter={isOnlyMyTransaction}
                account={account}
              />
            )}
            {tab === 1 && <TopHolders />}
          </Flex>
          <Flex
            flexDirection="column"
            order={['1', '1', '1', '1', '2']}
            width={['100%', '100%', '100%', '100%', 'auto']}
            flexGrow={1}
            mb={['30px', '30px', '36px', '40px', '0']}
          >
            <StyledSwapContainer $isChartExpanded={isChartExpanded} margin={['auto', 'auto', 'auto', 'auto', 'unset']}>
              <StyledInputCurrencyWrapper mt={isChartExpanded ? '24px' : '0'}>
                <AppBody>
                  <V3SwapForm
                    onCurrencySelectClick={onCurrencySelectClick}
                    inputCurrency={currencies[Field.INPUT]}
                    outputCurrency={currencies[Field.OUTPUT]}
                  />
                </AppBody>
              </StyledInputCurrencyWrapper>
            </StyledSwapContainer>
          </Flex>
        </Flex>
      </Container>
    </Box>
  )
}
