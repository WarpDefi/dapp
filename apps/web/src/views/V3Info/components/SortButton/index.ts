import { Button } from '@pancakeswap/uikit'
import { useCallback } from 'react'
import { styled } from 'styled-components'

export const useSortFieldClassName = (sortField: string, sortDirection: boolean) =>
  useCallback(
    (field: string) => {
      const directionArrow = !sortDirection ? 'is-asc' : 'is-desc'
      return sortField === field ? directionArrow : ''
    },
    [sortDirection, sortField],
  )

export const SortButton = styled(Button)`
  padding: 4px 8px;
  border-radius: 4px;
  width: 25px;
  height: 25px;
  margin-left: 3px;
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  background: ${({ theme }) => theme.colors.backgroundItem};
  path {
    fill: ${({ theme }) => theme.colors.textSubtle};
  }
  &.is-asc {
    box-shadow: ${({ theme }) => theme.shadows.input};
    background: ${({ theme }) => theme.colors.input};
    path:first-child {
      fill: rgba(255, 255, 255, 1);
    }
    path:last-child {
      fill: rgba(255, 255, 255, 0.3);
    }
  }
  &.is-desc {
    box-shadow: ${({ theme }) => theme.shadows.input};
    background: ${({ theme }) => theme.colors.input};
    path:first-child {
      fill: rgba(255, 255, 255, 0.3);
    }
    path:last-child {
      fill: rgba(255, 255, 255, 1);
    }
  }
`
