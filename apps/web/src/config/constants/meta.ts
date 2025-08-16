import { ContextApi } from '@pancakeswap/localization'
import memoize from 'lodash/memoize'
import { ASSET_CDN } from './endpoints'
import { PageMeta } from './types'

export const DEFAULT_META: PageMeta = {
  title: 'GroFi DEX',
  description: 'Trade, earn, and own crypto.',
  image: `${ASSET_CDN}/web/og/hero.jpg`,
}

interface PathList {
  paths: { [path: string]: { title: string; basePath?: boolean; description?: string; image?: string } }
  defaultTitleSuffix: string
}

const getPathList = (t: ContextApi['t']): PathList => {
  return {
    paths: {
      '/': { title: t('Home') },
      '/swap': { basePath: true, title: t('Exchange') },
      '/trade': { basePath: true, title: t('Trade') },
      // '/limit-orders': { basePath: true, title: t('Limit Orders') },
      '/add': { basePath: true, title: t('Add Liquidity') },
      '/remove': { basePath: true, title: t('Remove Liquidity') },
      '/liquidity': { title: t('Liquidity') },
      // '/find': { title: t('Import Pool') },
      // '/competition': { title: t('Trading Battle') },
      // '/prediction': { title: t('Prediction') },
      // '/prediction/leaderboard': { title: t('Leaderboard') },
      '/farms': { title: t('Farms') },
      // '/farms/auction': { title: t('Farm Auctions') },
      // '/pools': { title: t('Pools') },
      // '/lottery': { title: t('Lottery') },
      // '/ifo': { title: t('Initial Farm Offering') },
      // '/teams': { basePath: true, title: t('Leaderboard') },
      // '/voting': { basePath: true, title: t('Voting') },
      // '/voting/proposal': { title: t('Proposals') },
      // '/voting/proposal/create': { title: t('Make a Proposal') },
      '/info': {
        title: `${t('Overview')} - ${t('Info')}`,
        description: 'View statistics for GroFi DEX exchanges.',
      },
      '/info/pairs': {
        title: `${t('Pairs')} - ${t('Info')}`,
        description: 'View statistics for GroFi DEX exchanges.',
      },
      '/info/tokens': {
        title: `${t('Tokens')} - ${t('Info')}`,
        description: 'View statistics for GroFi DEX exchanges.',
      },
      // '/nfts': { title: t('NFT Marketplace') },
      // '/nfts/collections': { basePath: true, title: t('Collections') },
      // '/nfts/activity': { title: t('Activity') },
      // '/profile': { basePath: true, title: t('Profile') },
      // '/pancake-squad': { basePath: true, title: t('GroFi DEX Squad') },
      // '/pottery': { basePath: true, title: t('Pottery') },
      '/pair': { title: t('Pair') },
      '/staking': { title: t('Staking') },
      '/loans': { title: t('Loans') },
      '/launchpad': { title: t('Launchpad') },
    },
    defaultTitleSuffix: t('GroFi DEX'),
  }
}

export const getCustomMeta = memoize(
  (path: string, t: ContextApi['t'], _: string): PageMeta | null => {
    const pathList = getPathList(t)
    const basePath = Object.entries(pathList.paths).find(([url, data]) => data.basePath && path.startsWith(url))?.[0]
    const pathMetadata = pathList.paths[path] ?? (basePath && pathList.paths[basePath])

    if (pathMetadata) {
      return {
        title: `${pathMetadata.title}`,
        ...(pathMetadata.description && { description: pathMetadata.description }),
        image: pathMetadata.image,
      }
    }
    return null
  },
  (path, t, locale) => `${path}#${locale}`,
)
