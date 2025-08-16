import { useTranslation } from '@pancakeswap/localization'
import { BoxProps, Modal } from '@pancakeswap/uikit'
import { TYPE_SWAP } from 'state/swap/reducer'

interface ConfirmSwapModalContainerProps extends BoxProps {
  hideTitleAndBackground?: boolean
  headerPadding?: string
  bodyTop?: string
  bodyPadding?: string
  handleDismiss: () => void
  typeSwap?: number
}

const ConfirmSwapModalContainer: React.FC<React.PropsWithChildren<ConfirmSwapModalContainerProps>> = ({
  children,
  headerPadding,
  bodyTop,
  bodyPadding,
  hideTitleAndBackground,
  typeSwap,
  handleDismiss,
  ...props
}) => {
  const { t } = useTranslation()

  return (
    <Modal
      {...props}
      title={hideTitleAndBackground ? '' : (typeSwap !== undefined ? typeSwap === TYPE_SWAP.BUY ? 'Confirm Buy' : 'Confirm Sell' : 'Confirm Swap')}
      headerPadding={hideTitleAndBackground && headerPadding ? headerPadding : '12px 24px'}
      bodyPadding={hideTitleAndBackground && bodyPadding ? bodyPadding : '24px'}
      bodyTop={bodyTop}
      headerBackground={hideTitleAndBackground ? 'transparent' : 'gradientCardHeader'}
      headerBorderColor={hideTitleAndBackground ? 'transparent' : null}
      onDismiss={handleDismiss}
    >
      {children}
    </Modal>
  )
}

export default ConfirmSwapModalContainer
