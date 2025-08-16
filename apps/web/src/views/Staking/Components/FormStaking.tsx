import { useTranslation } from '@pancakeswap/localization'
import { Rounding } from '@pancakeswap/sdk'
import { Box, Flex, Input, Text } from '@pancakeswap/uikit'
import { bigIntToBigNumber } from '@pancakeswap/utils/bigNumber'
import BigNumber from 'bignumber.js'
import { gql } from 'graphql-request'
import { useStakingContract } from 'hooks/useContract'
import { useAtom } from 'jotai'
import debounce from 'lodash/debounce'
import { useCallback, useEffect } from 'react'
import { replaceStakingState, resetStakingState, updateCalculateApr, updateSlippagePercent } from 'state/staking/actions'
import { useStakingState } from 'state/staking/hooks'
import { stakingReducerAtom } from 'state/staking/reducer'
import { useCurrencyBalance } from 'state/wallet/hooks'
import styled from 'styled-components'
import { validator } from 'utils/calls/staking'
import { aprSubgraphClients } from 'utils/graphql'
import { useAccount } from 'wagmi'
import useStakingConfig from '../Hooks/useStakingConfig'
import { StyledButton } from '../style'

const StyledText = styled(Text)`
  @media screen and (max-width: 344px) {
    display: none;
  }
`

let timeFlag = Date.now()

const FormStaking = () => {
  const stakingContract = useStakingContract()
  const [, dispatch] = useAtom(stakingReducerAtom)
  const { stakingAmount, stakingAmountError, slippagePercent, apr, estimatedRewards } = useStakingState()
  const { t } = useTranslation()

  const slippagePercents = [25, 50, 75, 100]

  useEffect(() => {
    dispatch(resetStakingState())
  }, [])

  const { currency, isWrongNetwork } = useStakingConfig()
  const { address: account } = useAccount()
  const currencyBalance = useCurrencyBalance(account, currency)
  
  const rawBalance: BigNumber = new BigNumber(
    currencyBalance?.asFraction
      .divide(10n ** BigInt(currency.decimals))
      .toFixed(6, { groupSeparator: '' }, Rounding.ROUND_DOWN) ?? '0',
  )

  const getAmountError = (value) => {
    if (value === '') {
      return t('Enter an amount')
    }
    if (BigNumber(value).gt(rawBalance)) {
      return t('Insufficient %symbol% balance', { symbol: currency.symbol })
    }
    return ''
  }

  const getCalculateApr = async (amount: BigNumber) => {
    if (amount.isZero() || amount.isNaN()) return null
    try {
      const validatorId = await validator(stakingContract)
      if (validatorId == null) return null
      const APR_QUERY = gql`
        query getApr($amount: String!, $id: Int!) {
          calculateApr(
            validatorId: $id,
            amount: $amount,
            duration: 0
          )
        }
      `
      const { calculateApr } = await aprSubgraphClients.request(APR_QUERY, {
        amount: amount.multipliedBy(bigIntToBigNumber(10n ** BigInt(currency.decimals))).toString(),
        id: Number(validatorId),
      })
      const aprValue = BigNumber(calculateApr)
      const estimatedValue = aprValue.multipliedBy(amount).dividedBy(100).multipliedBy(0.95)
      return { aprValue, estimatedValue }
    } catch(e) {
      return null
    }
  }

  const handleCalculateApr = async (amount: string) => {
    timeFlag = Date.now()
    const _flag = timeFlag
    const result = await getCalculateApr(BigNumber(amount))
    if (_flag === timeFlag) {
      if (result == null) {
        dispatch(updateCalculateApr({
          apr: 'NaN',
          estimatedRewards: 'NaN'
        }))
        return 
      } 
      const { aprValue, estimatedValue } = result
      dispatch(updateCalculateApr({
        apr: aprValue.toFixed(2, BigNumber.ROUND_DOWN),
        estimatedRewards: estimatedValue.toFixed(2, BigNumber.ROUND_DOWN),
      }))
    }
  }

  const debounceUpdateApr = useCallback(debounce((nextValue) => handleCalculateApr(nextValue), 250), [])

  const parseAmountChange = (event) => {
    if (!event.currentTarget.validity.valid) return
    const amount = event.target.value.replace(/,/g, '.')
    dispatch(
      replaceStakingState({
        amount,
        amountError: getAmountError(amount),
        percent: undefined,
      }),
    )
    debounceUpdateApr(amount);
  }

  const parseSlippagePercentToAmount = (percent) => {
    try {
      const amount = rawBalance.multipliedBy(new BigNumber(percent / 100))
      const amountStr = BigNumber(amount.toFixed(6, BigNumber.ROUND_DOWN)).toString()
      dispatch(
        replaceStakingState({
          amount: amountStr,
          amountError: '',
          percent,
        }),
      )
      handleCalculateApr(amountStr)
    } catch (e) {
      console.error(e)
    }
  }

  const buildSlippageSelection = () => {
    return (
      <Flex mt="12px">
        {slippagePercents.map((percent) => {
          return (
            <StyledButton
              onClick={() => {
                dispatch(updateSlippagePercent(percent))
                parseSlippagePercentToAmount(percent)
              }}
              className={slippagePercent === percent ? 'active' : ''}
            >
              <Box className="divider" />
              {percent}%
            </StyledButton>
          )
        })}
      </Flex>
    )
  }

  return (
    <>
      <Box>
        <Flex alignItems="center" justifyContent="space-between" mb="8px">
          <StyledText fontSize={["12px", "14px", "16px", "16px", "16px", "16px", "17px", "17px"]} fontWeight="600" color="textSubtle">
            {t('Staking amount')}
          </StyledText>
          <Flex alignItems="center">
            <Text fontSize={["12px", "12px", "12px", "12px", "12px", "12px", "13px", "13px"]} color="textSubtle" ml="3px">
              {t('%symbol% Available', {symbol: currency.symbol})}
            </Text>
            <Text fontSize={["12px", "12px", "12px", "12px", "12px", "12px", "13px", "13px"]} fontWeight="700" color="primary" ml="3px">
              {isWrongNetwork ? '--' : BigNumber(rawBalance).toFixed(2, BigNumber.ROUND_DOWN)}
            </Text>
            <Text fontSize={["12px", "12px", "12px", "12px", "12px", "12px", "13px", "13px"]} ml="3px">
              {currency.symbol}
            </Text>
          </Flex>
        </Flex>
        <Box>
          <Input
            scale="lg"
            inputMode="decimal"
            pattern="^[0-9]*[.,]?[0-9]{0,6}$"
            placeholder="0.00"
            value={stakingAmount}
            maxLength={20}
            // onBlur={() => {
            //   parseCustomSlippage((userSlippageTolerance / 100).toFixed(2))
            // }}
            onChange={parseAmountChange}
            isWarning={!!stakingAmountError}
            // isSuccess={![25, 50, 75, 100].includes(userSlippageTolerance)}
            style={{ textAlign: 'right' }}
          />
          {!!stakingAmountError && (
            <Text fontSize="14px" color="warning" mt="8px">
              {stakingAmountError}
            </Text>
          )}
          {buildSlippageSelection()}
        </Box>
        <Box my="24px">
          <Flex alignItems="center" justifyContent="space-between" mb="8px">
            <Text color="textSubtle" fontSize={["13px", "14px", "14px", "14px", "14px", "14px", "15px", "15px"]}>
              {t('Current estimated APR (%)')}
            </Text>
            <Text fontSize={["14px", "14px", "14px", "14px", "14px", "14px", "15px", "15px"]}>{apr === 'NaN' ? '--' : apr}</Text>
          </Flex>
          {/* <Flex alignItems="center" justifyContent="space-between" mb="8px">
            <Text color="textSubtle" fontSize="14px">
              {t('30 days')}
            </Text>
            <Text fontSize="14px">0 U2U</Text>
          </Flex>
          <Flex alignItems="center" justifyContent="space-between" mb="8px">
            <Text color="textSubtle" fontSize="14px">
              {t('90 days')}
            </Text>
            <Text fontSize="14px">0 U2U</Text>
          </Flex>
          <Flex alignItems="center" justifyContent="space-between" mb="8px">
            <Text color="textSubtle" fontSize="14px">
              {t('180 days')}
            </Text>
            <Text fontSize="14px">0 U2U</Text>
          </Flex> */}
          <Flex alignItems="center" justifyContent="space-between">
            <Text color="textSubtle" fontSize={["13px", "14px", "14px", "14px", "14px", "14px", "15px", "15px"]}>
              {t('Estimated rewards')}
            </Text>
            <Text fontSize={["14px", "14px", "14px", "14px", "14px", "14px", "15px", "15px"]}>{estimatedRewards === 'NaN' ? '--' : estimatedRewards} {currency.symbol}</Text>
          </Flex>
        </Box>
      </Box>
    </>
  )
}

export default FormStaking
