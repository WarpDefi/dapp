import { DefaultSeoProps } from 'next-seo'

export const SEO: DefaultSeoProps = {
  titleTemplate: '%s | GroFi DEX',
  defaultTitle: 'GroFi DEX',
  description: 'Trade, earn, and own crypto.',
  twitter: {
    cardType: 'summary_large_image',
    handle: '@GroFi DEX',
    site: '@GroFi DEX',
  },
  openGraph: {
    title: "GroFi DEX - Everyone's Favorite DEX",
    description: 'Trade, earn, and own crypto.',
    images: [{ url: '/thumbnail.png' }],
  },
}
