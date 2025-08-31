import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import styled from 'styled-components';

export const STabs = styled(Tabs)`
  font-style: normal;
  font-weight: 500;
  font-size: 18px;
`;

export const STabPanel = styled(TabPanel)`
  display: none;
  min-height: 40vh;
  padding: 4px;
  margin-top: -5px;

  &.is-selected {
    display: block;
  }
`;

export const STabList = styled(TabList)`
  list-style-type: none;
  padding-bottom: 5px;
  padding-left: 0px;
  display: flex;
  justify-content: space-between;
  gap: 2.5rem;
  margin: 0;

  &::-webkit-scrollbar {
    display: none !important;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

export const STab = styled(Tab)`
  padding: 4px;
  user-select: none;
  cursor: arrow;

  &:hover {
    cursor: pointer;
  }

  &.react-tabs__tab--disabled {
    cursor: not-allowed;
    &:hover {
      cursor: default;
    }
  }

  &.is-selected {
    &:hover {
      cursor: default;
    }
  }

  &:focus {
    outline: none;
  }
`;
