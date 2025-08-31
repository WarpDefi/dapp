import { Link } from 'react-router-dom';
import AvaLabsLogo from '@/assets/svg/ava-labs.svg';
import AvaLabsDarkLogo from '@/assets/svg/ava-labs-dark.svg';
import HalbornLogo from '@/assets/svg/halborn.svg';
import HalbornDarkLogo from '@/assets/svg/halborn-dark.svg';
import PaladinLogo from '@/assets/svg/paladin.svg';
import PangolinAI from '@/assets/images/agrernt.webm';
import { useEffect, useRef, useState } from 'react';
import './footer.css';
import { useTheme } from '@/provider/theme-provider';
import { useMediaQuery } from '@mui/material';

import ChatIntegration from '../ChatWidget';

export default function Footer() {
  const footerRef = useRef(null);
  const { theme } = useTheme();
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const isDarkMode = theme === 'dark' || (theme === 'system' && prefersDarkMode);
  const [footerVisible, setFooterVisible] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    if (!footerRef.current) return;
    const obs = new IntersectionObserver(([entry]) => setFooterVisible(entry.isIntersecting), {
      root: null,
      threshold: 0,
    });
    obs.observe(footerRef.current);
    return () => obs.disconnect();
  }, []);
  
  useEffect(() => {
    const open = () => setChatOpen(true);
    const close = () => setChatOpen(false);
    window.addEventListener('open-chat', open);
    window.addEventListener('close-chat', close);
    return () => {
      window.removeEventListener('open-chat', open);
      window.removeEventListener('close-chat', close);
    };
  }, []);

  return (
    <div className="py-12 bg-background flex flex-none" ref={footerRef}>
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          <div>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground text-sm">Founded by</span>
                <a href="https://www.avalabs.org/" target="_blank">
                  <img src={isDarkMode ? AvaLabsDarkLogo : AvaLabsLogo} className="h-6" />
                </a>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground text-sm">Audited by</span>
                <div className="flex flex-col gap-6">
                  <a href="https://paladinsec.co/" target="_blank">
                    <img src={PaladinLogo} className="h-8" />
                  </a>
                  <a href="https://www.halborn.com/" target="_blank" style={{ marginLeft: '3px' }}>
                    <img src={isDarkMode ? HalbornDarkLogo : HalbornLogo} className="h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
          {/* <div className="col-span-2 flex flex-col gap-3">
            <img
              className="size-12"
              src="https://raw.githubusercontent.com/pangolindex/tokens/main/assets/43114/0x60781C2586D68229fde47564546784ab3fACA982/logo_48.png"
            />
            <p className="text-balance text-sm text-muted-foreground">
              Pangolin's commitment to transparency, security, and community engagement fosters trust and collaboration
              among users, creating a vibrant ecosystem for growth and innovation.
            </p>
          </div> */}
          <div className="flex flex-col gap-2">
            <h5 className="font-semibold text-lg mb-2">PNG Token</h5>
            <a
              className="text-muted-foreground hover:text-primary transition-colors"
              href="https://coinmarketcap.com/currencies/WarpDefi/"
              target="_blank"
            >
              CoinMarketCap
            </a>
            <a
              className="text-muted-foreground hover:text-primary transition-colors"
              href="https://www.coingecko.com/en/coins/WarpDefi"
              target="_blank"
            >
              CoinGecko
            </a>
            <a
              className="text-muted-foreground hover:text-primary transition-colors"
              href="https://exchange.coinbase.com"
              target="_blank"
            >
              Coinbase
            </a>
            <a
              className="text-muted-foreground hover:text-primary transition-colors"
              href="https://www.gate.io/"
              target="_blank"
            >
              Gate.io
            </a>
            <a
              className="text-muted-foreground hover:text-primary transition-colors"
              href="https://www.mexc.com/"
              target="_blank"
            >
              MEXC
            </a>
          </div>
          <div className="flex flex-col gap-2">
            <h5 className="font-semibold text-lg mb-2">Analytics</h5>
            <a
              className="text-muted-foreground hover:text-primary transition-colors"
              href="https://www.geckoterminal.com/ink/WarpDefi/pools"
              target="_blank"
            >
              Gecko Terminal
            </a>
            <a
              className="text-muted-foreground hover:text-primary transition-colors"
              href="https://tokenterminal.com/terminal/projects/WarpDefi"
              target="_blank"
            >
              Token Terminal
            </a>
            <a
              className="text-muted-foreground hover:text-primary transition-colors"
              href="https://defillama.com/protocol/WarpDefi"
              target="_blank"
            >
              DefiLlama
            </a>
            <a
              className="text-muted-foreground hover:text-primary transition-colors"
              href="https://dexscreener.com/avalanche/WarpDefi"
              target="_blank"
            >
              DEX Screener
            </a>
            <a
              className="text-muted-foreground hover:text-primary transition-colors"
              href="https://dappradar.com/"
              target="_blank"
            >
              DappRadar
            </a>
          </div>
          <div className="flex flex-col gap-2">
            <h5 className="font-semibold text-lg mb-2">Reach us</h5>
            <a
              className="text-muted-foreground hover:text-primary transition-colors"
              href="https://t.me/WarpPortal"
              target="_blank"
            >
              Telegram
            </a>
            <a
              className="text-muted-foreground hover:text-primary transition-colors"
              href="https://discord.gg/"
              target="_blank"
            >
              Discord
            </a>
            <a
              className="text-muted-foreground hover:text-primary transition-colors"
              href="mailto:hello@pangolin.exchange"
            >
              E-mail
            </a>
            <a className="text-muted-foreground hover:text-primary transition-colors">Apply for partnership</a>
            <a className="text-muted-foreground hover:text-primary transition-colors">Apply for Token Listing</a>
            <a className="text-muted-foreground hover:text-primary transition-colors">Apply for Job</a>
          </div>
          <div className="flex flex-col gap-2">
            <h5 className="font-semibold text-lg mb-2">WarpDefi AI</h5>
            <a
              className="text-muted-foreground hover:text-primary transition-colors"
              onClick={() => window.dispatchEvent(new Event('open-chat'))}
            >
              <video
                src={PangolinAI}
                autoPlay
                muted
                loop
                playsInline
                style={{
                  width: '50%',
                  height: 'auto',
                  display: 'block',
                }}
              />
            </a>
          </div>
        </div>
        <div className="flex items-center justify-center gap-4 py-6">
          <a
            className="text-muted-foreground hover:text-primary transition-colors"
            href="https://x.com/Warp_Defi"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              className="fill-foreground dark:fill-muted-foreground"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M23.25 5.13095C22.4222 5.49272 21.5325 5.73636 20.5988 5.84619C21.5522 5.28415 22.2844 4.39356 22.6284 3.33224C21.7369 3.85275 20.7487 4.23113 19.6969 4.43509C18.8559 3.55189 17.655 3 16.3275 3C13.3472 3 11.1572 5.73728 11.8303 8.57886C7.995 8.38966 4.59375 6.5808 2.31656 3.83152C1.10719 5.87387 1.68938 8.54563 3.74437 9.89858C2.98875 9.87459 2.27625 9.67063 1.65469 9.33009C1.60406 11.4352 3.13687 13.4046 5.35687 13.843C4.70719 14.0165 3.99563 14.0571 3.27188 13.9205C3.85875 15.7257 5.56313 17.039 7.58437 17.0759C5.64375 18.5737 3.19875 19.2428 0.75 18.9586C2.79281 20.2478 5.22 21 7.82625 21C16.3969 21 21.2391 13.8744 20.9466 7.48339C21.8484 6.84198 22.6313 6.04184 23.25 5.13095Z"></path>
            </svg>
          </a>
          <a
            className="text-muted-foreground hover:text-primary transition-colors"
            href="https://medium.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              className="fill-foreground dark:fill-muted-foreground"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M3.99025 6.51917C4.0165 6.25209 3.91762 5.98862 3.72513 5.80936L1.76513 3.36486V3H7.85337L12.5591 13.6788L16.6961 3H22.5V3.36486L20.8235 5.02803C20.6791 5.1421 20.6074 5.32951 20.6371 5.51512V17.7358C20.6074 17.9205 20.6791 18.1079 20.8235 18.222L22.4606 19.8851V20.25H14.2251V19.8851L15.9218 18.1812C16.088 18.0092 16.088 17.9585 16.088 17.695V7.81747L11.3726 20.2102H10.7356L5.245 7.81747V16.1233C5.1995 16.4719 5.3115 16.8241 5.54862 17.0758L7.7545 19.8444V20.2102H1.5V19.8444L3.70587 17.0758C3.94212 16.8232 4.04712 16.4692 3.99025 16.1233V6.51917Z"></path>
            </svg>
          </a>
          <a
            className="text-muted-foreground hover:text-primary transition-colors"
            href="https://github.com/WarpDefi"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" className="fill-foreground dark:fill-muted-foreground">
              <path d="M9.43307 15.1339L18.0681 7.21971C18.4471 6.87802 17.9853 6.71158 17.4822 7.02144L6.8254 13.8497L2.22227 12.3905C1.22833 12.0814 1.22104 11.3876 2.44542 10.8888L20.3828 3.86411C21.2022 3.48633 21.9928 4.06411 21.6801 5.33757L18.6254 19.9576C18.412 20.9964 17.7941 21.2449 16.9376 20.765L12.2843 17.2734L10.0476 19.4823C10.0405 19.4893 10.0334 19.4963 10.0263 19.5033C9.77621 19.7506 9.5693 19.9551 9.11653 19.9551L9.43307 15.1339Z"></path>
            </svg>
          </a>
          <a
            className="text-muted-foreground hover:text-primary transition-colors"
            href="https://discord.gg/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              className="fill-foreground dark:fill-muted-foreground"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M20.317 3.65789C18.7873 2.89053 17.147 2.32516 15.4319 2.00136C15.4007 1.99511 15.3695 2.01073 15.3534 2.04196C15.1424 2.45218 14.9087 2.98735 14.7451 3.40799C12.9004 3.10606 11.0652 3.10606 9.25832 3.40799C9.09465 2.978 8.85248 2.45218 8.64057 2.04196C8.62449 2.01177 8.59328 1.99615 8.56205 2.00136C6.84791 2.32413 5.20756 2.88949 3.67693 3.65789C3.66368 3.66414 3.65233 3.67456 3.64479 3.68808C0.533392 8.77013 -0.31895 13.7273 0.0991801 18.6229C0.101072 18.6469 0.11337 18.6698 0.130398 18.6843C2.18321 20.3325 4.17171 21.3331 6.12328 21.9964C6.15451 22.0068 6.18761 21.9943 6.20748 21.9662C6.66913 21.2769 7.08064 20.5502 7.43348 19.7859C7.4543 19.7412 7.43442 19.688 7.39186 19.6703C6.73913 19.3996 6.1176 19.0696 5.51973 18.6948C5.47244 18.6646 5.46865 18.5906 5.51216 18.5552C5.63797 18.4521 5.76382 18.3449 5.88396 18.2366C5.90569 18.2168 5.93598 18.2127 5.96153 18.2252C9.88928 20.1857 14.1415 20.1857 18.023 18.2252C18.0485 18.2116 18.0788 18.2158 18.1015 18.2356C18.2216 18.3439 18.3475 18.4521 18.4742 18.5552C18.5177 18.5906 18.5149 18.6646 18.4676 18.6948C17.8697 19.0769 17.2482 19.3996 16.5945 19.6693C16.552 19.687 16.533 19.7412 16.5538 19.7859C16.9143 20.5491 17.3258 21.2759 17.7789 21.9651C17.7978 21.9943 17.8319 22.0068 17.8631 21.9964C19.8241 21.3331 21.8126 20.3325 23.8654 18.6843C23.8834 18.6698 23.8948 18.6479 23.8967 18.624C24.3971 12.964 23.0585 8.04755 20.3482 3.68912C20.3416 3.67456 20.3303 3.66414 20.317 3.65789ZM8.02002 15.642C6.8375 15.642 5.86313 14.455 5.86313 12.9974C5.86313 11.5397 6.8186 10.3528 8.02002 10.3528C9.23087 10.3528 10.1958 11.5501 10.1769 12.9974C10.1769 14.455 9.22141 15.642 8.02002 15.642ZM15.9947 15.642C14.8123 15.642 13.8379 14.455 13.8379 12.9974C13.8379 11.5397 14.7933 10.3528 15.9947 10.3528C17.2056 10.3528 18.1705 11.5501 18.1516 12.9974C18.1516 14.455 17.2056 15.642 15.9947 15.642Z"></path>
            </svg>
          </a>
          <a
            className="text-muted-foreground hover:text-primary transition-colors"
            href="https://www.youtube.com/channel/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" className="fill-foreground dark:fill-muted-foreground">
              <path
                id="Path_2465"
                data-name="Path 2465"
                d="M8.65,13.354,13.2,10.537,8.65,7.727Z"
                transform="translate(0.013 0.012)"
              />
              <path
                id="Path_2466"
                data-name="Path 2466"
                d="M19.029.032H2.035a2,2,0,0,0-2,2V19.029a2,2,0,0,0,2,2H19.029a2,2,0,0,0,2-2V2.035A2,2,0,0,0,19.029.032ZM15.087,15.639H10.5q-2.249,0-4.5,0a2.782,2.782,0,0,1-.33,0A2.679,2.679,0,0,1,3.159,12.8V8.208c0-.089-.005-.178,0-.267a2.677,2.677,0,0,1,2.8-2.548h9.124c.083,0,.167,0,.25,0a2.673,2.673,0,0,1,2.543,2.8V12.84q.006.125,0,.249A2.672,2.672,0,0,1,15.087,15.639Z"
              />
            </svg>
          </a>
          <a
            className="text-muted-foreground hover:text-primary transition-colors"
            href="https://github.com/WarpDefi"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              className="fill-foreground dark:fill-muted-foreground"
              xmlns="http://www.w3.org/2000/svg"
              focusable="false"
            >
              <path d="M12 4C7.58267 4 4 7.67255 4 12.2022C4 15.8263 6.292 18.9007 9.47133 19.9855C9.87067 20.0614 10 19.8071 10 19.5911V18.0641C7.77467 18.5603 7.31133 17.0962 7.31133 17.0962C6.94733 16.1482 6.42267 15.896 6.42267 15.896C5.69667 15.3868 6.478 15.3977 6.478 15.3977C7.28133 15.4551 7.704 16.2432 7.704 16.2432C8.41733 17.4968 9.57533 17.1345 10.032 16.9247C10.1033 16.395 10.3107 16.0327 10.54 15.8283C8.76333 15.6198 6.89533 14.9165 6.89533 11.7744C6.89533 10.8783 7.208 10.1469 7.71933 9.57274C7.63667 9.36563 7.36267 8.53106 7.79733 7.40188C7.79733 7.40188 8.46933 7.18179 9.998 8.24261C10.636 8.06079 11.32 7.96989 12 7.96647C12.68 7.96989 13.3647 8.06079 14.004 8.24261C15.5313 7.18179 16.202 7.40188 16.202 7.40188C16.6373 8.53174 16.3633 9.36632 16.2807 9.57274C16.794 10.1469 17.104 10.8789 17.104 11.7744C17.104 14.9247 15.2327 15.6185 13.4513 15.8215C13.738 16.0758 14 16.5747 14 17.3403V19.5911C14 19.8091 14.128 20.0655 14.534 19.9848C17.7107 18.8987 20 15.8249 20 12.2022C20 7.67255 16.418 4 12 4Z"></path>
            </svg>
          </a>
        </div>
        <div className="flex items-center justify-center space-x-4 text-muted-foreground mt-4">
          <Link to="/legal-notices" className="hover:text-primary transition-colors">
            Legal Notices
          </Link>
        </div>
      </div>
      <ChatIntegration/>
    </div>
  );
}
