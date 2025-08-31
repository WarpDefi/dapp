import { useState, useContext } from 'react';
//import { useChainId } from '../../hooks';
import Modal from '../Modal';
import { AutoColumn, ColumnCenter } from '../Column';
import styled, { ThemeContext } from 'styled-components';
import { RowBetween } from '../Row';
import { ButtonPrimary } from '../Button';
import Circle from '../../assets/images/blue-loader.svg';
import { useVoteCallback, useUserVotes } from '../../state/governance/hooks';
import { getEtherscanLink } from '../../utils';
import { TokenAmount } from '@pangolindex/sdk';
import { useTranslation } from 'react-i18next';
import { Icons } from '../icons';
import { useActiveWeb3React } from '@/hooks';
import { useChainId } from '@/provider';

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 24px;
`;

const ConfirmOrLoadingWrapper = styled.div`
  width: 100%;
  padding: 24px;
`;

const ConfirmedIcon = styled(ColumnCenter)`
  padding: 60px 0;
`;

interface VoteModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  support: boolean; // if user is for or against proposal
  proposalId: string | undefined; // id for the proposal to vote on
}

export default function VoteModal({ isOpen, onDismiss, proposalId, support }: VoteModalProps) {
  const chainId = useChainId();
  const {
    voteCallback,
  }: {
    voteCallback: (proposalId: string | undefined, support: boolean) => Promise<string> | undefined;
  } = useVoteCallback();
  const availableVotes: TokenAmount | undefined = useUserVotes();

  // monitor call to help UI loading state
  const [hash, setHash] = useState<string | undefined>();
  const [attempting, setAttempting] = useState<boolean>(false);

  const { t } = useTranslation();

  // wrapper to reset state on modal close
  function wrappedOndismiss() {
    setHash(undefined);
    setAttempting(false);
    onDismiss();
  }

  async function onVote() {
    setAttempting(true);

    // if callback not returned properly ignore
    if (!voteCallback) return;

    // try delegation and store hash
    const _hash = await voteCallback(proposalId, support)?.catch(error => {
      setAttempting(false);
      console.log(error);
    });

    if (_hash) {
      setHash(_hash);
    }
  }

  return (
    <Modal isOpen={isOpen} onDismiss={wrappedOndismiss} maxHeight={90}>
      {!attempting && !hash && (
        <ContentWrapper gap="lg">
          <AutoColumn gap="lg" justify="center">
            <RowBetween>
              <h5>
                {t('vote.vote')} {support ? t('vote.for') : t('vote.against')} {t('vote.proposal')} {proposalId}
              </h5>
              <Icons.x stroke="black" onClick={wrappedOndismiss} />
            </RowBetween>
            <p className="large">
              {availableVotes?.toSignificant(4)} {t('vote.votes')}
            </p>
            <ButtonPrimary onClick={onVote}>
              <h5>
                {t('vote.vote')} {support ? t('vote.for') : t('vote.against')} {t('vote.proposal')} {proposalId}
              </h5>
            </ButtonPrimary>
          </AutoColumn>
        </ContentWrapper>
      )}
      {attempting && !hash && (
        <ConfirmOrLoadingWrapper>
          <RowBetween>
            <div />
            <Icons.x onClick={wrappedOndismiss} />
          </RowBetween>
          <ConfirmedIcon>
          </ConfirmedIcon>
          <AutoColumn gap="100px" justify={'center'}>
            <AutoColumn gap="12px" justify={'center'}>
              <p className="large">{t('vote.submittingVote')} </p>
            </AutoColumn>
            <h5>{t('vote.confirmTransaction')}</h5>
          </AutoColumn>
        </ConfirmOrLoadingWrapper>
      )}
      {hash && (
        <ConfirmOrLoadingWrapper>
          <RowBetween>
            <div />
            <Icons.x onClick={wrappedOndismiss} />
          </RowBetween>
          <ConfirmedIcon>
            <Icons.plus strokeWidth={0.5} size={90} />
          </ConfirmedIcon>
          <AutoColumn gap="100px" justify={'center'}>
            <AutoColumn gap="12px" justify={'center'}>
              <p className="large">{t('vote.transactionSubmitted')}</p>
            </AutoColumn>
            {chainId && (
              <a href={getEtherscanLink(chainId, hash, 'transaction')} style={{ marginLeft: '4px' }}>
                <h5>{t('vote.viewExplorer')}</h5>
              </a>
            )}
          </AutoColumn>
        </ConfirmOrLoadingWrapper>
      )}
    </Modal>
  );
}
