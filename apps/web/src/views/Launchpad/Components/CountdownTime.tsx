import { useTranslation } from "@pancakeswap/localization"
import { Box, Dots, Flex, Text } from "@pancakeswap/uikit"
import { useEffect, useRef, useState } from "react"
import { COUNTDOWN_TYPE, countdownDate } from "../helpers"

interface IProps {
	type: number
	time: number
	cb?: () => void
}

const CountdownTime = ({type, time, cb} : IProps) => {
  const { t } = useTranslation()
	const refInterval = useRef<any>()
	const refTimeoutCallback = useRef<any>()
	const refTimeout = useRef<any>()
	const [timeCountdownArray, setTimeCountdownArray] = useState<string[]>([])
	const [timeCountdown, setTimeCountdown] = useState<number |string | undefined>(0)
	const [loading, setLoading] = useState<boolean>(false)


	useEffect(() => {
		clearInterval(refInterval.current)
		if(type === COUNTDOWN_TYPE.ARRAY) {
			refInterval.current = countdownDate(time, setTimeCountdownArray, 1)
		} else {
			refInterval.current = countdownDate(time, setTimeCountdown)
		}

	}, [time, type])

	useEffect(() => {
		return () => {
			clearTimeout(refTimeoutCallback.current)
			clearInterval(refInterval.current)
		}
	}, [])



	useEffect(() => {
		if(timeCountdown === 0) {
			setLoading(true)
			clearTimeout(refTimeout.current)
			refTimeout.current = setTimeout(() => {
				setLoading(false)
			}, 2000)
		}
		if(timeCountdown === 0 && cb) {
			setTimeCountdown(undefined)
			if(cb) {
				clearTimeout(refTimeoutCallback.current)
				refTimeoutCallback.current = setTimeout(() => {
					cb()
				}, 500)
			}
		}
	}, [timeCountdown, cb])


	return (
		<>
		{type === COUNTDOWN_TYPE.ARRAY ? (
			<Flex justifyContent="center">
			{timeCountdownArray.length > 0 ? (
				<>
					<Box style={{ textAlign: 'center' }} mr={["12px", "12px", "16px", "16px", "20px", "20px", "24px"]}>
						<Text m="auto" width={["30px", "30px", "32px", "32px", "36px", "36px", "40px"]} fontSize={["24px", "24px", "26px", "26px", "30px", "30px", "32px"]} fontWeight="600" lineHeight="1" color='bright'>{timeCountdownArray[0]}</Text>
						<Text fontSize="11px" fontWeight="400" color='bright'>{t('Days')}</Text>
					</Box>
					<Box style={{ textAlign: 'center' }} mr={["12px", "12px", "16px", "16px", "20px", "20px", "24px"]}>
						<Text m="auto" width={["30px", "30px", "32px", "32px", "36px", "36px", "40px"]} fontSize={["24px", "24px", "26px", "26px", "30px", "30px", "32px"]} fontWeight="600" lineHeight="1" color='bright'>{timeCountdownArray[1]}</Text>
						<Text fontSize="11px" fontWeight="400" color='bright'>{t('Hours')}</Text>
					</Box>
					<Box style={{ textAlign: 'center' }} mr={["12px", "12px", "16px", "16px", "20px", "20px", "24px"]}>
						<Text m="auto" width={["30px", "30px", "32px", "32px", "36px", "36px", "40px"]} fontSize={["24px", "24px", "26px", "26px", "30px", "30px", "32px"]} fontWeight="600" lineHeight="1" color='bright'>{timeCountdownArray[2]}</Text>
						<Text fontSize="11px" fontWeight="400" color='bright'>{t('Minutes')}</Text>
					</Box>
					<Box style={{ textAlign: 'center' }}>
						<Text m="auto" width={["30px", "30px", "32px", "32px", "36px", "36px", "40px"]} fontSize={["24px", "24px", "26px", "26px", "30px", "30px", "32px"]} fontWeight="600" lineHeight="1" color='bright'>{timeCountdownArray[3]}</Text>
						<Text fontSize="11px" fontWeight="400" color='bright'>{t('Seconds')}</Text>
					</Box>
				</>
			) : (
				<Text m="auto" textAlign="right" fontSize={["20px", "20px", "20px", "24px", "28px", "28px", "32px"]} fontWeight="600" lineHeight="1" color='bright'> {loading ? '' : 'To be announced'} </Text>
			)}
		</Flex>
		) : (
			<>{ loading ? <Dots />  : timeCountdown || t('To be announced')}</>
		)}
	</>
	)
}

export default CountdownTime