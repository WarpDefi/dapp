import { LogoSize, PANGOLIN_TOKENS_REPO_RAW_BASE_URL, ZERO_ADDRESS } from 'src/constants';

export function getTokenLogoURL(address: string, chainId: number, size: LogoSize = 24) {
  return address == "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7" ? `${PANGOLIN_TOKENS_REPO_RAW_BASE_URL}/main/assets/${chainId}/${ZERO_ADDRESS}/logo_${size}.png` : `${PANGOLIN_TOKENS_REPO_RAW_BASE_URL}/main/assets/${chainId}/${address || ZERO_ADDRESS}/logo_${size}.png`;
}
