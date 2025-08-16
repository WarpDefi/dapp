import { useEffect, useState } from "react";
import { css, styled } from "styled-components";
import { Box, BoxProps } from "../Box";
import { Image } from "../Image";
import { ArrowDropDownIcon } from "../Svg";
import { Text } from "../Text";

const DropDownHeader = styled.div`
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  padding: 0px 16px;
  box-shadow: ${({ theme }) => theme.shadows.input};
  border: 2px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 4px;
  background: ${({ theme }) => theme.colors.input};
  transition: border-radius 0.15s;
`;

const DropDownListContainer = styled.div`
  min-width: 100px;
  height: 0;
  position: absolute;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.backgroundItem};
  z-index: ${({ theme }) => theme.zIndices.dropdown};
  transition: transform 0.15s, opacity 0.15s;
  transform: scaleY(0);
  transform-origin: top;
  opacity: 0;
  width: 100%;

  // ${({ theme }) => theme.mediaQueries.sm} {
  //   backdrop-filter: blur(12px) saturate(200%) contrast(80%) brightness(80%);
  //   background-color: ${({ theme }) => theme.colors.dropdownBlur};
  // }
`;

const DropDownContainer = styled(Box)<{ isOpen: boolean }>`
  cursor: pointer;
  width: 100%;
  position: relative;

  border-radius: 4px;
  height: 40px;
  min-width: 125px;
  user-select: none;
  z-index: 20;
  ${({ isOpen, theme }) => (isOpen ? `background: ${theme.colors.input};` : "")}

  ${(props) =>
    props.isOpen &&
    css`
      // ${DropDownHeader} {
      //   border-bottom: 1px solid ${({ theme }) => theme.colors.inputSecondary};
      //   box-shadow: ${({ theme }) => theme.tooltip.boxShadow};
      //   border-radius: 16px 16px 0 0;
      // }

      ${DropDownListContainer} {
        height: auto;
        transform: scaleY(1);
        opacity: 1;
        border: 1px solid ${({ theme }) => theme.colors.dropdown};
        border-top-width: 0;
        border-radius: 0 0 4px 4px;
        box-shadow: ${({ theme }) => theme.shadows.dropdown};
      }
    `}

  svg {
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
  }
`;

const DropDownList = styled.ul`
  padding: 0;
  margin: 0;
  box-sizing: border-box;
  z-index: ${({ theme }) => theme.zIndices.dropdown};
`;

const ListItem = styled.li`
  display: flex;
  list-style: none;
  padding: 8px 16px;
  &:hover {
    background: ${({ theme }) => theme.colors.gradientHover};
  }
	&.active {
    background: ${({ theme }) => theme.colors.gradientHover};
  }
`;

export interface SelectProps extends BoxProps {
  options: OptionProps[];
  onOptionChange?: (option: OptionProps) => void;
  placeHolderText?: string;
  defaultOptionIndex?: number;
	disableFilterSelected?: boolean
}

export interface OptionProps {
  label: string;
  value: any;
  imageUrl?: string;
}

const Select: React.FunctionComponent<React.PropsWithChildren<SelectProps>> = ({
  options,
  onOptionChange,
  defaultOptionIndex = 0,
  placeHolderText,
	disableFilterSelected,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [optionSelected, setOptionSelected] = useState(false);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(defaultOptionIndex);

  const toggling = (event: React.MouseEvent<HTMLDivElement>) => {
    setIsOpen(!isOpen);
    event.stopPropagation();
  };

  const onOptionClicked = (selectedIndex: number) => (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedOptionIndex(selectedIndex);
    setIsOpen(false);
    setOptionSelected(true);

    if (onOptionChange) {
      onOptionChange(options[selectedIndex]);
    }
  };

  useEffect(() => {
    const handleClickOutside = () => {
      setIsOpen(false);
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (defaultOptionIndex) {
      setSelectedOptionIndex(defaultOptionIndex - 1);
      setOptionSelected(true);
    }
  }, [defaultOptionIndex]);

  return (
    <DropDownContainer isOpen={isOpen} {...props}>
      <DropDownHeader onClick={toggling}>
        {options?.[selectedOptionIndex]?.imageUrl && (
          <Image
            mr="4px"
            width={24}
            height={24}
            alt="picked-image"
            style={{ borderRadius: "50%", overflow: "hidden" }}
            src={options?.[selectedOptionIndex]?.imageUrl}
          />
        )}
        <Text color={!optionSelected && placeHolderText ? "text" : undefined}>
          {!optionSelected && placeHolderText ? placeHolderText : options[selectedOptionIndex]?.label}
        </Text>
      </DropDownHeader>
      <ArrowDropDownIcon color="text" onClick={toggling} />
      <DropDownListContainer>
        <DropDownList>
          {options.map((option, index) =>
            placeHolderText || (disableFilterSelected ? true : index !== selectedOptionIndex) ? (
              <ListItem onClick={onOptionClicked(index)} key={option.label} className={(disableFilterSelected && index === selectedOptionIndex) ? 'active' : '' }>
                {option?.imageUrl && (
                  <Image
                    mr="4px"
                    width={24}
                    height={24}
                    alt={`picked-image-${option.label}`}
                    style={{ borderRadius: "50%", overflow: "hidden" }}
                    src={option.imageUrl}
                  />
                )}
                <Text>{option.label}</Text>
              </ListItem>
            ) : null
          )}
        </DropDownList>
      </DropDownListContainer>
    </DropDownContainer>
  );
};

export default Select;
