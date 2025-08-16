import { useTranslation } from '@pancakeswap/localization'
import { Flex, UserMenuItem, useModal } from '@pancakeswap/uikit'

import SettingsModal from 'components/Menu/GlobalSettings/SettingsModal'


type Props = {
  mode?: string
}

const SettingUserMenuItem = ({ mode }: Props) => {
  const { t } = useTranslation()

  const [onPresentSettingsModal] = useModal(<SettingsModal mode={mode} />)

  return (
    <UserMenuItem as="button" onClick={onPresentSettingsModal}>
      <Flex alignItems="center" justifyContent="space-between" width="100%">
        {t('Settings')}
      </Flex>
    </UserMenuItem>
  )
}

export default SettingUserMenuItem