import { Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Footer from '../components/Footer';
import Header from '../components/Header';
import Polling from '../components/Header/Polling';
import Popups from '../components/Popups';
import Web3ReactManager from '../components/Web3ReactManager';
import GoogleAnalyticsReporter from '../components/analytics/GoogleAnalyticsReporter';
import AddLiquidity from './AddLiquidity';
import {
  RedirectDuplicateTokenIds,
  RedirectOldAddLiquidityPathStructure,
  RedirectToAddLiquidity,
} from './AddLiquidity/redirects';
import Airdrop from './Airdrop';
import Earn from './Earn';
import SuperFarms from './EarnSP';
import SuperFarmsV2 from './EarnSPV2';
import Paydece from './Paydece';
import Pool from './Pool';
import PoolFinder from './PoolFinder';
import RemoveLiquidity from './RemoveLiquidity';
import { RedirectOldRemoveLiquidityPathStructure } from './RemoveLiquidity/redirects';
import Stake from './Stake';
import Stats from './Stats';
import { RedirectPathToSwapOnly } from './Swap/redirects';
import Swap from './SwapNew';
import Vote from './Vote';
import VotePage from './Vote/VotePage';
import { LegalNoticesPage } from './legal-notices';
import PangolinV3 from './PV3';
import { PV3AddLiquidity } from './PV3/AddLiquidity';

export default function App() {
  return (
    <Suspense fallback={null}>
      <GoogleAnalyticsReporter />
      <Popups />
      <Polling />
      <div className="flex flex-col h-full pb-7 xl:pb-0">
        <Header />
        <div className="flex flex-1 py-10 min-h-[50vh]">
          <div className="w-full container flex flex-col space-y-4">
            <Web3ReactManager>
              <Routes>
                <Route path="/" element={<Navigate to="/swap" />} />
                <Route path="/send" element={<RedirectPathToSwapOnly />} />
                <Route path="/find" element={<PoolFinder />} />
                <Route path="/pool" element={<PangolinV3 />} />
                <Route path="/poolv2" element={<Pool />} />
                <Route path="/swap" element={<Swap />} />
                <Route path="/paydece" element={<Paydece />} />
                <Route path="/earn" element={<Earn />} />
                <Route path="/superfarms" element={<SuperFarms />} />
                <Route path="/superfarmsv2" element={<SuperFarmsV2 />} />
                <Route path="/stake" element={<Stake />} />
                <Route path="/stats" element={<Stats />} />
                <Route path="/airdrop" element={<Airdrop />} />
                <Route path="/vote" element={<Vote />} />
                <Route path="/vote/:id" element={<VotePage />} />
                <Route path="/create" element={<RedirectToAddLiquidity />} />
                <Route path="/add" element={<AddLiquidity />} />
                <Route path="/add/:currencyIdA" element={<RedirectOldAddLiquidityPathStructure />} />
                <Route path="/add/:currencyIdA/:currencyIdB" element={<RedirectDuplicateTokenIds />} />
                <Route path="/create" element={<AddLiquidity />} />
                <Route path="/create/:currencyIdA" element={<RedirectOldAddLiquidityPathStructure />} />
                <Route path="/create/:currencyIdA/:currencyIdB" element={<RedirectDuplicateTokenIds />} />
                <Route path="/remove/:tokens" element={<RedirectOldRemoveLiquidityPathStructure />} />
                <Route path="/remove/:currencyIdA/:currencyIdB" element={<RemoveLiquidity />} />
                <Route path="/legal-notices" element={<LegalNoticesPage />} />
                <Route element={<Swap />} />
              </Routes>
            </Web3ReactManager>
          </div>
        </div>
        <Footer />
      </div>
    </Suspense>
  );
}
