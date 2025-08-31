import React, { useContext } from 'react';
import Select, { MenuPlacement, MultiValue, OptionsOrGroups, SingleValue } from 'react-select';
import { ThemeContext } from 'styled-components';
import { Option } from './types';
import { useTranslation } from 'react-i18next';

export interface DropdownMenuProps {
  defaultValue: MultiValue<Option> | SingleValue<string>;
  onSelect: (value: MultiValue<Option> | string) => void;
  placeHolder?: string;
  isMulti?: boolean;
  isSearchable?: boolean;
  menuPlacement?: MenuPlacement;
  options: OptionsOrGroups<any, any>;
  height?: string;
  width?: string;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  defaultValue,
  onSelect,
  placeHolder,
  isMulti = false,
  isSearchable = false,
  menuPlacement,
  options,
  height,
  width,
}) => {
  const theme = useContext(ThemeContext);
  const colourStyles = {
    control: (styles) => {
      return {
        ...styles,
        '&:hover': {
        },
        ...(height && { height: height }),
        width: width ? width : 'max-content',
      };
    },
    multiValue: (styles) => {
      return {
        ...styles,
      };
    },
    multiValueLabel: (styles) => {
      return {
        ...styles,
      };
    },
    placeholder: (styles) => {
      return {
        ...styles,
      };
    },
    singleValue: (styles) => {
      return {
        ...styles,
      };
    },
    input: (styles) => {
      return {
        ...styles,
      };
    },
    indicatorsContainer: (styles) => {
      return {
        ...styles,
      };
    },
    indicatorSeparator: (styles) => {
      return {
        ...styles,
        display: 'none',
      };
    },
    option: (styles, { isDisabled }) => {
      return {
        ...styles,
        cursor: isDisabled ? 'not-allowed' : 'default',
      };
    },
    menuList: (styles) => {
      return {
        ...styles,
        padding: 0,
      };
    },
  };

  const { t } = useTranslation();

  return (
    <Select
      options={options}
      onChange={(selectedItems) => {
        if (Array.isArray(selectedItems)) {
          onSelect(selectedItems);
        } else {
          onSelect(selectedItems?.value || '');
        }
      }}
      {...(menuPlacement && { menuPlacement })}
      defaultValue={defaultValue}
      placeholder={placeHolder || t('dropdown.select')}
      isMulti={isMulti}
      isSearchable={isSearchable}
      styles={colourStyles}
      theme={(thm) => ({
        ...thm,
        colors: {
          ...thm.colors,
        },
      })}
    />
  );
};

export default DropdownMenu;
