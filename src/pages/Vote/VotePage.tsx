import { Badge } from '@/components/ui/badge';
import { Loader } from '@/components/ui/loader';
import { PageHeader } from '@/components/ui/page-header';
import { JSBI, TokenAmount } from '@pangolindex/sdk';
import { ArrowLeftCircle } from 'lucide-react';
import { DateTime } from 'luxon';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import { Link, useParams } from 'react-router-dom';
import remarkGfm from 'remark-gfm';
import { ButtonPrimary } from 'src/components/Button';
import { PNG, ZERO_ADDRESS } from 'src/constants';
import { ProposalData, useProposalData, useUserDelegatee, useUserVotes } from 'src/state/governance/hooks';
import { useTokenBalance } from 'src/state/wallet/hooks';
import { getEtherscanLink, isAddress } from 'src/utils';
import styled from 'styled-components';
import voteImage from '../../assets/images/Vote.webp';
import { RowFixed } from '../../components/Row';
import VoteModal from '../../components/vote/VoteModal';
import { useActiveWeb3React } from '../../hooks';
import { ExternalLink } from '@/theme';

const Progress = styled.div<{ status: 'for' | 'against'; percentageString?: string }>`
  height: 4px;
  border-radius: 4px;
  width: ${({ percentageString }) => percentageString};
`;

const DetailText = styled.div`
  word-break: break-all;
`;

export default function VotePage() {
  const { id } = useParams<{ id: string }>();
  const { account, chainId } = useActiveWeb3React();
  const { t } = useTranslation();

  const proposalData: ProposalData | undefined = useProposalData(id as string);
  const [support, setSupport] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);

  const startTimestamp: number | undefined = proposalData?.startTime;
  const endTimestamp: number | undefined = proposalData?.endTime;
  const startDate: DateTime | undefined = startTimestamp ? DateTime.fromSeconds(startTimestamp) : undefined;
  const endDate: DateTime | undefined = endTimestamp ? DateTime.fromSeconds(endTimestamp) : undefined;
  const now: DateTime = DateTime.local();

  const totalVotes: number | undefined = proposalData ? proposalData.forCount + proposalData.againstCount : undefined;
  const forPercentage: string =
    proposalData && totalVotes ? ((proposalData.forCount * 100) / totalVotes).toFixed(0) + '%' : '0%';
  const againstPercentage: string =
    proposalData && totalVotes ? ((proposalData.againstCount * 100) / totalVotes).toFixed(0) + '%' : '0%';

  const availableVotes: TokenAmount | undefined = useUserVotes();
  const uniBalance: TokenAmount | undefined = useTokenBalance(account ?? undefined, chainId ? PNG[chainId] : undefined);
  const userDelegatee: string | undefined = useUserDelegatee();
  const showUnlockVoting = Boolean(
    uniBalance && JSBI.notEqual(uniBalance.raw, JSBI.BigInt(0)) && userDelegatee === ZERO_ADDRESS,
  );

  const linkIfAddress = (content: string) => {
    if (isAddress(content) && chainId) {
      return <ExternalLink className="text-orange-500 hover:underline" href={getEtherscanLink(chainId, content, 'address')}>{content}</ExternalLink>;
    }
    return <span>{content}</span>;
  };

  return (
    <>
      <VoteModal
        isOpen={showModal}
        onDismiss={() => setShowModal(false)}
        proposalId={proposalData?.id}
        support={support}
      />

      <div className="bg-background p-8 rounded-lg flex flex-col space-y-4">
        {!proposalData ? (
          <div className="flex items-center space-x-2">
            <Loader />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <Link to="/vote" className="flex items-center space-x-2">
                <ArrowLeftCircle size={20} /> <span>All Proposals</span>
              </Link>
              {proposalData && (
                <Badge variant={proposalData.status === 'executed' ? 'success' : proposalData.status}>
                  <span className="uppercase">{proposalData?.status}</span>
                </Badge>
              )}
            </div>
            <h5 className="font-semibold text-2xl">{proposalData?.title}</h5>
            <div className="grid grid-cols-2 gap-4">
              <span>
                {startDate && startDate <= now ? (
                  <div className="flex flex-col">
                    <span className="font-semibold">Voting started</span>{' '}
                    {startDate && startDate.toLocaleString(DateTime.DATETIME_FULL)}
                  </div>
                ) : proposalData ? (
                  <div className="flex flex-col">
                    <span className="font-semibold">Voting Starts</span>{' '}
                    {startDate && startDate.toLocaleString(DateTime.DATETIME_FULL)}
                  </div>
                ) : (
                  ''
                )}
              </span>
              <span>
                {endDate && endDate < now ? (
                  <div className="flex flex-col">
                    <span className="font-semibold">Voting Ended</span>{' '}
                    {endDate && endDate.toLocaleString(DateTime.DATETIME_FULL)}
                  </div>
                ) : proposalData ? (
                  <div className="flex flex-col">
                    <span className="font-semibold">Voting Ends</span>{' '}
                    {endDate && endDate.toLocaleString(DateTime.DATETIME_FULL)}
                  </div>
                ) : (
                  ''
                )}
              </span>
            </div>
            {!showUnlockVoting &&
            availableVotes &&
            JSBI.greaterThan(availableVotes?.raw, JSBI.BigInt(0)) &&
            endDate &&
            endDate > now &&
            startDate &&
            startDate <= now ? (
              <RowFixed style={{ width: '100%', gap: '12px' }}>
                <ButtonPrimary
                  padding="8px"
                  borderRadius="8px"
                  onClick={() => {
                    setSupport(true);
                    setShowModal(true);
                  }}
                >
                  {t('votePage.voteFor')}
                </ButtonPrimary>
                <ButtonPrimary
                  padding="8px"
                  borderRadius="8px"
                  onClick={() => {
                    setSupport(false);
                    setShowModal(true);
                  }}
                >
                  {t('votePage.voteAgainst')}
                </ButtonPrimary>
              </RowFixed>
            ) : (
              ''
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-md bg-muted flex flex-col space-y-2">
                <div className="flex justify-between items-center font-semibold">
                  <span>For</span>
                  <span>{proposalData?.forCount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>

                <Progress status="for" percentageString={forPercentage} />
              </div>
              <div className="p-4 rounded-md bg-muted flex flex-col space-y-2">
                <div className="flex justify-between items-center font-semibold">
                  <span>Against</span>
                  <span>{proposalData?.againstCount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>

                <Progress status="against" percentageString={againstPercentage} />
              </div>
            </div>
            <div>
              <h6 className="font-semibold text-xl">Overview</h6>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{`${proposalData?.description}`}</ReactMarkdown>
            </div>
            <div>
              <h6 className="font-semibold text-xl">Details</h6>
              {proposalData?.details?.map((d, i) => {
                return (
                  <DetailText key={i}>
                    {i + 1}: {linkIfAddress(d.target)}.{d.functionSig}(
                    {d.callData.split(',').map((content, index) => {
                      return (
                        <span key={index}>
                          {linkIfAddress(content)}
                          {d.callData.split(',').length - 1 === index ? '' : ','}
                        </span>
                      );
                    })}
                    )
                  </DetailText>
                );
              })}
            </div>
            <div>
              <h6 className="font-semibold text-xl">Proposer</h6>
              <a
                href={
                  proposalData?.proposer && chainId ? getEtherscanLink(chainId, proposalData?.proposer, 'address') : ''
                }
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{`${proposalData?.proposer}`}</ReactMarkdown>
              </a>
            </div>
          </>
        )}
      </div>
    </>
  );
}
