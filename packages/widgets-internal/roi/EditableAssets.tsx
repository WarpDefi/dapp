import { useTranslation } from "@pancakeswap/localization";
import { ReactNode, memo, useCallback, useRef } from "react";

import { Button, Flex } from "@pancakeswap/uikit";
import styled from "styled-components";
import { AssetCard, AssetCardProps, CardSection, SectionTitle } from "./AssetCard";

const StyledButton = styled(Button)`
  border-radius: 4px;
  
  @media screen and (max-width: 575px) {
    font-size: 12px;
  }
`

interface Props extends AssetCardProps {
  title?: ReactNode;
  onReset?: () => void;
}

export const EditableAssets = memo(function EditableAssets({ title, onReset, ...rest }: Props) {
  const { t } = useTranslation();
  const firstPriceInputRef = useRef<HTMLInputElement>(null);
  const onEdit = useCallback(() => {
    firstPriceInputRef.current?.focus();
    firstPriceInputRef.current?.select();
  }, []);

  return (
    <CardSection
      header={
        <>
          <SectionTitle>{title}</SectionTitle>
          <Flex>
            <StyledButton className="button-hover" variant="secondary" scale="xs" mr="0.5em" onClick={onEdit} style={{ textTransform: "uppercase" }}>
              {t("Edit")}
            </StyledButton>
            <StyledButton className="button-hover" variant="secondary" scale="xs" onClick={onReset} style={{ textTransform: "uppercase" }}>
              {t("Reset")}
            </StyledButton>
          </Flex>
        </>
      }
    >
      <AssetCard {...rest} firstPriceInputRef={firstPriceInputRef} />
    </CardSection>
  );
});
