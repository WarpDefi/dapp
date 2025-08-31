import { PageHeader } from '@/components/ui/page-header';
import { useActiveWeb3React } from '@/hooks';
import { useContext, useState } from 'react';
import styled, { ThemeContext } from 'styled-components';
import { ButtonOkxError } from '../../components/Button';
import Card from '../../components/Card';
import Confetti from '../../components/Confetti';
import { useClaimCallback, useUserHasAvailableClaim } from '../../state/airdrop/hooks';
import { useIsTransactionPending } from '../../state/transactions/hooks';

const EmptyProposals = styled.div`
  padding: 16px 12px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 1rem;
`;

export const Dots = styled.span`
  &::after {
    display: inline-block;
    animation: ellipsis 1.25s infinite;
    content: '.';
    width: 1em;
    text-align: left;
  }
  @keyframes ellipsis {
    0% {
      content: '.';
    }
    33% {
      content: '..';
    }
    66% {
      content: '...';
    }
  }
`;

export default function Vote() {
  const { account } = useActiveWeb3React();

  const theme = useContext(ThemeContext);

  // used for UI loading states
  const [attempting, setAttempting] = useState<boolean>(false);

  // monitor the status of the claim from contracts and txns
  const { claimCallback } = useClaimCallback(account);

  //const claimingAllowed = useAirdropIsClaimingAllowed()
  const canClaim = useUserHasAvailableClaim(account, '1');

  //const claimAmount = useUserUnclaimedAmount(account)

  const [hash, setHash] = useState<string | undefined>();

  // monitor the status of the claim from contracts and txns
  const claimPending = useIsTransactionPending(hash ?? '');
  const claimConfirmed = hash && !claimPending;

  const [error, setError] = useState<any | undefined>();

  // use the hash to monitor this txn

  function onClaim() {
    setAttempting(true);
    claimCallback()
      .then(hash => {
        setAttempting(false);
        setHash(hash);
      })
      // reset and log error
      .catch(err => {
        setAttempting(false);
        setError(err);
      });
  }

  return (
    <>
      <PageHeader
        variant="okx"
        title="OKX Wallet & Pangolin Airdrop"
        description="Congratulations to the OKX Wallet Airdrop winners. You can claim your airdrop below"
      />
      <Confetti start={Boolean(claimConfirmed)} />
      {!account ? (
        <Card padding="40px">
          <p className="text-center">Connect Wallet to view Airdrop.</p>
        </Card>
      ) : canClaim ? (
        <Card padding="40px">
          <p className="text-center">You have no available claim.</p>
        </Card>
      ) : attempting ? (
        <EmptyProposals>
          <p className="text-center">
            <Dots>Loading</Dots>
          </p>
        </EmptyProposals>
      ) : claimConfirmed ? (
        <h4>
          <span role="img" aria-label="party-hat">
            {' '}
          </span>
          Received CNR tokens! You can stake your CNR tokens to earn new CNR.
          <span role="img" aria-label="party-hat">
            {' '}
          </span>
        </h4>
      ) : (
        <ButtonOkxError error={!!error} padding="16px 16px" width="100%" mt="1rem" onClick={onClaim}>
          {error
            ? error['data']['message']
            : 'Claim 135' + /*claimAmount?.toFixed(0, { groupSeparator: ',' }) +*/ ' PNG'}
        </ButtonOkxError>
      )}
    </>
  );
}
