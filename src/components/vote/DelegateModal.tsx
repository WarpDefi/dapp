import { useState } from 'react';
import Modal from '../Modal';
import { AutoColumn } from '../Column';
import styled from 'styled-components';
import { RowBetween } from '../Row';
import { X } from 'react-feather';
import { ButtonPrimary } from '../Button';
import { useActiveWeb3React } from '../../hooks';
import AddressInputPanel from '../AddressInputPanel';
import { isAddress } from 'ethers/lib/utils';
import useENS from '../../hooks/useENS';
import { useDelegateCallback } from '../../state/governance/hooks';
import { useTokenBalance } from '../../state/wallet/hooks';
import { PNG } from '../../constants';
import { LoadingView, SubmittedView } from '../ModalViews';
import { useTranslation } from 'react-i18next';

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 24px;
`;

const StyledClosed = styled(X)`
  :hover {
    cursor: pointer;
  }
`;

const TextButton = styled.div`
  :hover {
    cursor: pointer;
  }
`;

interface VoteModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  title: string;
}

export default function DelegateModal({ isOpen, onDismiss, title }: VoteModalProps) {
  const { account, chainId } = useActiveWeb3React();
  const { t } = useTranslation();

  // state for delegate input
  const [usingDelegate, setUsingDelegate] = useState(false);
  const [typed, setTyped] = useState('');
  function handleRecipientType(val: string) {
    setTyped(val);
  }

  // monitor for self delegation or input for third part delegate
  // default is self delegation
  const activeDelegate = usingDelegate ? typed : account;
  const { address: parsedAddress } = useENS(activeDelegate);

  // get the number of votes available to delegate
  const pngBalance = useTokenBalance(account ?? undefined, chainId ? PNG[chainId] : undefined);

  const delegateCallback = useDelegateCallback();

  // monitor call to help UI loading state
  const [hash, setHash] = useState<string | undefined>();
  const [attempting, setAttempting] = useState(false);

  // wrapper to reset state on modal close
  function wrappedOndismiss() {
    setHash(undefined);
    setAttempting(false);
    onDismiss();
  }

  async function onDelegate() {
    setAttempting(true);

    // if callback not returned properly ignore
    if (!delegateCallback) return;

    // try delegation and store hash
    const _hash = await delegateCallback(parsedAddress ?? undefined)?.catch(error => {
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
              <h4>{title}</h4>
              <StyledClosed stroke="black" onClick={wrappedOndismiss} />
            </RowBetween>
            <p>{t('vote.earnedPng')}</p>
            <p>{t('vote.canEitherVote')}</p>
            {usingDelegate && <AddressInputPanel value={typed} onChange={handleRecipientType} />}
            <ButtonPrimary disabled={!isAddress(parsedAddress ?? '')} onClick={onDelegate}>
              <h4>{usingDelegate ? t('vote.delegateVotes') : t('vote.selfDelegate')}</h4>
            </ButtonPrimary>
            <TextButton onClick={() => setUsingDelegate(!usingDelegate)}>
              <span className="text-information">
                {usingDelegate ? t('vote.remove') : t('vote.add')} {t('vote.delegate')} {!usingDelegate && '+'}
              </span>
            </TextButton>
          </AutoColumn>
        </ContentWrapper>
      )}
      {attempting && !hash && (
        <LoadingView onDismiss={wrappedOndismiss}>
          <AutoColumn gap="12px" justify={'center'}>
            <p className="large">{usingDelegate ? t('vote.delegatingVotes') : t('vote.unlockingVotes')}</p>
            <p>{pngBalance?.toSignificant(4)}</p>
          </AutoColumn>
        </LoadingView>
      )}
      {hash && (
        <SubmittedView onDismiss={wrappedOndismiss} hash={hash}>
          <AutoColumn gap="12px" justify={'center'}>
            <p className="large">{t('vote.transactionSubmitted')}</p>
            <p>{pngBalance?.toSignificant(4)}</p>
          </AutoColumn>
        </SubmittedView>
      )}
    </Modal>
  );
}
