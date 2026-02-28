import { darkColors, lightColors, ColorPalette } from './colors';
import { fontSize, fontWeight, lineHeight, letterSpacing, textStyles } from './typography';
import { spacing, borderRadius, shadow } from './spacing';

export type ThemeMode = 'dark' | 'light';

export interface Theme {
    mode: ThemeMode;
    colors: ColorPalette;
    fontSize: typeof fontSize;
    fontWeight: typeof fontWeight;
    lineHeight: typeof lineHeight;
    letterSpacing: typeof letterSpacing;
    textStyles: typeof textStyles;
    spacing: typeof spacing;
    borderRadius: typeof borderRadius;
    shadow: typeof shadow;
}

export function buildTheme(mode: ThemeMode): Theme {
    return {
        mode,
        colors: mode === 'dark' ? darkColors : lightColors,
        fontSize,
        fontWeight,
        lineHeight,
        letterSpacing,
        textStyles,
        spacing,
        borderRadius,
        shadow,
    };
}

export const darkTheme = buildTheme('dark');
export const lightTheme = buildTheme('light');

export * from './colors';
export * from './typography';
export * from './spacing';
