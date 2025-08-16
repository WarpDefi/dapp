import { styled } from "styled-components";

import { AtomBox, AtomBoxProps, Card, CardBody, CardFooter } from "@pancakeswap/uikit";
import LiquidityCardHeader from "./LiquidityCardHeader";

type LiquidityCardProps = AtomBoxProps;

export const CardWrapper = styled(Card)`
  border-radius: 8px;
  max-width: 480px;
  width: 100%;
  z-index: 1;
  margin: auto;
`;

export const LiquidityCard = ({ children, ...props }: LiquidityCardProps) => (
  <>
    <AtomBox width="100%" display="flex" flexDirection="column" alignItems="center" {...props}>
      <CardWrapper>{children}</CardWrapper>
    </AtomBox>
  </>
);

const ListBody = styled(CardBody)`
  background-color: ${({ theme }) => theme.colors.dropdownDeep};
`;

LiquidityCard.ListBody = ListBody;
LiquidityCard.Header = LiquidityCardHeader;
LiquidityCard.Footer = CardFooter;
