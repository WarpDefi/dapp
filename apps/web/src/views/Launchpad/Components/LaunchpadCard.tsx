import { useTranslation } from '@pancakeswap/localization'
import { Box, Button, Flex, OpenNewIcon, Progress, Text } from '@pancakeswap/uikit'
import { formatNumber } from '@pancakeswap/utils/formatBalance'
import BigNumber from 'bignumber.js'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import { useActiveChainId } from 'hooks/useActiveChainId'
import forEach from 'lodash/forEach'
import NextLink from 'next/link'
import { useEffect, useRef, useState } from 'react'
import styled, { useTheme } from 'styled-components'
import { getLaunchpadManagerContract } from 'utils/contractHelpers'
import { formatEther } from 'viem'
import { useWalletClient } from 'wagmi'
import { COUNTDOWN_TYPE, LAUNCHPAD_STATUS, getColorLaunchpadByStatus, getStatusNameByTime } from '../helpers'
import { ILaunchpadItem } from '../types/LaunchpadType'
import CountdownTime from './CountdownTime'


const CardLayout = styled(Box)`
  @property --angle {
    syntax: '<angle>';
    inherits: true;
    initial-value: 0deg;
  }
	--angle: 0deg;
  position: relative;
  border-radius: 8px;
  border: 2px solid ${({ theme }) => theme.colors.cardBorder};
  box-shadow: ${({ theme }) => theme.shadows.card};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  overflow: hidden;
  transition: all 0.3s ease 0s;
  &:hover {
    transform: translateY(-5px);
    background: linear-gradient(${({ theme }) => theme.colors.backgroundAlt}, ${({ theme }) => theme.colors.backgroundAlt}) padding-box, conic-gradient(from var(--angle), #000, #9A6AFF, #53DEE9, #000 25%) border-box;
    border-color: transparent;
    animation: rotate-gradient 5s linear 0s infinite normal none running;
  }
  @keyframes rotate-gradient {
    from { --angle: 0deg; }
    to { --angle: 360deg; }
  }
`
const CardHeader = styled(Box)`
  position: relative;
  background: ${({ theme }) => theme.colors.backgroundPage};
  // aspect-ratio: 16/9;
  padding-bottom: 25%;
  overflow: hidden;
  &:before {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
    transform: translate(-100%);
    background-image: linear-gradient(270deg, rgba(255, 255, 255, 0.2) 0, rgba(255, 255, 255, 0));
    animation: shimmer 1.5s infinite;
  }
  @keyframes shimmer {
    to {
      transform:translate(100%)
    }
  }
`
const CardBody = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
`
const Image = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  min-width: 100%;
  max-width: 100%;
  min-height: 100%;
  max-height: 100%;
  object-fit: cover;
`
const Video = styled.video`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  min-width: 100%;
  max-width: 100%;
  min-height: 100%;
  max-height: 100%;
  object-fit: cover;
`
const StyledLogo = styled(Box)`
  --size: 72px;
  position: relative;
  min-width: var(--size);
  width: var(--size);
  height: var(--size);
  border-radius: ${({ theme }) => theme.radii.card};
  box-shadow: ${({ theme }) => theme.shadows.card};
  border: 2px solid ${({ theme }) => theme.colors.cardBorder};
  overflow: hidden;
  &:before {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
    transform: translate(-100%);
    background-image: linear-gradient(270deg, rgba(255, 255, 255, 0.2) 0, rgba(255, 255, 255, 0));
    animation: shimmer 2.25s infinite;
    z-index: 1;
  }
  @keyframes shimmer {
    to {
      transform:translate(100%)
    }
  }
  @media screen and (max-width: 1439px) {
    --size: 66px;
  }
  @media screen and (max-width: 1199px) {
    --size: 60px;
  }
  @media screen and (max-width: 991px) {
    --size: 54px;
  }
  @media screen and (max-width: 424px) {
    --size: 50px;
  }
`
const StyledButton = styled(Button)`
  --size: 36px;
  --space: 35px;
  min-width: calc(var(--size) + var(--space));
  width: calc(var(--size) + var(--space));
  height: var(--size);
  white-space: wrap;
  font-weight: 700;
  line-height: calc(20/16);
  margin-bottom: 4px;
  @media screen and (max-width: 1439px) {
    --space: 30px;
  }
  @media screen and (max-width: 1199px) {
    --size: 32px;
    min-width: var(--size);
    width: var(--size);
    padding: 0;
    border-radius: 6px;
  }
  @media screen and (max-width: 424px) {
    --size: 30px;
  }
  span {
    @media screen and (max-width: 1199px) {
      display: none;
    }
  }
  svg {
    fill: ${({ theme }) => theme.colors.black};
    @media screen and (min-width: 1200px) {
      display: none
    }
  }
`
const StyledText = styled(Text)`
  font-family: 'Metuo', sans-serif;
  font-size: 18px;
  font-weight: 900;
  line-height: calc(24/20);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  @media screen and (max-width: 1439px) {
    font-size: 17px;
  }
  @media screen and (max-width: 575px) {
    font-size: 16px;
  }
`
const StyledDot = styled(Box)`
  --size: 12px;
  position: relative;
  width: calc(var(--size) / 2);
  height: calc(var(--size) / 2);
  border-radius: 50%;
  margin: 3px;
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    opacity: 0.4;
    width: var(--size);
    height: var(--size);
    background: inherit;
  }

`
const IconUser = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  color: ${({ theme }) => theme.colors.primary};
  transition: all 0.3s ease-out;
  background: #00000080;
  border-radius: 6px;
  &:hover {
    color: ${({ theme }) => theme.colors.hover};
  }
  svg {
    --size:24px;
    width: var(--size);
    height: var(--size);
  }
`
const StyledTextInfo = styled(Text)`
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;  
  overflow: hidden;
  min-height: 45px;
  @media screen and (max-width: 1439px) {
    min-height: 42px;
  }
`

type LaunchpadProps ={
  type?: string,
	item: ILaunchpadItem,
	filterType?: string | null,
	isContribution: boolean
}

const imageExtensions = ['.gif', '.jpg', '.jpeg', '.png', '.svg', '']
const videoExtensions =['.mpg', '.mp2', '.mpeg', '.mpe', '.mpv', '.mp4']

const LaunchpadCard = ({ item, isContribution }: LaunchpadProps) => {
  const { t } = useTranslation()
  const theme = useTheme();
	const launchpadManagerContract = useRef<any>()
	const [timeCountdown, setTimeCountdown] = useState<number>(0)
	const [totalCommit, setTotalCommit] = useState<number>(0)
	const { chainId } = useActiveChainId()
	const { data: signer } = useWalletClient()
  const { account } = useAccountActiveChain()
	const [totalCommitByUser, setTotalCommitByUser] = useState<number>(0)

  const isImageOrVideo = (list, v) => {
    let status = false
    forEach(list, (e) => {
      if(v?.includes(e)) {
        status = true
      }
    })
    return status
  }
	
	const getTotalUserCommitted = async () => {
		try {
			if(account && launchpadManagerContract.current.account) {
				const _totalCommitted: any = await launchpadManagerContract.current.read.totalCommitByUser([account])
				setTotalCommitByUser(BigNumber(formatEther(_totalCommitted)).toNumber())
			}
		}catch(ex) {
			//
		}
	}
	
	const getTotalCommit = async () => {
		try {
			const _totalCommit: any = await launchpadManagerContract.current.read.totalCommit()
			const _total = BigNumber(formatEther(_totalCommit)).toNumber()
			setTotalCommit(_total)
		}catch {
			//
		}
	}

	const checkTimeCountdown = () => {
		if(item.saleStart && item.status === LAUNCHPAD_STATUS.UPCOMING) {
			setTimeCountdown(item.saleStart)
		}
		if(item.saleEnd && item.status === LAUNCHPAD_STATUS.ON_GOING) {
			setTimeCountdown(item.saleEnd)
		}
	}



	useEffect(() => {
		if(item.contractAddress && item.contractAddress?.length > 0 && signer) {
			launchpadManagerContract.current = getLaunchpadManagerContract(item.contractAddress, signer ?? undefined, chainId)
			getTotalCommit()
			getTotalUserCommitted()
		}
	}, [item, account, signer])


	useEffect(() => {
		checkTimeCountdown()
	}, [])




  return (
    <CardLayout>
      <CardHeader>
        {isImageOrVideo(imageExtensions, item?.projectImageThumbnail) && (
          <Image src={item?.projectImageThumbnail} alt=''/>
        )}
        {isImageOrVideo(videoExtensions, item?.projectImageThumbnail) && (
          <Video autoPlay loop muted>
            <source src={item?.projectImageThumbnail} type="video/mp4" />
          </Video>
        )}
				{isContribution && (
					<IconUser>
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
				</IconUser>
				)}

      </CardHeader>
      <CardBody>
        <Flex
          alignItems="center"
          justifyContent="space-between"
          className='border-neubrutal'
          borderRadius="8px"
          p={["10px", "10px", "12px", "12px", "12px", "12px", "14px"]}
          background={theme.colors.backgroundPage}
        >
          <StyledLogo>
						<Image src={item.tokenLogo} alt=''/>
          </StyledLogo>
          <Box style={{ flex: 1 }} overflow="hidden" mt="2px" ml={["12px", "16px", "16px", "16px", "16px", "20px", "24px"]}>
            <StyledText title={item.projectName}>{item.projectName}</StyledText>
            <Flex justifyContent="space-between" mt="4px">
              <Flex alignItems="center">
                <StyledDot
                  background={getColorLaunchpadByStatus(getStatusNameByTime(item, totalCommitByUser, totalCommit), theme)}
                />
                <Text
                  ml="6px"
                  fontSize="14px"
                  fontWeight="600"
                  lineHeight="20px"
                  color={getColorLaunchpadByStatus(getStatusNameByTime(item, totalCommitByUser, totalCommit), theme)}
                >
                  {
                    getStatusNameByTime(item, totalCommitByUser, totalCommit)
                  }
                </Text>
              </Flex>
              <NextLink href={`/launchpad/${item.contractAddress}`} passHref>
                <StyledButton
                  className="button-hover"
                >
                  <span>{t('View')}</span>
                  <OpenNewIcon/>
                </StyledButton>
              </NextLink>
            </Flex>

          </Box>
        </Flex>
        <Flex flexDirection="column" height="100%" px={["0", "0", "16px", "16px", "0", "0", "16px"]} p="16px">
          <StyledTextInfo fontSize={["14px", "14px", "14px", "14px", "14px", "14px", "14px", "15px"]} fontWeight="400" mb="16px" color='textSubtle'>{item.shortDescription}</StyledTextInfo>
          <Box mt="auto">
            <Flex justifyContent="space-between" mb="12px">
              <Text minWidth="68px" fontSize={["14px", "14px", "14px", "14px", "14px", "14px", "14px", "15px"]} fontWeight="600" lineHeight="20px" color='textSubtle'>{t('Sale Price')}</Text>
              <Text ml="12px" textAlign="right" fontSize={["15px", "15px", "16px", "16px", "15px", "16px", "17px"]} fontWeight="700" lineHeight="20px" color='text'>{item?.priceToken ? `1 ${item?.tokenSymbol} = ${item?.priceToken} U2U` : 'TBA'}</Text>
            </Flex>
            <Flex justifyContent="space-between">
              <Text minWidth="68px" fontSize={["14px", "14px", "14px", "14px", "14px", "14px", "14px", "15px"]} fontWeight="600" lineHeight="20px" color='textSubtle'>{t('Total Raise')}</Text>
              <Text ml="12px" textAlign="right" fontSize={["15px", "15px", "16px", "16px", "15px", "16px", "17px"]} fontWeight="700" lineHeight="20px" color='text'>{item?.totalRaise ? `${formatNumber(item?.totalRaise, 0, 6)} U2U` : 'TBA'}</Text>
            </Flex>
          </Box>
        </Flex>
        {item.status === LAUNCHPAD_STATUS.UPCOMING ? (
          <Flex
            mt="auto"
            borderRadius="8px"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            className='border-neubrutal'
            p={["27px 12px", "27px 16px", "27px 16px", "27px 16px", "27px 16px", "27px 16px", "30px 16px"]}
            style={{ background: '#445434' }}
					>
            <Text style={{ color: theme.colors.bright }} fontSize="16px" fontWeight="600" lineHeight="20px" mb="8px">{t('Sale start in')}</Text>
            <Text minWidth={250} textAlign="center" color='secondary' fontSize={["24px", "24px", "24px", "25px", "24px", "24px", "28px"]} fontWeight="600" style={{ lineHeight: 'calc(34/28)' }}>{ item.saleStart ? <CountdownTime type={COUNTDOWN_TYPE.STRING} time={timeCountdown}/> : t('To be announced')}</Text>
          </Flex>
        ) : (
          <Box mt="auto" className='border-neubrutal' borderRadius="8px" p={["16px 12px", "16px 12px", "16px 12px", "16px 12px", "16px 12px", "16px 12px","20px 16px"]}>
            <Flex alignItems="center" justifyContent="space-between" mb="20px">
              <Text fontFamily="'Metuo', sans-serif" fontSize={["16px", "18px", "18px", "18px", "16px", "16px", "18px"]} fontWeight="900" lineHeight="1">{t('Progress')}</Text>
              <Text textAlign="right" minWidth={145} fontSize={["14px", "16px", "16px", "16px", "14px", "14px", "16px"]} lineHeight="1">
								{item.saleEnd > Date.now() ? <CountdownTime type={COUNTDOWN_TYPE.STRING} time={timeCountdown}/> : 'Ended'} 
							</Text>
            </Flex>
            <Flex alignItems="center" justifyContent="space-between" mb="10px">
              <Flex>
                <Text fontSize={["14px", "14px", "14px", "14px", "14px", "14px", "14px", "15px"]} fontWeight="700" lineHeight="24px">{formatNumber(totalCommit, 0, 6)}</Text>
                <Text color='textSubtle' fontSize={["10px", "10px", "10px", "10px", "10px", "10px", "10px", "12px"]} lineHeight="24px" ml="6px">U2U Raised</Text>
              </Flex>
              <Text color='textSubtle' fontSize={["14px", "14px", "14px", "14px", "14px", "14px", "14px", "15px"]} fontWeight="600">{formatNumber(item?.totalRaise ? (totalCommit / item?.totalRaise) * 100 : 0, 0, 2) }%</Text>
            </Flex>
            <Progress primaryStep={item?.totalRaise ? (totalCommit / item?.totalRaise) * 100 : 0 } scale="sm" />
          </Box>
        )}
      </CardBody>
    </CardLayout>
  )
}

export default LaunchpadCard