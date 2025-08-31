import { AvalancheNetworkInfo, NetworkInfo } from '@/constants/networks'

export function networkPrefix(activeNewtork: NetworkInfo) {
  const isEthereum = activeNewtork === AvalancheNetworkInfo
  if (isEthereum) {
    return '/'
  }
  const prefix = '/' + activeNewtork.route.toLocaleLowerCase() + '/'
  return prefix
}
