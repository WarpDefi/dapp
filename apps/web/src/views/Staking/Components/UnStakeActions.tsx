import { useTranslation } from '@pancakeswap/localization'
import { Box, Button, Text } from '@pancakeswap/uikit'
import dayjs from 'dayjs'
import { MouseEventHandler, useEffect, useState } from 'react'
import { StakedInfo } from '../Hooks/useStakingList'

type UnStakeActionsProps = {
  title: string
  data: StakedInfo
  periodTime: number
  handleWithdraw: MouseEventHandler | undefined
}

const useCountdown = (time) => {

  const [countDown, setCountDown] = useState(time);

  useEffect(() => {
    if (time <= 0) return
    const interval = setInterval(() => {
      setCountDown(time - 1000);
    }, 1000);

    // eslint-disable-next-line consistent-return
    return () => {
       clearInterval(interval);
    }
  }, [time])

  return {countDown}
};

export function UnStakeActions({ title, data, periodTime, handleWithdraw }: UnStakeActionsProps) {
  const { t } = useTranslation()

  const unStakeTime = dayjs.unix(data.timestamp)
  const remainTime = unStakeTime.add(periodTime, 'second').diff(dayjs()) // default milliseconds

  const {countDown} = useCountdown(remainTime)

  if (remainTime <= 0) {
    return (
      <Button height="40px" variant="secondary" className="button-hover" onClick={handleWithdraw}>
        {title}
      </Button>
    )
  }
  return (
    <Box>
      <Text textAlign="center" fontSize="16px" fontWeight="700" color="secondary">
        {t('Release In')}
      </Text>
      <Text fontSize="16px" letterSpacing="0.5px" fontWeight="500">
        {dayjs.duration(countDown).format('HH:mm:ss')}
      </Text>
    </Box>
  )
}
