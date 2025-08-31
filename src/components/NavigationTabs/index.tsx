import { CircleArrowLeft } from 'lucide-react';
import { darken } from 'polished';
import { ArrowLeft } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { Link, NavLink } from 'react-router-dom';
import styled from 'styled-components';
import QuestionHelper from '../QuestionHelper';
import { RowBetween } from '../Row';

const Tabs = styled.div`
  align-items: center;
  border-radius: 3rem;
  justify-content: space-evenly;
`;

const activeClassName = 'ACTIVE';

const StyledNavLink = styled(NavLink).attrs({
  activeClassName,
})`
  align-items: center;
  justify-content: center;
  height: 3rem;
  border-radius: 3rem;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  font-size: 20px;

  &.${activeClassName} {
    border-radius: 12px;
    font-weight: 500;
  }
`;

const StyledArrowLeft = styled(ArrowLeft)`
`;

export function SwapPoolTabs({ active }: { active: 'swap' | 'pool' }) {
  const { t } = useTranslation();
  return (
    <Tabs style={{ marginBottom: '20px', display: 'none' }}>
      <StyledNavLink to={'/swap'} isActive={() => active === 'swap'}>
        {t('swap')}
      </StyledNavLink>
      <StyledNavLink to={'/pool'} isActive={() => active === 'pool'}>
        {t('pool')}
      </StyledNavLink>
    </Tabs>
  );
}

export function FindPoolTabs() {
  return (
    <div className="w-full flex flex-col gap-3 lg:justify-between">
      <Link to="/pool" className="flex items-center space-x-2">
        <CircleArrowLeft className="size-4" />
        <small>Return to Pool Page</small>
      </Link>
      <div className="flex items-baseline">
        <h2>Import Pool</h2>
        <QuestionHelper text={"Use this tool to find pairs that don't automatically appear in the interface."} />
      </div>
    </div>
  );
}

export function AddRemoveTabs({ adding, creating }: { adding: boolean; creating: boolean }) {
  return (
    <div className="w-full flex flex-col gap-3 lg:justify-between">
      <Link to="/pool" className="flex items-center space-x-2">
        <CircleArrowLeft className="size-4" />
        <small>Return to Pool Page</small>
      </Link>
      <div className="flex items-baseline">
        <h2>{creating ? 'Create a pair' : adding ? 'Add liquidity' : 'Remove liquidity'}</h2>
        <QuestionHelper
          text={
            adding
              ? 'When you add liquidity, you are given pool tokens representing your position. These tokens automatically earn fees proportional to your share of the pool, and can be redeemed at any time.'
              : 'Removing pool tokens converts your position back into underlying tokens at the current rate, proportional to your share of the pool. Accrued fees are included in the amounts you receive.'
          }
        />
      </div>
    </div>
  );
}
