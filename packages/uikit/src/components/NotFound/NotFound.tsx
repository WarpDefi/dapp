import { useTranslation } from "@pancakeswap/localization";
import { JSXElementConstructor, ReactNode, createElement } from "react";

import { styled } from "styled-components";
import { Button } from "../Button";

const StyledNotFound = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px);
  justify-content: center;
  padding: 0 16px;
`;

const StyledImage = styled.img`
  --size: auto;
  width: var(--size);
  height: calc(var(--size) * 569 / 707);
  ${({ theme }) => theme.mediaQueries.xs} {
    --size: 407px;
  }
  ${({ theme }) => theme.mediaQueries.sm} {
    --size: 457px;
  }
  ${({ theme }) => theme.mediaQueries.md} {
    --size: 507px;
  }
  ${({ theme }) => theme.mediaQueries.lg} {
    --size: 557px;
  }
  ${({ theme }) => theme.mediaQueries.xl} {
    --size: 607px;
  }
  ${({ theme }) => theme.mediaQueries.xxl} {
    --size: 707px;
  }
`;

const NotFound = ({
  statusCode = 404,
  children,
  LinkComp,
}: {
  LinkComp: JSXElementConstructor<any>;
  statusCode?: number;
  children: ReactNode;
}) => {
  const { t } = useTranslation();

  const linkElement = createElement(
    LinkComp,
    {
      href: "/",
      passHref: true,
    },
    <Button className="button-hover" scale="md">
      {t("Go to Homepage")}
    </Button>
  );

  return (
    <>
      {children}
      <StyledNotFound>
        <StyledImage src="/images/404.png" />
        {linkElement}
      </StyledNotFound>
    </>
  );
};

export default NotFound;
