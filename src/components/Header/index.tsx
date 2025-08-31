import LogoWhite from '@/assets/logo-white.png';
import LogoDark from '@/assets/logo-dark.png';
import { DarkModeToggle } from '@/components/DarkModeToggle';
import { Icons } from '@/components/icons';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConnectWalletButtonRainbow } from '@/components/ui/connect-wallet-button-rainbow';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useActiveWeb3React } from '@/hooks';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useTheme } from '@/provider/theme-provider';
import { cn } from '@/utils';
import { ChainId } from '@pangolindex/sdk';
import { ArrowLeft, ChevronDown, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useMediaQuery } from '@mui/material';
import { useChainId } from '@/provider';

const MenuSoon = () => <Badge>Soon</Badge>;

interface MenuItem {
  label: string | React.ReactNode;
  url?: string;
  type: 'link' | 'dropdown';
  soon?: boolean;
  isVisible?: boolean;
  items?: MenuItem[];
}

interface Menu {
  label: string | React.ReactNode;
  url?: string;
  type: 'link' | 'more';
  isVisible?: boolean;
  items?: MenuItem[];
}

export default function Header() {
  const chainId = useChainId();
  const { theme } = useTheme();
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const isDarkMode = theme === 'dark' || (theme === 'system' && prefersDarkMode);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const isAvalanche = chainId === ChainId.AVALANCHE;
  const menuItemClassName =
    'text-lg lg:text-base px-3 py-1 rounded-md text-foreground hover:bg-[#f1f1f1] dark:hover:bg-muted';
  const activeClassName = 'bg-primary dark:text-background pointer-events-none';
  const menus: Menu[] = [
    {
      label: 'Swap',
      url: '/swap',
      type: 'link',
    },
    {
      label: 'Pool',
      url: '/pool',
      type: 'link',
    },
    {
      label: 'Stake',
      url: '/stake',
      type: 'link',
      isVisible: isAvalanche,
    },
    {
      label: 'Stats',
      url: '/stats',
      type: 'link',
      isVisible: isAvalanche,
    },
    {
      label: '',
      url: '',
      type: 'more',
      items: [
        /* {
          label: 'Buy',
          type: 'dropdown',
          items: [
            {
              label: 'Paydece',
              url: '/paydece',
              type: 'link',
            },
            {
              label: 'Stripe',
              url: '/stripe',
              type: 'link',
              soon: true,
            },
            {
              label: 'MoonPay',
              url: '/moonpay',
              type: 'link',
              soon: true,
            },
            {
              label: 'Nash',
              url: '/nash',
              type: 'link',
              soon: true,
            },
          ],
        }, */
        {
          label: 'Vote',
          url: '/vote',
          type: 'link',
        },
        {
          label: (
            <span>
              Bridge <span>↗</span>
            </span>
          ),
          url: isAvalanche ? 'https://core.app/bridge/' : 'https://scroll.io/bridge',
          type: 'link',
        },
        {
          label: (
            <span>
              Pangolin V2 <span>↗</span>
            </span>
          ),
          url: 'http://v2.pangolin.exchange/',
          type: 'link',
        },
      ],
    },
  ];

  const toggle = () => {
    setIsMenuOpen(!isMenuOpen);

    if (isMenuOpen) {
      document.body.style.overflow = 'auto';
    } else {
      document.body.style.overflow = 'hidden';
    }
  };

  return (
    <div className="bg-background w-full items-center flex sticky top-0 justify-between flex-none px-6 py-4 z-10 lg:justify-between">
      <div className="flex gap-6">
        <NavLink to="/" className="relative z-20 shrink-0">
          <img className="h-7" src={isDarkMode ? LogoDark : LogoWhite} alt="logo" />
        </NavLink>
        <nav
          className={cn(
            'hidden lg:flex',
            isMenuOpen &&
              'absolute top-0 p-6 pt-20 h-dvh right-0 left-0 z-10 flex flex-col bg-background overflow-hidden',
          )}
        >
          <div className="flex flex-col gap-2 overflow-y-auto lg:flex-row pb-20 lg:pb-0">
            {menus.map((menu, index) => {
              if (menu.type === 'more') {
                if (isMobile) {
                  return menu.items?.map(item => (
                    <NavLink
                      key={index}
                      to={item.url || '#'}
                      className={({ isActive }) => cn(menuItemClassName, isActive && activeClassName)}
                      onClick={() => isMobile && toggle()}
                    >
                      {item.label}
                    </NavLink>
                  ));
                }

                return (
                  <DropdownMenu key={index}>
                    <DropdownMenuTrigger asChild>
                      <div className={cn(menuItemClassName, 'flex items-center gap-1 h-8')}>
                        <Icons.more className="size-4" />
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {menu.items?.map((item, index) => (
                        <DropdownMenuItem key={index}>
                          <NavLink
                            to={item.url || '#'}
                            className={({ isActive }) => cn('w-full py-1 px-1', isActive && 'text-primary')}
                            onClick={() => isMobile && toggle()}
                          >
                            {item.label} {'soon' in item && item.soon && <MenuSoon />}
                          </NavLink>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              }

              if (menu.type === 'link') {
                return (
                  <NavLink
                    key={index}
                    to={menu.url || '#'}
                    className={({ isActive }) => cn(menuItemClassName, isActive && activeClassName)}
                    onClick={() => isMobile && toggle()}
                  >
                    {menu.label === 'Pool' ? (
                      <span className="relative inline-block">
                        Pool
                        <span
                          className="absolute -top-2 -right-4 text-[10px] font-bold px-1 rounded"
                          style={{ color: 'hsl(359.64deg 78.4% 58.24%)' }}
                        >
                          V3
                        </span>
                      </span>
                    ) : (
                      menu.label
                    )}
                  </NavLink>
                );
              }

              if (isMobile) {
                return (
                  <Accordion type="single" collapsible>
                    <AccordionItem value="item-1" className="border-none">
                      <AccordionTrigger className="px-3 py-1">{menu.label}</AccordionTrigger>
                      <AccordionContent className="flex flex-col gap-2 pt-2">
                        {menu.items?.map((item, index) => (
                          <NavLink
                            key={index}
                            to={item.url || '#'}
                            className={({ isActive }) => cn(menuItemClassName, 'px-6', isActive && activeClassName)}
                            onClick={() => isMobile && toggle()}
                          >
                            {item.label} {item.soon && <MenuSoon />}
                          </NavLink>
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                );
              }

              return (
                <DropdownMenu key={index}>
                  <DropdownMenuTrigger>
                    <div className={cn(menuItemClassName, 'flex items-center gap-1')}>
                      <span>{menu.label}</span>
                      <ChevronDown size={16} />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {menu.items?.map((item, index) => (
                      <DropdownMenuItem key={index}>
                        <NavLink
                          to={item.url || '#'}
                          className={({ isActive }) => cn('w-full py-1 px-1', isActive && 'text-primary')}
                          onClick={() => isMobile && toggle()}
                        >
                          {item.label} {item.soon && <MenuSoon />}
                        </NavLink>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            })}
          </div>
        </nav>
      </div>
      <Button variant="ghost" size="icon" className="relative lg:hidden z-20" onClick={() => isMobile && toggle()}>
        {isMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
      </Button>

      <div className="flex items-center gap-2 fixed bottom-0 left-0 px-6 py-4 z-20 bg-background w-full lg:relative lg:p-0 lg:w-auto">
        <DarkModeToggle />
        {/* <NetworkMenu /> */}
        <ConnectWalletButtonRainbow />
      </div>
    </div>
  );
}
