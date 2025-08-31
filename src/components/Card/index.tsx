import React from 'react';
import styled from 'styled-components';
import { CardProps, Text } from 'rebass';
import { Box } from 'rebass/styled-components';

const Card = styled(Box)<{ padding?: string; border?: string; borderRadius?: string }>`
  width: 100%;
  border-radius: 16px;
  padding: 1.25rem;
  padding: ${({ padding }) => padding};
  border: ${({ border }) => border};
  border-radius: ${({ borderRadius }) => borderRadius};
`;
export default Card;

export const LightCard = styled(Card)``;

export const GreyCard = styled(Card)``;
export const DarkGreyCard = styled(Card)``;

export const OutlineCard = styled(Card)``;

export const YellowCard = styled(Card)`
  background-color: rgba(243, 132, 30, 0.05);
  font-weight: 500;
`;

export const RedCard = styled(Card)`
  background-color: rgba(243, 132, 30, 0.05);
  font-weight: 500;
`;

export const PinkCard = styled(Card)`
  background-color: rgba(255, 0, 122, 0.03);
  font-weight: 500;
`;

const BlueCardStyled = styled(Card)`
  border-radius: 12px;
  width: fit-content;
`;

export const GreyBadge = styled(Card)`
  width: fit-content;
  border-radius: 8px;
  padding: 4px 6px;
  font-weight: 400;
`;

export const BlueCard = ({ children, ...rest }: CardProps) => {
  return (
    <BlueCardStyled {...rest}>
      <Text fontWeight={500} color="#2172E5">
        {children}
      </Text>
    </BlueCardStyled>
  );
};
