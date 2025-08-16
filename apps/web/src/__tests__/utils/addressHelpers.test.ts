import { getAddressFromMap } from 'utils/addressHelpers'

describe('getAddress', () => {
  const address = {
    56: '0x6d7ce523d59C59De27BB755A1981f4043e79C70E',
    97: '0xFa60D973F7642B748046464e165A65B7323b0DEE',
  } as const

  it(`get address for mainnet (chainId 56)`, () => {
    const expected = address[56]
    expect(getAddressFromMap(address, 56)).toEqual(expected)
  })
  it(`get address for testnet (chainId 97)`, () => {
    const expected = address[97]
    expect(getAddressFromMap(address, 97)).toEqual(expected)
  })
  it(`get address for any other network (chainId 31337)`, () => {
    const expected = address[56]
    expect(getAddressFromMap(address, 31337)).toEqual(expected)
  })
})
