import React, { createContext, useContext, ReactNode } from 'react';
import { useUserStore } from '../store/userStore';
import { buildTheme, Theme } from '../theme';

const ThemeContext = createContext<Theme | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const themeMode = useUserStore((s) => s.themeMode);
    const theme = buildTheme(themeMode);
    return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
    return ctx;
}
