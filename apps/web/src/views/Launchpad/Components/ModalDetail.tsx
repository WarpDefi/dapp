import { useTranslation } from "@pancakeswap/localization";
import { AutoColumn, Box, Button, Dots, Flex, Modal, Skeleton, Text, useToast } from "@pancakeswap/uikit";
import { formatNumber } from "@pancakeswap/utils/formatBalance";
import BigNumber from "bignumber.js";
import { ToastDescriptionWithTx } from "components/Toast";
import { formatEther } from "ethers/lib/utils";
import { useActiveChainId } from "hooks/useActiveChainId";
import { useCallWithGasPrice } from "hooks/useCallWithGasPrice";
import useCatchTxError from "hooks/useCatchTxError";
import forEach from "lodash/forEach";
import React, { useEffect, useRef, useState } from "react";
import styled, { useTheme } from "styled-components";
import { getLaunchpadContract, getLaunchpadManagerContract } from "utils/contractHelpers";
import { Break, TableWrapper } from 'views/Info/components/InfoTables/shared';
import { useWalletClient } from "wagmi";
import { PHASES_TYPE } from "../helpers";
import { useFetchListCommit } from "../hooks/useFetchListCommit";
import { StyledButton } from "../styles";



const StyledModal = styled(Modal)`
  width: 800px;
  @media screen and (max-width: 767px) {
    width: 100%;
  }
`
const LayoutScroll = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-x: auto;
`
const ResponsiveGrid = styled.div`
  display: grid;
  grid-gap: 1em;
  align-items: center;
  grid-template-columns: repeat(5, 1fr);
  padding: 0 24px;
  > * {
    min-width: 120px;
    &:nth-child(4) {
      min-width: 123px;
    }
  }

`
const StyledText = styled(Text)`
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  color: ${({ theme }) => theme.colors.text};
`
const StyledButtonCancel = styled(Button)`
  height: 32px;
  font-size: 12px;
  font-weight: 500;
`

const TableLoader: React.FC<React.PropsWithChildren> = () => {
  const loadingRow = (
    <ResponsiveGrid>
      <Skeleton />
      <Skeleton />
      <Skeleton />
      <Skeleton />
			<Skeleton />
    </ResponsiveGrid>
  )
	return (
    <>
      {loadingRow}
      {loadingRow}
      {loadingRow}
    </>
  )
}

export default function ModalDetail({
	tokenName,
	saleEnd,
	account,
	launchpad,
	listPhase,
	onDismiss,
	fetchUserData,
	rate,
	isSortCap,
	initContract,
	refetchListLaunchpad
}) {
	const { data: signer } = useWalletClient()
	const { chainId } = useActiveChainId()
	const { callWithGasPrice } = useCallWithGasPrice()
	// const [configByContract, setConfigByContract] = useState<any>({})
	const configByContract = useRef<any>({})
  const { fetchWithCatchTxError } = useCatchTxError()
	const { toastSuccess, toastError } = useToast()
  const { t } = useTranslation();
	const theme = useTheme()
	const { data, refetch, isLoading } = useFetchListCommit(account, launchpad)
	const list = data || []
	const [giveBackAmount, setGiveBackAmount] = useState<number | string>(0)
	const launchpadContract = useRef<any>()
	const [loadingClaim, setLoadingClaim] = useState<boolean>(false)
	const [disableClaim, setDisableClaim] = useState<boolean>(false)
	const [isCancel, setIsCancel] = useState<boolean>(false)

	const getGiveBack = async () => {
		try {
			if(launchpadContract.current?.account) { 
				const res = await launchpadContract.current.read.getGiveBack([account])
				setGiveBackAmount(formatEther(res))
			}
		}catch{
			//
		}
	}

	const handleCancel = async (item) => {
		setIsCancel(true)
		const _contract = getLaunchpadContract(item.roundAddress, signer ?? undefined, chainId)
		try {
			const res = await fetchWithCatchTxError(() => _contract.write.cancelCommit())
			if(res?.status) {
				refetch()
				fetchUserData()
				getGiveBack()
				initContract()
				toastSuccess(
					t('Success!'),
					<ToastDescriptionWithTx txHash={res.transactionHash}>
						Cancel successfully
					</ToastDescriptionWithTx>,
				)
			}
			setIsCancel(false)
		} catch(error: any) {
			setIsCancel(false)
			const errorDescription = `${error.message} - ${error.data?.message}`
			toastError(t('Failed'), errorDescription)
		}
	}

	const handleClaim = async () => {
		refetchListLaunchpad()
		setLoadingClaim(true)
		const _contract = getLaunchpadManagerContract(launchpad, signer ?? undefined, chainId)
		try {
			// const res = await fetchWithCatchTxError(() => isSortCap ? _contract.write.withdrawSoftCap() : _contract.write.claimToken())
			const res = await fetchWithCatchTxError(() => callWithGasPrice(_contract, isSortCap ? 'withdrawSoftCap' : 'claimToken'))
			if(res?.status) {
				refetch()
				fetchUserData()
				getGiveBack()
				refetchListLaunchpad()
				toastSuccess(
					t('Success!'),
					<ToastDescriptionWithTx txHash={res.transactionHash}>
						Claim Token successfully
					</ToastDescriptionWithTx>,
				)
			}
			setLoadingClaim(false)
		} catch(error: any) {
			const errorDescription = `${error.message} - ${error.data?.message}`
			toastError(t('Failed'), errorDescription)
			setLoadingClaim(false)
		}
	}

	const getConfig = async (item) => {
		const _contract = getLaunchpadContract(item.roundAddress, signer ?? undefined, chainId)
		const _configInfo: any = await _contract.read.getConfigInfo()
		configByContract.current [item.roundAddress.toLowerCase()] = {..._configInfo, startCancel: BigNumber(_configInfo.startCancel).toNumber() * 1000, endCancel: BigNumber(_configInfo.endCancel).toNumber() * 1000}
		// setConfigByContract({
		// 	...configByContract,
		// 	[item.roundAddress.toLowerCase()]: {..._configInfo, startCancel: BigNumber(_configInfo.startCancel).toNumber() * 1000, endCancel: BigNumber(_configInfo.endCancel).toNumber() * 1000}
		// })
	}

	useEffect(() => {
		if(list && list?.length > 0 && signer) {
			let _disable = true
			forEach(list, (item) => {
				if(item.roundType === PHASES_TYPE.TIER) {
					launchpadContract.current = getLaunchpadContract(item.roundAddress, signer, chainId)
				}
				if(item.roundAddress) {
					getConfig(item)
				}
				if(!item.isClaimed && BigNumber(item.u2uAmount).gt(0)) {
					_disable = false
				}
			})
			setDisableClaim(_disable)
			if(launchpadContract.current?.account) {
				getGiveBack()
			}
		}
	}, [list, signer])

	const checkTimeCancel = (_config) => {
		if(_config) {
			return _config.startCancel < Date.now() && _config.endCancel > Date.now()
		}
		return false
	}

	const endTime = saleEnd < Date.now()

	const enableClaim = (BigNumber(giveBackAmount).gt(0) || (endTime && !disableClaim)) && list.length > 0

	const renderAction = (item) => {
		if(item?.isClaimed) {
			return 'Claimed'
		}
		if(endTime && BigNumber(item.u2uAmount).gt(0)) {
			return 'Ready to claim'
		}
		if(BigNumber(item.u2uAmount).lte(0)) {
			return 'Cancelled'
		}
		if(checkTimeCancel(configByContract.current[item.roundAddress.toLowerCase()])){
			return <StyledButtonCancel disabled={isCancel} variant="cancel" onClick={() => handleCancel(item)}>{isCancel ? <Dots>Canceling</Dots> : 'Cancel'}</StyledButtonCancel>
		} 
		return null
	}

  return (
      <StyledModal title={t('Your Committed Detail')} onDismiss={onDismiss}  >
          <TableWrapper>
            <LayoutScroll>
              <ResponsiveGrid>
                <Text color="textSubtle" textAlign="center">
                  {t('ROUND')}
                </Text>
                <Text color="textSubtle" textAlign="center">
                  {t('COMMITTED')}
                </Text>
								<Text color="textSubtle" textAlign="center">
                  {t('GIVE BACK')}
                </Text>
                <Text color="textSubtle" textAlign="center">
                  {t('TOKEN')}
                </Text>
                <Text color="textSubtle" textAlign="center">
                  {t('ACTION')}
                </Text>
              </ResponsiveGrid>
              <AutoColumn gap="16px">
                <Break/>
                { isLoading ? <TableLoader/> : list?.map(item => (
                  <React.Fragment key={item.id}>
										<ResponsiveGrid>
											<StyledText>{listPhase[item.roundAddress.toLowerCase()]?.name}</StyledText>
											<StyledText>{formatNumber(BigNumber(formatEther(item.u2uAmount)).toNumber(), 0, 6)} U2U</StyledText>
											<StyledText>{item.roundType === PHASES_TYPE.TIER && formatNumber(Number(giveBackAmount), 0, 6)}</StyledText>
											<StyledText>{ (configByContract.current[item.roundAddress.toLowerCase()]?.endCancel < Date.now() || !isSortCap) ? `${formatNumber(BigNumber(formatEther(item.u2uAmount)).minus(item.roundType === PHASES_TYPE.TIER ? giveBackAmount : 0).toNumber() * rate, 0, 6)} ${tokenName}`: !isSortCap && 'Calculating' } </StyledText>
											<Box style={{ textAlign: 'center', color: `${ renderAction(item) === 'Claimed' ? theme.colors.primary : renderAction(item) === 'Cancelled' ? theme.colors.failure : renderAction(item) === 'Ready to claim' ? theme.colors.yellow : theme.colors.text }` }}>
												{renderAction(item)}
											</Box>
										</ResponsiveGrid>
                    <Break />
									</React.Fragment>
                ))}
								{!isLoading && list?.length === 0 && (
									<Flex my="16px" flexDirection="column" alignItems="center" justifyContent="center">
										<img src='/images/no-data.svg' alt="" />
										<Text color='textSubtle'>{t('No Data')}</Text>
									</Flex>
								)}
              </AutoColumn>
            </LayoutScroll>
          </TableWrapper>
        <Box mt="16px" style={{ textAlign: 'center' }}>
          <StyledButton disabled={!enableClaim || disableClaim || loadingClaim} className="button-hover" width="200px" onClick={handleClaim}>{ loadingClaim ? <Dots>{endTime ? 'Claim Now' : 'Get U2U Give Back'}</Dots> : endTime ? 'Claim Now' : 'Get U2U Give Back'}</StyledButton>
        </Box>
      </StyledModal>
  )
}
