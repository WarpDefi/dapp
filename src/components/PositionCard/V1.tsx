import { Token, TokenAmount, WAVAX } from '@pangolindex/sdk';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { Text } from 'rebass';
import { useActiveWeb3React } from '../../hooks';
import { ButtonSecondary } from '../Button';
import { AutoColumn } from '../Column';
import DoubleCurrencyLogo from '../DoubleLogo';
import { RowBetween, RowFixed } from '../Row';
import { FixedHeightRow, HoverCard } from './index';
;

interface PositionCardProps extends RouteComponentProps<{}> {
  token: Token;
  V1LiquidityBalance: TokenAmount;
}

function V1PositionCard({ token, V1LiquidityBalance }: PositionCardProps) {
  const chainId = useChainId();

  return (
    <HoverCard>
      <AutoColumn gap="12px">
        <FixedHeightRow>
          <RowFixed>
            <DoubleCurrencyLogo currency0={token} margin={true} size={20} />
            <Text fontWeight={500} fontSize={20} style={{ marginLeft: '' }}>
              {`${chainId && token.equals(WAVAX[chainId]) ? 'WAVAX' : token.symbol}/ETH`}
            </Text>
            <Text
              fontSize={12}
              fontWeight={500}
              ml="0.5rem"
              px="0.75rem"
              py="0.25rem"
              style={{ borderRadius: '1rem' }}
              color={'black'}
            >
              V1
            </Text>
          </RowFixed>
        </FixedHeightRow>

        <AutoColumn gap="8px">
          <RowBetween marginTop="10px">
            <ButtonSecondary width="68%" as={Link} to={`/migrate/v1/${V1LiquidityBalance.token.address}`}>
              Migrate
            </ButtonSecondary>

            <ButtonSecondary
              style={{ backgroundColor: 'transparent' }}
              width="28%"
              as={Link}
              to={`/remove/v1/${V1LiquidityBalance.token.address}`}
            >
              Remove
            </ButtonSecondary>
          </RowBetween>
        </AutoColumn>
      </AutoColumn>
    </HoverCard>
  );
}

export default withRouter(V1PositionCard);
