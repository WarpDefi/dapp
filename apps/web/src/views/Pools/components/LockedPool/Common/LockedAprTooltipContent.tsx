import { useTranslation } from '@pancakeswap/localization'

export default function LockedAprTooltipContent() {
  const { t } = useTranslation()
  return <>{t('To continue receiving U2U rewards, please migrate your Fixed-Term Staking U2U Balance to veU2U')}</>
}
