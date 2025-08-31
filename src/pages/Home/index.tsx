import React from 'react'
import { AutoColumn } from '../../components/Column'
import styled from 'styled-components'

import Banner1 from '../../assets/images/banners/LMAC.jpg'
import Banner2 from '../../assets/images/banners/CAB.jpg'
import Banner3 from '../../assets/images/banners/BBMS.jpg'
//import BagBalanceContent from '../../components/Header/BagBalanceContent'
//import Banner4 from '../../assets/images/banners/MAINNET.jpg'
//import { useActiveWeb3React } from '../../hooks'
//import { ChainId } from '@pangolindex/sdk'

const PageWrapper = styled(AutoColumn)`
  width: 100%;
`

const TopSection = styled(AutoColumn)`
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  max-width: 960px;
  width: 100%;
`

const BannerDiv = styled.div`
  width: 100%;
`

const BannerImg = styled.img`
box-shadow: rgb(0 0 0 / 50%) 0px 0px 8px;
  width: 100%;
  height: 100%
  background-size: cover;
  background-position: left center;
  cursor: pointer;
  border-radius: 30px;
`

export default function Home() {
  //const { chainId } = useActiveWeb3React()

  /*
         {chainId == ChainId.AVALANCHE? 
            <BannerDiv><BagBalanceContent setShowBagBalanceModal={true} /></BannerDiv>
           : <BannerDiv><BannerImg src={Banner4}/></BannerDiv>}
  */

  return (
    <PageWrapper gap="lg" justify="center">
      <TopSection>
        <BannerDiv>
          <a href="https://docs.canary.exchange/" target="_blank" rel="noreferrer">
            <BannerImg src={Banner1} />
          </a>
        </BannerDiv>
        <BannerDiv>
          <a href="https://canarydex.medium.com/canary-academy-521a52500e0d" target="_blank" rel="noreferrer">
            <BannerImg src={Banner2} />
          </a>
        </BannerDiv>
        <BannerDiv>
          <a href="https://boogeybirds.com/" target="_blank" rel="noreferrer">
            <BannerImg src={Banner3} />
          </a>
        </BannerDiv>
      </TopSection>
    </PageWrapper>
  )
}
