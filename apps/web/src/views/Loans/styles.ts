import styled from "styled-components"

export const CardLayout = styled.div`
  --item: 3;
  --space: 30px;
  display: flex;
  flex-wrap: wrap;
  gap: var(--space);
  margin-top: 30px;
  @media screen and (max-width: 991px) {
    --item: 2;
  }
  @media screen and (max-width: 767px) {
    --item: 1;
  }
  > * {
    width: calc((100% - (var(--item) - 1) * var(--space)) / var(--item));
    @media screen and (max-width: 767px) {
      max-width: 480px;
      margin: auto;
    }
  }
`