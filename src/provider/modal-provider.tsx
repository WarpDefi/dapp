import { DisclaimerModal } from '@/components/modals/disclaimer-modal'
import WalletModal from '@/components/WalletModal'
import React, { useEffect, useState } from 'react'

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <>
      <DisclaimerModal />
      <WalletModal ENSName={undefined} />
    </>
  )
}
