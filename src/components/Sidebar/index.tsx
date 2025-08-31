import React from 'react';
import { Circle, Link, Menu, MenuItem, MenuLink, MenuName, SidebarWrapper } from './styles';
import { SidebarProps } from './types';
import { useTranslation } from 'react-i18next';
import { Box } from '../BoxV3';
import { Text } from '../TextV3';

const Sidebar: React.FC<SidebarProps> = (props) => {
  const { t } = useTranslation();
  const { setMenu, activeMenu, menuItems, changeAddLiquidityModalStatus } = props;

  return (
    <SidebarWrapper>
      <Text color="color11" fontSize={[32, 28]} fontWeight={500} ml={20} mt={10}>
        {t('elixir.sidebar.title')}
      </Text>

      <Menu>
        {menuItems.map((x, index) => {
          return (
            <MenuItem isActive={x.value === activeMenu} key={index}>
              <MenuLink isActive={x.value === activeMenu} id={x.value} onClick={() => setMenu(x.value)} key={index}>
                {x.value === activeMenu && <Circle />}
                <MenuName fontSize={16}>{x.label}</MenuName>
              </MenuLink>
            </MenuItem>
          );
        })}
      </Menu>

      <Box padding="8px" mb={10} ml="12px">
        <Box pb={'30px'}>
          <Text color="color11" fontSize={14} mb="5px">
            {t('elixir.sidebar.wantToAddLiq')}
          </Text>

          <Link
            fontSize={14}
            color="primary"
            cursor="pointer"
            onClick={() => {
              changeAddLiquidityModalStatus();
            }}
          >
            {t('common.addLiquidity')}
          </Link>
        </Box>
      </Box>
    </SidebarWrapper>
  );
};
export default Sidebar;
