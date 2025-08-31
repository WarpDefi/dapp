import styled from 'styled-components';
import { Box } from '../Box';
import { Tab, TabList, TabPanel } from '../Tabs';

export const DesktopWrapper = styled(Box)`
  width: 1080px;
  overflow: auto;
  border-radius: 10px;
  * {
    box-sizing: border-box;
  }
`;

export const MobileWrapper = styled(Box)`
  width: 100%;
  height: 100%;
  display: none;
`;

export const LeftSection = styled(Box)`
  display: flex;
  flex-direction: column;
`;

export const DetailsWrapper = styled(Box)`
  display: grid;
  grid-template-columns: minmax(auto, 65%) minmax(auto, 35%);
  grid-gap: 0px;
`;

export const CustomTab = styled(Tab)`
  padding: 15px 50px;
  font-size: 18px;
  background-color: transparent;
`;

export const CustomTabList = styled(TabList)`
  // Override TabList Styles
  justify-content: flex-start;
  gap: 0px;
  padding-bottom: 0px;
`;

export const CustomTabPanel = styled(TabPanel)`
  // Override TabPanel Styles
  border-top: 0px;
  margin-top: 0px;
  padding: 0px;
`;

export const RightSection = styled(Box)`
  padding: 20px;
  grid-gap: 20px;
  display: flex;
  flex-direction: column;
`;

export const Root = styled(Box)<{ verticalPadding?: string }>`
  width: 100%;
  border-radius: 10px;
  position: relative;
  display: flex;
  flex-direction: column;
  padding: ${({ verticalPadding }) => (verticalPadding ? `${verticalPadding} 30px` : '20px 30px')};
  * {
    box-sizing: border-box;
  }
  overflow: hidden;
`;
