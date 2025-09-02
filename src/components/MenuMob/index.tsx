import { Badge } from '@/components/ui/badge';
import { ChainId } from '@pangolindex/sdk';
import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import MenuIcon from '../../assets/images/menu.svg';
import { useActiveWeb3React } from '../../hooks';
import { ApplicationModal } from '../../state/application/actions';
import { useModalOpen, useToggleModal } from '../../state/application/hooks';
import { cn } from '@/utils';

const MenuSoon = () => <Badge>Soon</Badge>;

export default function MenuMob() {
  const { chainId } = useActiveWeb3React();
  const open = useModalOpen(ApplicationModal.MENUMOB);
  const toggle = useToggleModal(ApplicationModal.MENUMOB);

  const menuItemClassName = 'px-5 py-3 rounded-md text-foreground hover:bg-[#f1f1f1]';
  const activeClassName = 'bg-primary pointer-events-none';

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [open]);

  return (
    <div className="items-end">
      <div onClick={toggle} className="cursor-pointer p-3 hover:bg-[#f1f1f1] rounded-md transition-colors">
        <img src={MenuIcon} alt="MenuIcon" />
      </div>

      {open && (
        <div className="pt-20 fixed top-0 left-0 w-full h-full">
          <div className="bg-background flex flex-col p-4 h-full">
            <NavLink to="/swap" className={({ isActive }) => cn(menuItemClassName, isActive && activeClassName)} onClick={toggle}>
              Trade
            </NavLink>
            {/* Buy dropdown is disabled 
            <DropdownMenu>
              <DropdownMenuTrigger>
                <div className="flex items-center space-x-1 px-5 py-3 hover:bg-[#f1f1f1] rounded-md">
                  <span>Buy</span>
                  <ChevronDown size={16} />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem>
                  <NavLink to="/paydece" className="w-full py-1 px-1" onClick={toggle}>
                    Paydece
                  </NavLink>
                </DropdownMenuItem>
                <DropdownMenuItem disabled>
                  <div className="flex items-center space-x-1 py-1 px-1">
                    <span>Stripe</span> <MenuSoon />
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem disabled>
                  <div className="flex items-center space-x-1 py-1 px-1">
                    <span>MoonPay</span> <MenuSoon />
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem disabled>
                  <div className="flex items-center space-x-1 py-1 px-1">
                    <span>Nash</span> <MenuSoon />
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            */}
            <NavLink to="/pool" className={({ isActive }) => cn(menuItemClassName, isActive && activeClassName)} onClick={toggle}>
              Pool
            </NavLink>
            {chainId === ChainId.AVALANCHE && (
              <NavLink
                to="/superfarmsv2"
                className={({ isActive }) => cn(menuItemClassName, isActive && activeClassName)}
                onClick={toggle}
              >
                SuyperFarms
              </NavLink>
            )}
            {chainId === ChainId.AVALANCHE && (
              <NavLink to="/earn" className={({ isActive }) => cn(menuItemClassName, isActive && activeClassName)} onClick={toggle}>
                Farm
              </NavLink>
            )}
            {chainId === ChainId.AVALANCHE && (
              <NavLink to="/stake" className={({ isActive }) => cn(menuItemClassName, isActive && activeClassName)} onClick={toggle}>
                Stake
              </NavLink>
            )}
            <NavLink to="/airdrop" className={({ isActive }) => cn(menuItemClassName, isActive && activeClassName)} onClick={toggle}>
              OKX Airdrop
            </NavLink>
            <NavLink to="/vote" className={({ isActive }) => cn(menuItemClassName, isActive && activeClassName)} onClick={toggle}>
              Vote
            </NavLink>
            <a
              className={menuItemClassName}
              href={chainId === ChainId.AVALANCHE ? 'https://warp.finance/' : 'https://warp.finance/?chain=base'}
            >
              Launchpad <span>↗</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
