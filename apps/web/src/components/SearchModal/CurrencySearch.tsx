/* eslint-disable no-restricted-syntax */
import { useDebounce, useSortedTokensByQuery } from '@pancakeswap/hooks'
import { useTranslation } from '@pancakeswap/localization'
import { ChainId, Currency, Token, WNATIVE } from '@pancakeswap/sdk'
import { WrappedTokenInfo, createFilterToken } from '@pancakeswap/token-lists'
import { CAKE } from '@pancakeswap/tokens'
import {
  ArrowBackIcon,
  AutoColumn,
  Box,
  Column,
  Flex,
  IconButton,
  Input,
  Text,
  useMatchBreakpoints,
} from '@pancakeswap/uikit'
import { useAudioPlay } from '@pancakeswap/utils/user'
import { useActiveChainId } from 'hooks/useActiveChainId'
import useNativeCurrency from 'hooks/useNativeCurrency'
import { KeyboardEvent, RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FixedSizeList } from 'react-window'
import { useAllLists, useInactiveListUrls } from 'state/lists/hooks'
import styled from 'styled-components'
import type SwiperCore from 'swiper'
import 'swiper/css'
import { Swiper, SwiperSlide } from 'swiper/react'
import { safeGetAddress } from 'utils'
import { isAddress } from 'viem'
import { whiteListedFiatCurrenciesMap } from 'views/BuyCrypto/constants'
import { useAllTokens, useIsUserAddedToken, useToken } from '../../hooks/Tokens'
import Row from '../Layout/Row'
import CommonBases from './CommonBases'
import CurrencyList from './CurrencyList'
import ImportRow from './ImportRow'
import useTokenComparator from './sorting'
import { getSwapSound } from './swapSound'
import { CommonBasesType } from './types'

const FlexPointer = styled(Flex)`
  cursor: pointer;
`

interface CurrencySearchProps {
  selectedCurrency?: Currency | null
  onCurrencySelect: (currency: Currency) => void
  onMultiCurrencySelect?: (listCurrency: Currency[]) => void
  otherSelectedCurrency?: Currency | null
  showSearchInput?: boolean
  showCommonBases?: boolean
  commonBasesType?: string
  showImportView: () => void
  setImportToken: (token: Token) => void
  height?: number
  tokensToShow?: Token[]
  mode?: string
  onRampFlow?: boolean
  isSelectMulti?: boolean
}

function useSearchInactiveTokenLists(search: string | undefined, minResults = 10): WrappedTokenInfo[] {
  const lists = useAllLists()
  const inactiveUrls = useInactiveListUrls()
  const { chainId } = useActiveChainId()
  const activeTokens = useAllTokens()
  return useMemo(() => {
    if (!search || search.trim().length === 0) return []
    const filterToken = createFilterToken(search, (address) => isAddress(address))
    const exactMatches: WrappedTokenInfo[] = []
    const rest: WrappedTokenInfo[] = []
    const addressSet: { [address: string]: true } = {}
    const trimmedSearchQuery = search.toLowerCase().trim()
    for (const url of inactiveUrls) {
      const list = lists[url]?.current
      // eslint-disable-next-line no-continue
      if (!list) continue
      for (const tokenInfo of list.tokens) {
        if (
          tokenInfo.chainId === chainId &&
          !(tokenInfo.address in activeTokens) &&
          !addressSet[tokenInfo.address] &&
          filterToken(tokenInfo)
        ) {
          const wrapped: WrappedTokenInfo = new WrappedTokenInfo({
            ...tokenInfo,
            address: safeGetAddress(tokenInfo.address) || tokenInfo.address,
          })
          addressSet[wrapped.address] = true
          if (
            tokenInfo.name?.toLowerCase() === trimmedSearchQuery ||
            tokenInfo.symbol?.toLowerCase() === trimmedSearchQuery
          ) {
            exactMatches.push(wrapped)
          } else {
            rest.push(wrapped)
          }
        }
      }
    }
    return [...exactMatches, ...rest].slice(0, minResults)
  }, [activeTokens, chainId, inactiveUrls, lists, minResults, search])
}

function CurrencySearch({
  selectedCurrency,
  onCurrencySelect,
  onMultiCurrencySelect,
  otherSelectedCurrency,
  showCommonBases,
  commonBasesType,
  showSearchInput = true,
  showImportView,
  setImportToken,
  height,
  tokensToShow,
  mode,
  onRampFlow,
  isSelectMulti,
}: CurrencySearchProps) {
  const { t } = useTranslation()
  const { chainId } = useActiveChainId()

  // refs for fixed size lists
  const fixedList = useRef<FixedSizeList>()

  const [searchQuery, setSearchQuery] = useState<string>('')
  const debouncedQuery = useDebounce(searchQuery, 200)

  const [invertSearchOrder] = useState<boolean>(false)
  const [step, setStep] = useState<number>(0)
  const [currency0, setCurrency0] = useState<Currency | null>(null)
  const allTokens = useAllTokens()

  // if they input an address, use it
  const searchToken = useToken(debouncedQuery)
  const searchTokenIsAdded = useIsUserAddedToken(searchToken)

  const { isMobile } = useMatchBreakpoints()
  const [audioPlay] = useAudioPlay()

  const native = useNativeCurrency()
  const [swiperRef, setSwiperRef] = useState<SwiperCore | null>(null)
  const showNative: boolean = useMemo(() => {
    if (tokensToShow || mode === 'onramp-input') return false
    const s = debouncedQuery.toLowerCase().trim()
    return native && native.symbol?.toLowerCase?.()?.indexOf(s) !== -1
  }, [debouncedQuery, native, tokensToShow, mode])

  const filteredTokens: Token[] = useMemo(() => {
    const filterToken = createFilterToken(debouncedQuery, (address) => isAddress(address))
    return Object.values(tokensToShow || allTokens).filter(filterToken)
  }, [tokensToShow, allTokens, debouncedQuery])

  const queryTokens = useSortedTokensByQuery(filteredTokens, debouncedQuery)
  const filteredQueryTokens = useMemo(() => {
    if (!chainId) return queryTokens
    return mode === 'onramp-input'
      ? queryTokens.filter((curr) => whiteListedFiatCurrenciesMap[chainId].includes(curr.symbol))
      : queryTokens
  }, [chainId, queryTokens, mode])

  const tokenComparator = useTokenComparator(invertSearchOrder)

  const filteredSortedTokens: Token[] = useMemo(() => {
    let data =  onRampFlow ? [...filteredQueryTokens] : [...filteredQueryTokens].sort(tokenComparator)
    if(commonBasesType === CommonBasesType.LIQUIDITY) {
      data = data.filter((item) => {
        return item.wrapped?.address?.toLowerCase() !== WNATIVE[ChainId.U2U_NEBULAS].address?.toLowerCase()
      })
    }
    return data
  }, [onRampFlow, filteredQueryTokens, tokenComparator, commonBasesType])

  const filteredSortedTokensList2: Token[] = useMemo(() => {
    const _filteredQueryTokens = [...filteredQueryTokens]
    if (
      isSelectMulti &&
      step === 1 &&
      currency0?.wrapped?.address.toLowerCase() === CAKE[ChainId.U2U_NEBULAS]?.address.toLowerCase()
    ) {
      return [WNATIVE[ChainId.U2U_NEBULAS]]
    }
    if (
      isSelectMulti &&
      currency0?.symbol &&
      WNATIVE[ChainId.U2U_NEBULAS].address?.toLowerCase() !== currency0?.wrapped.address.toLowerCase()
    ) {
      return _filteredQueryTokens.filter(
        (item) => item?.wrapped.address.toLowerCase() !== CAKE[ChainId.U2U_NEBULAS]?.wrapped.address?.toLowerCase(),
      )
    }
    return _filteredQueryTokens
  }, [currency0?.symbol, filteredQueryTokens, isSelectMulti, step])

  const handleCurrencySelect = useCallback(
    (currency: Currency) => {
      if (isSelectMulti) {
        if (step === 0) {
          setCurrency0(currency)
        }
        if (
          currency0 &&
          currency &&
          step === 1 &&
          (currency?.wrapped?.address?.toLowerCase() !== currency0?.wrapped?.address?.toLowerCase() ||
            (currency?.wrapped?.address?.toLowerCase() === native?.wrapped?.address?.toLowerCase() &&
              currency0?.wrapped?.address?.toLowerCase() === native?.wrapped?.address?.toLowerCase())) &&
          onMultiCurrencySelect
        ) {
          onMultiCurrencySelect([currency0, currency])
        }
        swiperRef?.slideNext()
      } else {
        onCurrencySelect(currency)
      }
      if (audioPlay) {
        getSwapSound().play()
      }
    },
    [audioPlay, onMultiCurrencySelect, onCurrencySelect, isSelectMulti, swiperRef, step, currency0, native],
  )

  const updateActiveIndex = ({ activeIndex }) => {
    setStep(activeIndex)
  }

  const handleBack = useCallback(() => {
    swiperRef?.slidePrev()
  }, [swiperRef])

  // manage focus on modal show
  const inputRef = useRef<HTMLInputElement>()

  useEffect(() => {
    if (!isMobile) inputRef.current?.focus()
  }, [isMobile])

  const handleInput = useCallback((event) => {
    const input = event.target.value
    const checksummedInput = safeGetAddress(input)
    setSearchQuery(checksummedInput || input)
    fixedList.current?.scrollTo(0)
  }, [])

  const handleEnter = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        const s = debouncedQuery.toLowerCase().trim()
        if (s === native.symbol.toLowerCase().trim()) {
          handleCurrencySelect(native)
        } else if (filteredSortedTokens.length > 0) {
          if (
            filteredSortedTokens[0].symbol?.toLowerCase() === debouncedQuery.trim().toLowerCase() ||
            filteredSortedTokens.length === 1
          ) {
            handleCurrencySelect(filteredSortedTokens[0])
          }
        }
      }
    },
    [debouncedQuery, filteredSortedTokens, handleCurrencySelect, native],
  )

  // if no results on main list, show option to expand into inactive
  const filteredInactiveTokens = useSearchInactiveTokenLists(debouncedQuery)

  const hasFilteredInactiveTokens = Boolean(filteredInactiveTokens?.length)

  const getCurrencyListRows = useCallback(() => {
    if (searchToken && !searchTokenIsAdded && !hasFilteredInactiveTokens) {
      return (
        <Column style={{ padding: '20px 0', height: '100%' }}>
          <ImportRow
            onCurrencySelect={handleCurrencySelect}
            token={searchToken}
            showImportView={showImportView}
            setImportToken={setImportToken}
          />
        </Column>
      )
    }

    return Boolean(filteredSortedTokens?.length) || hasFilteredInactiveTokens || mode === 'onramp-output' ? (
      <Box mx="-24px" my="24px">
        {step === 1 && (
          <FlexPointer alignItems="center" onClick={handleBack}>
            <IconButton variant="text">
              <ArrowBackIcon />
            </IconButton>
            <Text>Back</Text>
          </FlexPointer>
        )}
        <Swiper onSwiper={setSwiperRef} onActiveIndexChange={updateActiveIndex} spaceBetween={50} slidesPerView={1}>
          <SwiperSlide>
            <CurrencyList
              height={isMobile ? (showCommonBases ? height || 250 : height ? height + 80 : 350) : 390}
              showNative={showNative}
              currencies={filteredSortedTokens}
              inactiveCurrencies={mode === 'onramp-input' ? [] : filteredInactiveTokens}
              breakIndex={
                Boolean(filteredInactiveTokens?.length) && filteredSortedTokens
                  ? filteredSortedTokens.length
                  : undefined
              }
              onCurrencySelect={handleCurrencySelect}
              otherCurrency={otherSelectedCurrency}
              selectedCurrency={selectedCurrency}
              fixedListRef={fixedList}
              showImportView={showImportView}
              setImportToken={setImportToken}
              mode={mode as string}
            />
          </SwiperSlide>
          <SwiperSlide>
            <CurrencyList
              height={isMobile ? (showCommonBases ? height || 250 : height ? height + 80 : 350) : 390}
              showNative={showNative}
              currencies={isSelectMulti ? filteredSortedTokensList2 : filteredSortedTokens}
              inactiveCurrencies={mode === 'onramp-input' ? [] : filteredInactiveTokens}
              breakIndex={
                Boolean(filteredInactiveTokens?.length) && filteredSortedTokens
                  ? filteredSortedTokens.length
                  : undefined
              }
              onCurrencySelect={handleCurrencySelect}
              otherCurrency={currency0}
              selectedCurrency={selectedCurrency}
              fixedListRef={fixedList}
              showImportView={showImportView}
              setImportToken={setImportToken}
              mode={mode as string}
            />
          </SwiperSlide>
        </Swiper>
      </Box>
    ) : (
      <Column style={{ padding: '20px', height: '100%' }}>
        <Text color="textSubtle" textAlign="center" mb="20px">
          {t('No results found.')}
        </Text>
      </Column>
    )
  }, [searchToken, searchTokenIsAdded, hasFilteredInactiveTokens, filteredSortedTokens, mode, step, handleBack, isMobile, showCommonBases, height, showNative, filteredInactiveTokens, handleCurrencySelect, otherSelectedCurrency, selectedCurrency, showImportView, setImportToken, isSelectMulti, filteredSortedTokensList2, currency0, t])

  return (
    <>
      <AutoColumn gap="16px">
        {showSearchInput && (
          <Row>
            <Input
              id="token-search-input"
              placeholder={onRampFlow ? t('Search name') : t('Search name or paste address')}
              scale="lg"
              autoComplete="off"
              value={searchQuery}
              ref={inputRef as RefObject<HTMLInputElement>}
              onChange={handleInput}
              onKeyDown={handleEnter}
            />
          </Row>
        )}
        {showCommonBases && (
          <CommonBases
            chainId={chainId}
            onSelect={handleCurrencySelect}
            selectedCurrency={selectedCurrency}
            commonBasesType={commonBasesType}
          />
        )}
      </AutoColumn>
      {getCurrencyListRows()}
    </>
  )
}

export default CurrencySearch
