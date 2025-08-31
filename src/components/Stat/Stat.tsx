import AnalyticsIcon from '@/assets/images/analytics.svg';
import CurrencyLogo from '@/components/CurrencyLogoV3';
//import { useChainId } from '@/provider';
import { ThemeColorsType } from '@/theme';
import { cn } from '@/utils';
import { Currency, Token, WAVAX } from '@pangolindex/sdk';
import _uniqueId from 'lodash/uniqueId';
import { ReactNode, useContext, useState } from 'react';
import { ThemeContext } from 'styled-components';
import { Text } from '../Text';
import Tooltip from '../TooltipV3';
import { AnalyticsLink } from './styled';
;
import { useActiveWeb3React } from '@/hooks';
import { useChainId } from '@/provider';


export interface StatProps {
  title?: ReactNode;
  titlePosition?: 'top' | 'bottom';
  stat?: any;
  titleColor?: ThemeColorsType;
  statColor?: ThemeColorsType;
  titleFontSize?: number | number[];
  statFontSize?: number | number[];
  currency?: Currency;
  statAlign?: 'center' | 'right' | 'left';
  showAnalytics?: boolean;
  toolTipText?: string;
  statfontWeight?: string;
}

const Stat = ({
  title,
  titlePosition,
  stat,
  titleColor,
  titleFontSize,
  statColor,
  statFontSize,
  currency,
  statAlign,
  showAnalytics = false,
  toolTipText,
  statfontWeight,
}: StatProps) => {
  const chainId = useChainId();
  const token = currency instanceof Currency && currency instanceof Token ? currency : WAVAX[chainId];

  const [id] = useState(_uniqueId('stat-tip-'));

  const theme = useContext(ThemeContext);

  function getAlignment() {
    if (statAlign === 'center') {
      return 'items-center';
    } else if (statAlign === 'right') {
      return 'items-end';
    } else {
      return 'items-start';
    }
  }

  return (
    <div className={cn('flex flex-col gap-0', getAlignment())}>
      {titlePosition === 'top' && title && (
        <div className="flex gap-2 items-center">
          <small className="muted">{title}</small>
          {showAnalytics && (
            <AnalyticsLink href={`${''}/#/token/${token.address}`} target="_blank">
              <img src={AnalyticsIcon} alt="analytics-icon" />
            </AnalyticsLink>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 w-full">
        <h4 data-tip data-for={id}>
          {stat}
        </h4>
        {currency && (
          <div className="shrink-0">
            <CurrencyLogo size={24} currency={currency} imageSize={48} />
          </div>
        )}
        {toolTipText && (
          <Tooltip id={id} effect="solid">
            <Text color="text6" fontSize="12px" fontWeight={500} textAlign="center">
              {toolTipText}
            </Text>
          </Tooltip>
        )}
      </div>

      {titlePosition === 'bottom' && title && (
        <Text color={titleColor || 'text1'} fontSize={titleFontSize || 16}>
          {title}
        </Text>
      )}
    </div>
  );
};

export default Stat;
