import { useTranslation } from '@pancakeswap/localization'
import { CAKE_VAULT_SUPPORTED_CHAINS, isCakeVaultSupported } from '@pancakeswap/pools'
import { Button, Flex, Text, useModalV2 } from '@pancakeswap/uikit'
import { useMemo } from 'react'
import { SpaceProps } from 'styled-system'

import { useActiveChainId } from 'hooks/useActiveChainId'

import { useChainNames } from '../../../hooks/useChainNames'
import { ICakeLogo } from '../../Icons'
import { NetworkSwitcherModal } from './NetworkSwitcherModal'

type Props = SpaceProps

export function StakeButton(props: Props) {
  const { chainId } = useActiveChainId()
  const cakeVaultSupported = useMemo(() => isCakeVaultSupported(chainId), [chainId])
  const { t } = useTranslation()
  const { onOpen, onDismiss, isOpen } = useModalV2()
  const chainNames = useChainNames(CAKE_VAULT_SUPPORTED_CHAINS)

  const tips = (
    <Flex flexDirection="column" justifyContent="flex-start">
      <ICakeLogo />
      <Text mt="0.625rem">{t('Stake U2U to obtain iCAKE - in order to be eligible in this public sale.')}</Text>
    </Flex>
  )

  return !cakeVaultSupported ? (
    <>
      <NetworkSwitcherModal
        isOpen={isOpen}
        supportedChains={CAKE_VAULT_SUPPORTED_CHAINS}
        title={t('Stake U2U')}
        description={t('Lock U2U on %chain% to obtain iCAKE', {
          chain: chainNames,
        })}
        buttonText={t('Switch chain to stake U2U')}
        onDismiss={onDismiss}
        tips={tips}
      />
      <Button width="100%" onClick={onOpen} {...props}>
        {t('Stake U2U')}
      </Button>
    </>
  ) : null
}
