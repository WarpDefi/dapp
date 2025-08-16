import { Card, CardProps } from '@pancakeswap/uikit'
import { styled } from 'styled-components'

export const BodyWrapper = styled(Card)`
  border-radius: 8px;
  max-width: 480px;
  width: 100%;
  z-index: 1;
  margin: 32px auto 0;
`

/**
 * The styled container element that wraps the content of most pages and the tabs.
 */
export default function AppBody({ children, ...cardProps }: { children: React.ReactNode } & CardProps) {
  return <BodyWrapper {...cardProps}>{children}</BodyWrapper>
}
