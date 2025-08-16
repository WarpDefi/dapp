import { useTranslation } from "@pancakeswap/localization";
import { AtomBox, Box, Button, Flex, InjectedModalProps, ModalWrapper, Text } from "@pancakeswap/uikit";
import { formatNumber } from "@pancakeswap/utils/formatBalance";
import React from "react";
import styled from "styled-components";

const StyledTitle = styled(Text)`
  font-family: 'Metuo', sans-serif;
  font-size: 24px;
  font-weight: 600;
  line-height: 32px;
  max-width: 330px;
  margin: auto;

`
const StyledImage = styled.img`
  --size: 180px;
  height: var(--size);
  min-width: calc(var(--size) * 157 / 180);
`
const StyledButton = styled(Button)`
  height: 44px;
`
const Span = styled.span`
  font-weight: 700;
`

export enum LoansView {
  AVAILABLE,
  BORROWING
}

interface LoansModalProps extends InjectedModalProps {
  initialView: LoansView,
  borrowValue: string
  balanceVault: string,
  onConfirm: () => void;
}

const LoansModal: React.FC<React.PropsWithChildren<LoansModalProps>> = ({
  initialView,
  borrowValue,
  balanceVault,
  onConfirm,
  onDismiss,

}) => {
  const { t } = useTranslation()
  const handleConfirm = () => {
    onConfirm()
    onDismiss()
  }

  return (
    <ModalWrapper maxWidth="525px" m="auto">
      <AtomBox position="relative">
        <AtomBox
          display="flex"
          flexDirection="column"
          bg="backgroundAlt"
          py="32px"
          zIndex="modal"
          borderRadius="card"
        >
          <AtomBox px={[ "20px", "20px", "32px" ]}>
            <StyledTitle color="text" textAlign="center">
              {t('System does not have enough tokens')}
            </StyledTitle>
            <Flex alignItems="center" mt="20px">
              {initialView === LoansView.AVAILABLE && (
                <Box mr="40px">
                  <Text fontSize="14px" lineHeight="24px" mb="10px" color="textSubtle">
                    Sorry, the system does not have enough funds left to process your <Span>{formatNumber(Number(borrowValue))} U2U</Span> borrow request.
                  </Text>
                  <Text fontSize="14px" lineHeight="24px" mb="10px" color="textSubtle">
                    The system can lend you <Span>{balanceVault} U2U</Span> token.
                  </Text>
                  <Text fontSize="14px" lineHeight="24px" color="textSubtle">
                    Click “<Span>Borrow {balanceVault} U2U</Span>” to proceed or “<Span>Cancel</Span>” to cancelled
                  </Text>
                </Box>
              )}
              {initialView === LoansView.BORROWING && (
                <Text fontSize="14px" lineHeight="24px" mr="40px" color="textSubtle">{t('Sorry, the system no longer has tokens to perform your transaction. Please come back another time to make the transaction.')}</Text>
              )}
              <StyledImage src="/images/loans-borrow.png" alt=""/>
            </Flex>
            <Box mt="24px">
              {initialView === LoansView.AVAILABLE && (
                <Flex>
                  <StyledButton
                    width="100%"
                    className="button-hover"
                    mr="8px"
                    onClick={handleConfirm}
                  >
                    {t(`Borrow ${balanceVault} U2U`)}
                  </StyledButton>
                  <StyledButton
                    width="100%"
                    variant="silver"
                    className="button-hover"
                    ml="8px"
                    onClick={onDismiss}
                  >
                    {t('Cancel')}
                  </StyledButton>
                </Flex>
              )}
              {initialView === LoansView.BORROWING && (
                <StyledButton
                  width="100%"
                  className="button-hover"
                  onClick={onDismiss}
                >
                  {t('OK! I understand')}
                </StyledButton>
              )}
            </Box>
          </AtomBox>
        </AtomBox>
      </AtomBox>
    </ModalWrapper>
  )
}

export default LoansModal