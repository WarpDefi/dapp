import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { ChainId } from '@pangolindex/sdk'
import { ChevronDown } from 'lucide-react'
import React, { MouseEvent, useEffect, useMemo, useState } from 'react'
import AvaxLogo from '../../assets/images/avalanche_token_round.png'
import FlareLogo from '../../assets/images/flare.png'
import HederaLogo from '../../assets/images/hbar.webp'
import SongbirdLogo from '../../assets/images/songbird.png'
import { injected } from '../../connectors'
import { useActiveWeb3React } from '../../hooks'

export default function NetworkMenu() {
  const { chainId } = useActiveWeb3React()

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const NETWORK_LABELS: { [chainId in ChainId]?: string } = useMemo(
    () => ({
      [ChainId.FUJI]: 'FUJI',
      [ChainId.AVALANCHE]: 'Avalanche'
    }),
    []
  )

  const [selectedChain, setSelectedChain] = useState(NETWORK_LABELS[chainId ? chainId : ChainId.AVALANCHE])

  useEffect(() => {
    setSelectedChain(NETWORK_LABELS[chainId ? chainId : ChainId.AVALANCHE])
  }, [NETWORK_LABELS, chainId])

  const switchToAvalanche = (chainId: ChainId) => {
    const AVALANCHE_MAINNET_PARAMS = {
      chainId: '0xA86A',
      chainName: 'Avalanche Mainnet',
      nativeCurrency: {
        name: 'AVALANCHE',
        symbol: 'AVAX',
        decimals: 18
      },
      rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
      blockExplorerUrls: ['https://snowtrace.io/']
    }

    /*const SCROLL_MAINNET_PARAMS = {
            chainId: '0x82750',
            chainName: 'Scroll Mainnet',
            nativeCurrency: {
                name: 'SCROLL',
                symbol: 'ETH',
                decimals: 18
            },
            rpcUrls: ['https://rpc.scroll.io/'],
            blockExplorerUrls: ['https://scrollscan.com/']
        }*/

    if (chainId === ChainId.AVALANCHE) {
      injected.getProvider().then(provider => {
        provider
          .request({
            method: 'wallet_addEthereumChain',
            params: [AVALANCHE_MAINNET_PARAMS]
          })
          .catch((error: any) => {
            console.log(error)
          })
      })
    }

    /*if (cId === ChainId.SCROLL) {
            injected.getProvider().then(provider => {
                provider
                    .request({
                        method: 'wallet_addEthereumChain',
                        params: [SCROLL_MAINNET_PARAMS]
                    })
                    .catch((error: any) => {
                        console.log(error);
                    })
            })
        }*/
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button variant="outline" className="space-x-2">
            <img src={AvaxLogo} className="w-5" />
            <span>{selectedChain}</span>
            <ChevronDown size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem className="space-x-2" onClick={() => switchToAvalanche(43114)}>
            <img src={AvaxLogo} className="w-5" />
            <span>Avalanche</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Soon</DropdownMenuLabel>
          <DropdownMenuItem disabled className="space-x-2">
            <img src={FlareLogo} className="w-5" />
            <span>Flare</span>
          </DropdownMenuItem>
          <DropdownMenuItem disabled className="space-x-2">
            <img src={SongbirdLogo} className="w-5" />
            <span>Songbird</span>
          </DropdownMenuItem>
          <DropdownMenuItem disabled className="space-x-2">
            <img src={HederaLogo} className="w-5" />
            <span>Hedera</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {/* <NetworkMenuDiv>
        <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}>
          <IconButton
            onClick={handleClick}
            size="small"
            sx={{ borderRadius: '100px', marginRight: '16px', ml: 2 }}
            aria-controls={open ? 'account-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
          >
            <RewardsStyled key={'Network'} src={`${chainId == ChainId.SCROLL ? ScrollLogo :  AvaxLogo}`} />
            <div style={{ color: 'black', marginLeft: '2px' }}>{selectedChain}</div>
            <div style={{ marginInlineStart: '0.1rem', width: '1em', height: '1em' }}>
              <svg
                viewBox="0 0 24 24"
                color="primary"
                width="20px"
                style={{ transition: 'all .7s' }}
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M8.11997 9.29006L12 13.1701L15.88 9.29006C16.27 8.90006 16.9 8.90006 17.29 9.29006C17.68 9.68006 17.68 10.3101 17.29 10.7001L12.7 15.2901C12.31 15.6801 11.68 15.6801 11.29 15.2901L6.69997 10.7001C6.30997 10.3101 6.30997 9.68006 6.69997 9.29006C7.08997 8.91006 7.72997 8.90006 8.11997 9.29006Z"></path>
              </svg>
            </div>
          </IconButton>
        </Box>
      </NetworkMenuDiv>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 30,
              height: 30,
              ml: -0.5,
              mr: 1
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0
            }
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => switchToAvalanche(43114)}>
          <Avatar sx={{ backgroundColor: 'transparent', width: 30, height: 30 }}>
            <RewardsStyled key={'AvaxNetwork'} src={`${AvaxLogo}`} />
          </Avatar>
          <NetworkLabel>Avalanche</NetworkLabel>
        </MenuItem>
        <MenuItem disabled={true}>
          <Avatar sx={{ backgroundColor: 'transparent', width: 30, height: 30 }}>
            <RewardsStyled key={'FlareNetwork'} src={`${FlareLogo}`} />
          </Avatar>
          <NetworkLabel>Flare</NetworkLabel>
        </MenuItem>
        <MenuItem disabled={true}>
          <Avatar sx={{ backgroundColor: 'transparent', width: 30, height: 30 }}>
            <RewardsStyled key={'SongbirdNetwork'} src={`${SongbirdLogo}`} />
          </Avatar>
          <NetworkLabel>Songbird</NetworkLabel>
        </MenuItem>
        <MenuItem disabled={true}>
          <Avatar sx={{ backgroundColor: 'transparent', width: 30, height: 30 }}>
            <RewardsStyled key={'HederaNetwork'} src={`${HederaLogo}`} />
          </Avatar>
          <NetworkLabel>Hedera</NetworkLabel>
        </MenuItem>
      </Menu> */}
    </>
  )
}
