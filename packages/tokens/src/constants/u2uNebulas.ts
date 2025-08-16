import { ChainId } from '@pancakeswap/chains'
import { ERC20Token, WBNB, WETH9, WNATIVE } from '@pancakeswap/sdk'

import { USDT_U2U } from './common'

export const u2uNebulasTokens = {
  wu2u: WNATIVE[ChainId.U2U_NEBULAS],
  usdt: USDT_U2U,
  weth: WETH9[ChainId.U2U_NEBULAS],
  wbtc: new ERC20Token(
    ChainId.U2U_NEBULAS,
    '0x4ebbe24182e9c14e1d2e02ab9459190f39c43b6f',
    18,
    'WBTC',
    'Wrapped BTC',
    '',
  ),
  wbnb: WBNB[ChainId.U2U_NEBULAS],
  wtrx: new ERC20Token(ChainId.U2U_NEBULAS, '0x5b4aabd65701eeda8afe6e341cb23b52f2ef7e56', 18, 'WTRX', 'Wrapped TRX'),
  wxrp: new ERC20Token(ChainId.U2U_NEBULAS, '0xcedb8ee7c0e21bdd78f46e334a33ed17189131d5', 18, 'WXRP', 'Wrapped XRP'),
  wsol: new ERC20Token(ChainId.U2U_NEBULAS, '0xa4447a108e92b8c36de0fb310d43f95c54fc81e2', 18, 'WSOL', 'Wrapped Solana'),
  wdoge: new ERC20Token(
    ChainId.U2U_NEBULAS,
    '0xf25394ebb6d132d21bce902f759f592954e898cd',
    18,
    'WDOGE',
    'Wrapped Doge Coin',
  ),
  wnear: new ERC20Token(ChainId.U2U_NEBULAS, '0xfd7ea8beabf2999dcf7f97a694b7fda60ac4bf20', 18, 'WNEAR', 'Wrapped Near'),
  wada: new ERC20Token(
    ChainId.U2U_NEBULAS,
    '0xbeb74c0c2cc994c8fad7ba91fae15b5b748cd707',
    18,
    'WADA',
    'Wrapped Cardano',
  ),
}
