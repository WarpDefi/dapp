import { useMemo, useState } from 'react';
import Modal from '../Modal';
import { AutoColumn } from '../Column';
import styled from 'styled-components';
import { RowBetween } from '../Row';
import { TYPE, CloseIcon } from '../../theme';
import { ButtonError } from '../Button';
//import { strAddress } from '../../state/stake/hooks'
import { useStakingContractNFT } from '../../hooks/useContract';
import { SubmittedView, LoadingView } from '../ModalViews';
import { TransactionResponse } from '@ethersproject/providers';
import { useTransactionAdder } from '../../state/transactions/hooks';
import { useActiveWeb3React } from '../../hooks';
import { useMultipleContractSingleData } from '../../state/multicall/hooks';

import { abi as IStakingRewardsNFT } from '../../../src/constants/abis/IStakingRewardsNFT.json';
import { Interface } from '@ethersproject/abi';
import { NFTSTAKE_ADDRESS } from '../../constants';
import { Fraction, JSBI } from '@pangolindex/sdk';
import { useAccount } from 'wagmi';

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 1rem;
`;

interface StakingModalProps {
  isOpen: boolean;
  onDismiss: () => void;
}

export default function ClaimRewardModalNFT({ isOpen, onDismiss }: StakingModalProps) {
  const { chainId, account } = useActiveWeb3React();
  const accountArg = useMemo(() => [account ?? undefined], [account]);

  // monitor call to help UI loading state
  const addTransaction = useTransactionAdder();
  const [hash, setHash] = useState<string | undefined>();
  const [attempting, setAttempting] = useState(false);

  function wrappedOnDismiss() {
    setHash(undefined);
    setAttempting(false);
    onDismiss();
  }

  const stakingContract = useStakingContractNFT(chainId ? NFTSTAKE_ADDRESS[chainId] : undefined);

  const NFTSTR_INTERFACE = new Interface(IStakingRewardsNFT);

  const oneTokenf = JSBI.BigInt(1000000000000000000);

  const NFTADDR = useMemo(
    () => [chainId ? NFTSTAKE_ADDRESS[chainId] : undefined],
    [chainId ? NFTSTAKE_ADDRESS[chainId] : undefined],
  );
  const balances = useMultipleContractSingleData(NFTADDR, NFTSTR_INTERFACE, 'balanceOf', accountArg);
  const earned = useMultipleContractSingleData(NFTADDR, NFTSTR_INTERFACE, 'earned', accountArg);
  const earnedx = JSBI.BigInt(earned[0].result ?? 1);
  let earnedf: Fraction;
  earnedf = new Fraction(JSBI.divide(JSBI.BigInt(earnedx), oneTokenf));

  async function onClaimReward() {
    if (stakingContract && Number(balances[0].result) > 0) {
      setAttempting(true);
      //console.log(stakingContract);
      await stakingContract
        .getReward({ gasLimit: 210000 })
        .then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Claim accumulated CNR rewards`,
          });
          setHash(response.hash);
        })
        .catch((error: any) => {
          setAttempting(false);
          console.log(error);
        });
    }
  }

  let error: string | undefined;

  if (!account) {
    error = 'Connect to a  wallet';
  }

  if (!balances[0].result) {
    error = error ?? 'Enter an amount';
  }

  return (
    <Modal isOpen={isOpen} onDismiss={wrappedOnDismiss} maxHeight={90}>
      {!attempting && !hash && (
        <ContentWrapper gap="lg">
          <RowBetween>
            <TYPE.mediumHeader>Claim</TYPE.mediumHeader>
            <CloseIcon onClick={wrappedOnDismiss} />
          </RowBetween>
          {earned[0]?.result && (
            <AutoColumn justify="center" gap="md">
              <TYPE.body fontWeight={600} fontSize={36}>
                {earnedf.toSignificant(6)}
              </TYPE.body>
              <TYPE.body>Unclaimed CNR</TYPE.body>
            </AutoColumn>
          )}
          <TYPE.subHeader style={{ textAlign: 'center' }}>
            When you claim without withdrawing your tokens remain in the mining pool.
          </TYPE.subHeader>
          <ButtonError disabled={!!error} error={!!error && !!balances[0]?.result} onClick={onClaimReward}>
            {error ?? 'Claim'}
          </ButtonError>
        </ContentWrapper>
      )}
      {attempting && !hash && (
        <LoadingView onDismiss={wrappedOnDismiss}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.body fontSize={20}>Claiming {earnedf.toSignificant(6)} CNR</TYPE.body>
          </AutoColumn>
        </LoadingView>
      )}
      {hash && (
        <SubmittedView onDismiss={wrappedOnDismiss} hash={hash}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.largeHeader>Transaction Submitted</TYPE.largeHeader>
            <TYPE.body fontSize={20}>Claimed CNR!</TYPE.body>
          </AutoColumn>
        </SubmittedView>
      )}
    </Modal>
  );
}
