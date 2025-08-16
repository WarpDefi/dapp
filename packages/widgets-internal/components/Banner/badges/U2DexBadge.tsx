import { Badge, BadgeLogo, BadgeText } from "./Badge";

const pancakeSwapLogo = "https://assets.pancakeswap.finance/web/banners/pancakeswap-logo.png";

interface U2DexBadgeProps {
  whiteText?: boolean;
}

export const U2DexBadge: React.FC<React.PropsWithChildren<U2DexBadgeProps>> = ({ whiteText }) => {
  return (
    <Badge
      logo={<BadgeLogo src={pancakeSwapLogo} alt="pancakeSwapLogo" />}
      text={<BadgeText color={whiteText ? "#ffffff" : "#090909"}>GroFi DEX</BadgeText>}
    />
  );
};
