import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/ui/loader';
import { PageHeader } from '@/components/ui/page-header';
import { ChainId, JSBI, TokenAmount } from '@pangolindex/sdk';
import { Link } from 'react-router-dom';
import { ButtonPrimary } from 'src/components/Button';
import FormattedCurrencyAmount from 'src/components/FormattedCurrencyAmount';
import { PNG, ZERO_ADDRESS } from 'src/constants';
import { ApplicationModal } from 'src/state/application/actions';
import { useModalOpen, useToggleDelegateModal } from 'src/state/application/hooks';
import { useTokenBalance } from 'src/state/wallet/hooks';
import { getEtherscanLink, shortenAddress } from 'src/utils';
import styled from 'styled-components';
import voteImage from '../../assets/images/Vote.webp';
import { RowFixed } from '../../components/Row';
import DelegateModal from '../../components/vote/DelegateModal';
import { useActiveWeb3React } from '../../hooks';
import { ProposalData, useAllProposalData, useUserDelegatee, useUserVotes } from '../../state/governance/hooks';

// const Proposal = styled(Button)`
//   padding: 0.75rem 1rem;
//   width: 100%;
//   border-radius: 12px;
//   display: grid;
//   grid-template-columns: 48px 1fr 120px;
//   align-items: center;
//   text-align: left;
//   outline: none;
//   cursor: pointer;
//   text-decoration: none;
//   &:focus {
//   }
//   &:hover {
//   }
// `

const AddressButton = styled.div`
  padding: 2px 4px;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default function Vote() {
  const { account, chainId } = useActiveWeb3React();
  const showDelegateModal = useModalOpen(ApplicationModal.DELEGATE);
  const toggleDelegateModal = useToggleDelegateModal();

  const allProposals: ProposalData[] = useAllProposalData();
  const availableVotes: TokenAmount | undefined = useUserVotes();

  const pngBalance: TokenAmount | undefined = useTokenBalance(account ?? undefined, chainId ? PNG[chainId] : undefined);
  const userDelegatee: string | undefined = useUserDelegatee();

  const showUnlockVoting = Boolean(
    pngBalance && JSBI.notEqual(pngBalance.raw, JSBI.BigInt(0)) && userDelegatee === ZERO_ADDRESS,
  );
  return (
    <>
      <DelegateModal
        isOpen={showDelegateModal}
        onDismiss={toggleDelegateModal}
        title={showUnlockVoting ? 'votePage.unlockVotes' : 'votePage.updateDelegation'}
      />
      {allProposals.length !== 0 && <h5 className="font-semibold text-2xl">Proposals</h5>}
      {(!allProposals || allProposals.length === 0) && <Loader />}
      {showUnlockVoting ? (
        <ButtonPrimary style={{ width: 'fit-content' }} padding="8px" borderRadius="8px" onClick={toggleDelegateModal}>
          Unlock Voting
        </ButtonPrimary>
      ) : availableVotes && allProposals.length !== 0 && JSBI.notEqual(JSBI.BigInt(0), availableVotes?.raw) ? (
        <p>
          <FormattedCurrencyAmount currencyAmount={availableVotes} /> Votes
        </p>
      ) : (
        pngBalance &&
        userDelegatee &&
        userDelegatee !== ZERO_ADDRESS &&
        JSBI.notEqual(JSBI.BigInt(0), pngBalance?.raw) &&
        allProposals.length !== 0 && (
          <p>
            <FormattedCurrencyAmount currencyAmount={pngBalance} /> Votes
          </p>
        )
      )}
      {!showUnlockVoting && userDelegatee && userDelegatee !== ZERO_ADDRESS && allProposals.length !== 0 && (
        <RowFixed>
          <p>Delegated To</p>
          <AddressButton>
            <a href={getEtherscanLink(ChainId.FUJI, userDelegatee, 'address')} style={{ margin: '0 4px' }}>
              {userDelegatee === account ? 'Self' : shortenAddress(userDelegatee)}
            </a>
            <span className="cursor-pointer underline" onClick={toggleDelegateModal} style={{ marginLeft: '4px' }}>
              Edit
            </span>
          </AddressButton>
        </RowFixed>
      )}
      {/*allProposals?.length === 0 && (
        <div className="p-4 flex flex-col text-center space-y-2 border rounded-md text-muted-foreground">
          <span>No Proposals Found</span>
          <span className="text-sm">Proposal Community Members</span>
        </div>
      )*/}
      <div className="rounded-md flex flex-col space-y-0.5 overflow-hidden">
        {allProposals?.map((proposal: ProposalData, i) => {
          return (
            <div className="flex items-center justify-between p-4 bg-background" key={i}>
              <div className="flex items-start space-x-4">
                <span className="text-slate-300 text-2xl">{proposal.id}</span>
                <div className="flex flex-col space-y-2">
                  <span>{proposal.title}</span>
                  <Badge className="w-fit" variant={proposal.status === 'executed' ? 'success' : proposal.status}>
                    <span className="uppercase">{proposal.status}</span>
                  </Badge>
                </div>
              </div>
              <Button asChild>
                <Link to={'/vote/' + proposal.id}>View</Link>
              </Button>
            </div>
          );
        })}
      </div>
    </>
  );
}
