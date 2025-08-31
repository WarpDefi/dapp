import { ChainId, TokenAmount, WAVAX, JSBI } from '@pangolindex/sdk'
import React, { useMemo } from 'react'
import styled from 'styled-components'
import { PNG } from '../../constants'
import { useTotalSupply } from '../../data/TotalSupply'
import { useActiveWeb3React } from '../../hooks'
import useCurrentBlockTimestamp from '../../hooks/useCurrentBlockTimestamp'
import { useTokenBalance } from '../../state/wallet/hooks'
import { TYPE } from '../../theme'
import { computeBagCirculation } from '../../utils/computeBagCirculation'
import { AutoColumn } from '../Column'
import { RowBetween } from '../Row'
import { CardSectionV2, DataCard } from '../pool/styled'
import { usePair } from '../../data/Reserves'
import { injected } from '../../connectors'
import useUSDCPrice from '../../utils/useUSDCPrice'
import { useStakingInfo, StakingType } from '../../state/stake/hooks'
import { useStakingInfoFor } from '../../state/stake/hooksSingle'

const ContentWrapper = styled(AutoColumn)`
   width: 100%;
 `
 
const ModalUpper = styled(DataCard)`
   box-shadow: rgb(0 0 0 / 50%) 0px 0px 8px;
   background: #e6fafb;
   padding: 0.5rem;
   border-radius: 30px;
 `

 const AddCNR = styled.span`
  width: 100%;
  height: 100%;
  font-weight: 500;
  font-size: 32;
  padding: 4px 6px;
  align-items: center;
  text-align: center;
  background: radial-gradient(174.47% 188.91% at 1.84% 0%,#31418e 0%,#6acad4 100%),#edeef2;
  border-radius: 12px;
  white-space: nowrap;
  cursor: pointer;
  :hover {
    opacity: 0.8;
  }
`
let tvl = 0;
let count = 0;
let countFor = 0;

export default function BagBalanceContent({ setShowBagBalanceModal }: { setShowBagBalanceModal: any }) {
	const { account, chainId } = useActiveWeb3React()
	const bag = chainId ? PNG[ChainId.AVALANCHE] : undefined

	const isMetamask = window.ethereum && window.ethereum.isMetaMask

	const avaxPriceUSD = useUSDCPrice(WAVAX[chainId ? chainId : ChainId.AVALANCHE])

	//const total = useAggregateBagBalance()
	const bagBalance: TokenAmount | undefined = useTokenBalance(account ?? undefined, bag)
	const totalSupply: TokenAmount | undefined = useTotalSupply(bag)

	const stakingInfos = useStakingInfo(StakingType.PAIR)
	stakingInfos.map(info => {
		if(stakingInfos.length > count){
		tvl = tvl + Number(info?.totalStakedInUsd?.toFixed())
		count++
		}
	})

	const stakingInfosFor = useStakingInfoFor(StakingType.SINGLE)
	stakingInfosFor.map(info => {
		if(stakingInfosFor.length > countFor){
		tvl = tvl + Number(info?.totalStakedInUsd?.toFixed())
		countFor++
		}
	})

	// Determine BAG price in AVAX
	const wavax = WAVAX[chainId ? ChainId.AVALANCHE: 43114]
	const [, avaxBagTokenPair] = usePair(wavax, bag)
	const oneToken = JSBI.BigInt(1000000000000000000)
	let bagPrice: Number | undefined
	let bagPriceUSD: Number | undefined

	if (avaxBagTokenPair && bag) {
		const avaxBagRatio = JSBI.divide(JSBI.multiply(oneToken, avaxBagTokenPair.reserveOfToken(wavax).raw),
										 avaxBagTokenPair.reserveOfToken(bag).raw)
		bagPrice = JSBI.toNumber(avaxBagRatio) / 1000000000000000000
		bagPriceUSD = Number(bagPrice) * Number(avaxPriceUSD?.toFixed(2))
	}

	const blockTimestamp = useCurrentBlockTimestamp()
	//console.log(blockTimestamp)
	const circulation: TokenAmount | undefined = useMemo(
		() =>
			blockTimestamp && bag && chainId === ChainId.AVALANCHE//ChainId.AVALANCHE MAINNET 
				? computeBagCirculation(bag, blockTimestamp)
				: totalSupply,
		[blockTimestamp, chainId, totalSupply, bag]
	)

	const marketCap = Number(circulation?.toFixed(0)) * Number(bagPriceUSD)

	/*fetch("https://apiv1.canarydefi.com/cnr/circulating-supply-whole")
	.then((res) => res.json())
	.then((json) => {
		console.log(json)
	});*/

	return (
		<ContentWrapper gap="lg">
			<ModalUpper>
				<CardSectionV2 gap="md">
					<RowBetween>
						<TYPE.white color="#2f2e80" fontSize={"25px"} fontWeight={"550"}>Canary Stats</TYPE.white>
					</RowBetween>
				</CardSectionV2>
				{account && (
					<>
						<CardSectionV2 gap="sm">
							<AutoColumn gap="md">
								<RowBetween>
									<TYPE.white color="#2f2e80">Balance:</TYPE.white>
									<TYPE.white color="#2f2e80">{bagBalance?.toFixed(2, { groupSeparator: ',' })} CNR</TYPE.white>
								</RowBetween>
							</AutoColumn>
						</CardSectionV2>
					</>
				)}
				
				<CardSectionV2 gap="sm">
					<AutoColumn gap="md">
						<RowBetween>
							<TYPE.white color="#2f2e80">CNR price:</TYPE.white>
							<TYPE.white color="#2f2e80">{bagPriceUSD?.toFixed(4) ?? '-'} USD</TYPE.white>
						</RowBetween>
						<RowBetween>
							<TYPE.white color="#2f2e80">CNR in circulation:</TYPE.white>
							<TYPE.white color="#2f2e80">{circulation?.toFixed(0, { groupSeparator: ',' })}</TYPE.white>
						</RowBetween>
					</AutoColumn>
				</CardSectionV2>

				<CardSectionV2 gap="sm">
					<AutoColumn gap="md">
						<RowBetween>
							<TYPE.white color="#2f2e80">Market Cap:</TYPE.white>
							<TYPE.white color="#2f2e80">{marketCap?.toLocaleString("en-US", {minimumFractionDigits: 0, maximumFractionDigits: 0})} USD</TYPE.white>
						</RowBetween>
						<RowBetween>
							<TYPE.white color="#2f2e80">Total Supply</TYPE.white>
							<TYPE.white color="#2f2e80">{totalSupply?.toFixed(0, { groupSeparator: ',' })}</TYPE.white>
						</RowBetween>
					</AutoColumn>
				</CardSectionV2>
				{account && isMetamask && (
          <>
          <CardSectionV2 gap="sm">
            <AutoColumn gap="md">
              <AddCNR onClick={() => {
                injected.getProvider().then(provider => {
                  if (provider) {
                    provider.request({
                      method: 'wallet_watchAsset',
                      params: {
                        type: 'ERC20',
                        options: {
                          address: bag?.address,
                          symbol: bag?.symbol,
                          decimals: bag?.decimals,
                          image: 'https://raw.githubusercontent.com/canarydex/exchange-contracts/master/tokenlist/logos/canary.png',
                        },
                      },
                    }).catch((error: any) => {
                      console.error(error)
                    })
                  }
                });
              }
            }>
                <TYPE.white color="white">Add CNR to MetaMask</TYPE.white>
              </AddCNR>
            </AutoColumn>
          </CardSectionV2>
          </>
          )
        }
			</ModalUpper>
		</ContentWrapper>
	)
}
