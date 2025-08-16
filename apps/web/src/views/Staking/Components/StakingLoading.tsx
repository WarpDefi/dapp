import { Skeleton } from '@pancakeswap/uikit';
import { styled } from 'styled-components';

const ResponsiveGrid = styled.div`
  display: grid;
  grid-gap: 15px;
  align-items: center;

  padding: 15px 0px;

  grid-template-columns: 1fr 1fr;
`

function StakingLoading() {
  const loadingRow = (
    <ResponsiveGrid>
      <Skeleton height={25}/>
      <Skeleton height={25}/>
      <Skeleton height={50}/>
      <Skeleton height={50}/>
    </ResponsiveGrid>
  )
  return (
    <>
      {loadingRow}
      {loadingRow}
      {loadingRow}
      {loadingRow}
    </>
  )
}

export default StakingLoading
