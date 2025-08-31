import React, { useCallback, useState } from 'react'
import { AutoColumn } from '../../components/Column'
import styled from 'styled-components'
//import { RouteComponentProps } from 'react-router-dom'
import { RowBetween } from '../../components/Row'
import { ButtonPrimary } from '../../components/Button'

import { clientW } from '../../apollo/client'
import { ERC721_STAKING_DATA } from '../../apollo/queries'
import { useActiveWeb3React } from '../../hooks'
import UnstakingModalNFT from '../../components/earn/UnstakingModalNFT'
import { DataCard } from '../../components/earn/styled'

const PageWrapper = styled(AutoColumn)`
   max-width: 960px;
   width: 100%;
 `

const PositionInfo = styled(AutoColumn) <{ dim: any }>`
   position: relative;
   max-width: 960px;
   width: 100%;
   opacity: ${({ dim }) => (dim ? 0.6 : 1)};
 `

const PoolData = styled(DataCard)`
   background: none;
   padding: 1rem;
   z-index: 1;
 `

const DataRow = styled(RowBetween)`
   justify-content: center;
   gap: 12px;
 `

 const NFTContainer = styled.div`
 display: grid;
 grid-auto-rows: auto;
 grid-row-gap: 24px;
 `

 const elDiv = {
  display: 'grid'
};

 const NFTDiv = styled.div`
 display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
    -webkit-column-gap: 10px;
    column-gap: 10px;
    row-gap: 15px;
    width: 100%;
    justify-self: center;
 `
 const TopSection = styled(AutoColumn)`
 max-width: 960px;
 width: 100%;
`

export function NftstakeWithdraw() {
  const { account } = useActiveWeb3React()
let ipfsimg = "https://boogeybirds.s3.eu-central-1.amazonaws.com/birds/Boogey_Birds_"
let nArray: React.SetStateAction<any[]> = []
let sArray: any = []

const [myArray, updateMyArray] = useState(nArray);
const [mysArray, updateMysArray] = useState(sArray);
const [showWithdrawModal, setShowWithdrawModal] = useState(false)

const handleWithdrawClick = useCallback(() => {
  if (account) {
    setShowWithdrawModal(true)
  }
}, [account])

    clientW.query({query: ERC721_STAKING_DATA(account?.toLowerCase())}).then(result => {
        if(result.data.stakingData != null){
        nArray = result.data.stakingData.tokenId
        updateMyArray(nArray)
        }
      })
  
const handleOnChange = (e:any) => {
  let index = mysArray.indexOf(e.target.id)
  if(index > -1){
    updateMysArray(mysArray.filter((item: any) => item !== e.target.id));
  }else{
      updateMysArray((oldArray: any) => [...oldArray, e.target.id]);
    
  }
};

  return (
    <PageWrapper gap="lg" justify="center">
      
      <TopSection gap="md">
        <video src={'https://app.canary.exchange/nftstake2.webm'} style={{ height: 'auto', maxWidth: '100%', borderRadius: '12px' }} autoPlay loop muted playsInline/>
      </TopSection>

      <DataRow style={{ gap: '24px' }}>
      <PoolData>
     <NFTContainer>
     {myArray.length != 0 ?
       <NFTDiv>
       {
           myArray.map((item) =>
            <label key={item}>
              <div style={elDiv}><img width={"62px"} src={ipfsimg+item+".jpg"}/>
              <label><input
            type="checkbox"
            id={item.toString()}
            onChange={handleOnChange}
          />{'#'+item}</label></div></label>)
        }
      </NFTDiv>:
          "You dont have any Boogey Bird :("
         }
      </NFTContainer>
      </PoolData>
      </DataRow>

      <UnstakingModalNFT
            isOpen={showWithdrawModal}
            onDismiss={() => setShowWithdrawModal(false)}
            selectedNFTS={mysArray}
          />

      <PositionInfo gap="lg" justify="center" dim={false}>
        <DataRow style={{ marginBottom: '1rem' }}>
        {myArray.length != 0 &&
          <ButtonPrimary padding="8px" borderRadius="8px" width="160px" onClick={handleWithdrawClick}>
            Withdraw
           </ButtonPrimary>
          }
        </DataRow>
      </PositionInfo>
    </PageWrapper>
  )
      }