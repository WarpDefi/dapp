import React from "react";
// eslint-disable-next-line import/no-extraneous-dependencies
import { BrowserRouter } from "react-router-dom";
import { Box } from "../Box";
import SubMenuItems from "./SubMenuItems";
import SubMenuItemsMock from "./mock";
import { SubMenuItemsProps } from "./types";

export default {
  title: "Components/Menu/SubMenuItems",
  component: SubMenuItems,
};

const Template: React.FC<React.PropsWithChildren<SubMenuItemsProps>> = (args) => {
  return (
    <Box maxWidth="100vw">
      <BrowserRouter>
        <SubMenuItems {...args} />
      </BrowserRouter>
    </Box>
  );
};

export const Default = Template.bind({});
Default.args = {
  items: SubMenuItemsMock,
  activeItem: "/trade",
};
