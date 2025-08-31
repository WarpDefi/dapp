import React, { useContext, useMemo } from 'react';
import { Text, TextProps } from 'rebass';
import styled, { css, DefaultTheme, ThemeProvider as StyledComponentsThemeProvider, ThemeContext } from 'styled-components';
import { useIsDarkMode } from '../state/user/hooks';
import { Colors } from './styled';

export type ThemeColorsType = NestedObjectDotNotation<Colors>;

export * from './components';

const MEDIA_WIDTHS = {
  uptoXXSmall: 320,
  upToExtraSmall: 500,
  upToSmall: 720,
  upToMedium: 960,
  upToLarge: 1280,
};

const mediaWidthTemplates: { [width in keyof typeof MEDIA_WIDTHS]: typeof css } = Object.keys(MEDIA_WIDTHS).reduce(
  (accumulator, size) => {
    (accumulator as any)[size] = (a: any, b: any, c: any) => css`
      @media (max-width: ${(MEDIA_WIDTHS as any)[size]}px) {
        ${css(a, b, c)}
      }
    `;
    return accumulator;
  },
  {},
) as any;

const white = '#FFFFFF';
const brandDarkBlue = '#00154F'; // background dark blue
const brandBlue = '#0c51f3';     // primary blue

export function colors(darkMode: boolean): Colors {
  return {
    // base
    white,
    black: brandDarkBlue,

    // text
    text1: darkMode ? '#FFFFFF' : '#000000',
    text2: darkMode ? '#C3C5CB' : '#565A69',
    text3: darkMode ? '#6C7284' : '#888D9B',
    text4: darkMode ? '#565A69' : '#C3C5CB',
    text5: darkMode ? '#2C2F36' : '#EDEEF2',
    text6: darkMode ? '#608f95' : '#608f95',

    textMenu: darkMode ? '#FFFFFF' : '#565A69',

    // backgrounds / branding blues
    bg1: darkMode ? brandDarkBlue : '#FFFFFF',  // main background
    bg2: darkMode ? '#021C61' : '#F7F8FA',
    bg3: darkMode ? '#08256F' : '#EDEEF2',
    bg4: darkMode ? '#0F3180' : '#CED0D9',
    bg5: darkMode ? '#1A3E91' : '#888D9B',

    // specialty colors
    modalBG: darkMode ? 'rgba(0,0,0,.425)' : 'rgba(0,0,0,0.3)',
    advancedBG: darkMode ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.6)',

    // primary colors (buttons)
    primary1: brandBlue,    // button background
    primary2: '#103c9c',    // hover state
    primary3: '#4D8FEA',
    primary4: '#376bad',
    primary5: '#153d6f',
    primary6: brandBlue,
    primary7: brandBlue,

    // color text
    primaryText1: darkMode ? brandBlue : brandBlue, // blue text inside white buttons

    // secondary colors
    secondary1: brandBlue,
    secondary2: darkMode ? '#17000b' : '#F6DDE8',
    secondary3: darkMode ? '#17000b' : '#FDEAF1',

    // other
    red1: '#FF6871',
    red2: '#F82D3A',
    green1: '#57cb7a',
    yellow1: brandBlue,  // replaced with blue
    yellow2: brandBlue,  // replaced with blue
    blue1: brandBlue,

    avaxRed: '#E84142',
  };
}

export function theme(darkMode: boolean): DefaultTheme {
  return {
    ...colors(darkMode),

    grids: {
      sm: 8,
      md: 12,
      lg: 24,
    },

    // shadows
    shadow1: darkMode ? '#000' : '#2F80ED',

    // media queries
    mediaWidth: mediaWidthTemplates,

    // css snippets
    flexColumnNoWrap: css`
      display: flex;
      flex-flow: column nowrap;
    `,
    flexRowNoWrap: css`
      display: flex;
      flex-flow: row nowrap;
    `,
  };
}

export const useTheme = () => {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw Error('useTheme is used outside of ThemeContext');
  }

  return theme;
};

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const darkMode = useIsDarkMode();

  const themeObject = useMemo(() => theme(darkMode), [darkMode]);

  return <StyledComponentsThemeProvider theme={themeObject}>{children}</StyledComponentsThemeProvider>;
}

const TextWrapper = styled(Text)<{ color: keyof Colors }>`
  color: ${({ color, theme }) => (theme as any)[color]};
`;

const TextWrapperM = styled(Text)<{ color: keyof Colors }>`
  color: ${({ color, theme }) => (theme as any)[color]};
  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 12px;
  `};
`;

const TextWrapperGM = styled(Text)<{ color: keyof Colors }>`
  color: ${({ color, theme }) => (theme as any)[color]};
  font-size: 14px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 12px;
  `};
`;

export const HideExtraSmall = styled.span`
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    display: none;
  `};
`

export const ExtraSmallOnly = styled.span`
  display: none;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    display: block;
  `};
`

export const TYPE = {
  main(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'text2'} {...props} />;
  },
  link(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'primary1'} {...props} />;
  },
  label(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'text1'} {...props} />
  },
  black(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'text1'} {...props} />;
  },
  blackM(props: TextProps) {
    return <TextWrapperM fontWeight={500} color={'text1'} {...props} />;
  },
  white(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'white'} {...props} />;
  },
  body(props: TextProps) {
    return <TextWrapper fontWeight={400} fontSize={16} color={'text1'} {...props} />;
  },
  largeHeader(props: TextProps) {
    return <TextWrapper fontWeight={600} fontSize={24} {...props} />;
  },
  mediumHeader(props: TextProps) {
    return <TextWrapper fontWeight={500} fontSize={20} {...props} />;
  },
  subHeader(props: TextProps) {
    return <TextWrapper fontWeight={400} fontSize={14} {...props} />;
  },
  small(props: TextProps) {
    return <TextWrapper fontWeight={500} fontSize={11} {...props} />;
  },
  blue(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'primary1'} {...props} />;
  },
  yellow(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'yellow1'} {...props} />;
  },
  darkGray(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'text3'} {...props} />;
  },
  darkGrayM(props: TextProps) {
    return <TextWrapperGM fontWeight={500} color={'text3'} {...props} />;
  },
  specialBlue(props: TextProps) {
    return <TextWrapperGM fontWeight={500} color={'text6'} {...props} />;
  },
  gray(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'bg3'} {...props} />;
  },
  italic(props: TextProps) {
    return <TextWrapper fontWeight={500} fontSize={12} fontStyle={'italic'} color={'text2'} {...props} />;
  },
  error({ error, ...props }: { error: boolean } & TextProps) {
    return <TextWrapper fontWeight={500} color={error ? 'red1' : 'text2'} {...props} />;
  },
};
