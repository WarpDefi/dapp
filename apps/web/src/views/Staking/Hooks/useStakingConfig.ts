import { ChainId } from "@pancakeswap/chains";
import { Native } from "@pancakeswap/sdk";
import { useActiveChainId } from "hooks/useActiveChainId";

export default function useStakingConfig() {
  const nativeCurrency = Native.onChain(ChainId.U2U_NEBULAS)
  const { isWrongNetwork } = useActiveChainId()

  return {
    currency: nativeCurrency,
    isWrongNetwork
  }
}
