import { Skeleton } from '@pancakeswap/uikit';
import { styled } from 'styled-components';

const ResponsiveGrid = styled.div`
  display: grid;
  grid-gap: 15px;
  align-items: center;
  padding: 15px 0px;
`

function LoanLoading() {
  const loadingRow = (
    <ResponsiveGrid>
      <Skeleton height={50}/>
      <Skeleton height={100}/>
      <Skeleton height={150}/>
    </ResponsiveGrid>
  )
  return (
    <>
      {loadingRow}
      {loadingRow}
      {loadingRow}
    </>
  )
}

export default LoanLoading
