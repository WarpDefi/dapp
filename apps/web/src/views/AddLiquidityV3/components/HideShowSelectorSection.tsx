import { AutoRow, Button, ChevronDownIcon } from '@pancakeswap/uikit'
import { LightGreyCard } from 'components/Card'
import { Dispatch, ReactNode, SetStateAction } from 'react'
import styled from 'styled-components'

const StyledLightGreyCard = styled(LightGreyCard)`
  padding: 16px;
  border-width: 2px;
  border-radius: 8px;
  box-shadow: ${({ theme }) => theme.shadows.card};
`
const StyledButton = styled(Button)`
  &:hover {
    color: ${({ theme }) => theme.colors.hover};
  }
`

interface HideShowSelectorSectionPropsType {
  noHideButton?: boolean
  showOptions: boolean
  setShowOptions: Dispatch<SetStateAction<boolean>>
  heading: ReactNode
  content: ReactNode
}

export default function HideShowSelectorSection({
  noHideButton,
  showOptions,
  setShowOptions,
  heading,
  content,
}: HideShowSelectorSectionPropsType) {
  return (
    <StyledLightGreyCard style={{ height: 'fit-content' }}>
      <AutoRow justifyContent="space-between" marginBottom={showOptions ? '8px' : '0px'}>
        {heading ?? <div />}
        {noHideButton || (
          <StyledButton
            scale="sm"
            onClick={() => setShowOptions((prev) => !prev)}
            variant="text"
            endIcon={
              !showOptions && (
                <ChevronDownIcon
                  style={{
                    marginLeft: '0px',
                  }}
                  color="primary"
                />
              )
            }
          >
            {showOptions ? 'Hide' : 'More'}
          </StyledButton>
        )}
      </AutoRow>
      {showOptions && content}
    </StyledLightGreyCard>
  )
}
