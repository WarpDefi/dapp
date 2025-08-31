import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { RowBetween } from '../Row';

import DropdownSelect from '../DropdownSelect';
import LocalLoader from '../LocalLoader';

import { IconButton } from '@mui/material';
//import { useSwapActionHandlers } from 'src/state/swap/hooks'
import { PNGAreaChart } from '../areaChart';
import { Icons } from '../icons';
import { usePair } from 'src/data/Reserves';
import { WAVAX } from '@pangolindex/sdk';
//import { useChainId } from '@/hooks'
import { useActiveWeb3React } from '@/hooks';
import { useChainId } from '@/provider';

const EmptyCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  border-radius: 20px;
  height: ${({ height }) => height && height};
`;

const ChartWrapper = styled.div`
  @media screen and (max-width: 600px) {
    min-height: 200px;
  }
`;

const CHART_VIEW = {
  RATE0: 'Rate 0',
  RATE1: 'Rate 1',
};

const PairChart = ({ currency0, currency1, address, color }) => {
  //const pairz = usePair(currency0, currency1)
  const chainId = useChainId();
  //const token0 = pairz[1]?.token0;
  //const token1 = pairz[1]?.token1;
  const c0address = currency0?.symbol === 'AVAX' ? WAVAX[chainId].address : currency0?.address;
  const c1address = currency1?.symbol === 'AVAX' ? WAVAX[chainId].address : currency1?.address;
  const [chartFilter, setChartFilter] = useState(null);
  // const [darkMode] = useDarkModeManager()
  // const textColor = darkMode ? 'white' : 'black'

  // update the width on a window resize
  const ref = useRef();
  const [width, setWidth] = useState(ref?.current?.container?.clientWidth);
  const [height, setHeight] = useState(ref?.current?.container?.clientHeight);
  const [pairVolumes, setPairVolumes] = useState(null);
  //const { onSwitchTokens } = useSwapActionHandlers()
  const isClient = typeof window === 'object';

  useEffect(() => {
    if (!isClient) {
      return false;
    }
    function handleResize() {
      setWidth(ref?.current?.container?.clientWidth ?? width);
      setHeight(ref?.current?.container?.clientHeight ?? height);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [height, isClient, width]);

  useEffect(() => {
    if (c0address > c1address) {
      setChartFilter(CHART_VIEW.RATE0);
    } else if (c1address > c0address) {
      setChartFilter(CHART_VIEW.RATE1);
    }
  }, [address, currency0, currency1]);

  useEffect(() => {
    const fetchData = async pId => {
      try {
        const response = await fetch(`https://pangoapi.canary.exchange/volumes?id=${pId}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.indexOf('application/json') !== -1) {
          const json = await response.json();
          setPairVolumes(json);
        } else {
          setPairVolumes(null);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setPairVolumes(null);
      }
    };
    address && fetchData(address);
  }, [address]);

  if (pairVolumes == null) {
    return (
      <ChartWrapper>
        <EmptyCard height="300px">No historical data yet.</EmptyCard>
      </ChartWrapper>
    );
  }

  /*
   : (
          pairVolumes && (
            <IconButton
              variant="text"
              onClick={() => {
                //onSwitchTokens()
                if (chartFilter === CHART_VIEW.RATE0) {
                  // setTimeWindow(timeframeOptions.DAY)
                  setChartFilter(CHART_VIEW.RATE1)
                } else {
                  // setTimeWindow(timeframeOptions.DAY)
                  setChartFilter(CHART_VIEW.RATE0)
                }
              }}
            >
              <Icons.switch style={{ width: '14px', height: '14px' }} />
            </IconButton>
          )
        )
  */

  return (
    <ChartWrapper>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {currency0.symbol} / {currency1.symbol}
        {false && (
          <RowBetween mb={40}>
            <DropdownSelect options={CHART_VIEW} active={chartFilter} setActive={setChartFilter} color={color} />
          </RowBetween>
        )}
      </div>
      {chartFilter === CHART_VIEW.RATE1 &&
        (pairVolumes[1] ? <PNGAreaChart data={pairVolumes[1]} currency1={currency1} /> : <LocalLoader />)}
      {chartFilter === CHART_VIEW.RATE0 &&
        (pairVolumes[0] ? <PNGAreaChart data={pairVolumes[0]} currency1={currency1} /> : <LocalLoader />)}
    </ChartWrapper>
  );
};

export default PairChart;
