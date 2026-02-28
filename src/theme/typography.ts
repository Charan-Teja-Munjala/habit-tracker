import { TextStyle } from 'react-native';

export const fontSize = {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 38,
};

export const fontWeight: Record<string, TextStyle['fontWeight']> = {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
};

export const lineHeight = {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
};

export const letterSpacing = {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
};

export const textStyles = {
    hero: {
        fontSize: fontSize['4xl'],
        fontWeight: fontWeight.extrabold,
        letterSpacing: letterSpacing.tight,
    } as TextStyle,
    h1: {
        fontSize: fontSize['3xl'],
        fontWeight: fontWeight.bold,
        letterSpacing: letterSpacing.tight,
    } as TextStyle,
    h2: {
        fontSize: fontSize['2xl'],
        fontWeight: fontWeight.bold,
    } as TextStyle,
    h3: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.semibold,
    } as TextStyle,
    body: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.regular,
    } as TextStyle,
    bodyMedium: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.medium,
    } as TextStyle,
    label: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.medium,
    } as TextStyle,
    caption: {
        fontSize: fontSize.xs,
        fontWeight: fontWeight.regular,
    } as TextStyle,
};
