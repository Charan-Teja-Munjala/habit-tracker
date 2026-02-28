export const darkColors = {
  // Backgrounds
  background: '#0A0E1A',
  surface: '#141828',
  card: '#1C2235',
  elevated: '#222840',

  // Accents
  primary: '#6C63FF',
  primaryLight: '#8B85FF',
  secondary: '#FF6584',
  success: '#4ECDC4',
  warning: '#FFE66D',
  error: '#FF6B6B',
  info: '#74B9FF',

  // Gradients (start → end)
  gradientPrimary: ['#6C63FF', '#9B59B6'] as [string, string],
  gradientSuccess: ['#4ECDC4', '#44CF6C'] as [string, string],
  gradientWarning: ['#FFE66D', '#FFA502'] as [string, string],
  gradientHot: ['#FF6584', '#FF4757'] as [string, string],

  // Text
  textPrimary: '#F0F4FF',
  textSecondary: '#8892A8',
  textTertiary: '#4A5568',
  textInverse: '#0A0E1A',

  // Borders
  border: '#2A3150',
  borderLight: '#1E2745',

  // Glassmorphism
  glass: 'rgba(255,255,255,0.06)',
  glassBorder: 'rgba(255,255,255,0.12)',
  glassStrong: 'rgba(255,255,255,0.10)',

  // Opacity overlays
  overlay: 'rgba(0,0,0,0.60)',
  overlayLight: 'rgba(0,0,0,0.30)',

  // Tab / Navigation
  tabBar: '#111627',
  tabBarActive: '#6C63FF',
  tabBarInactive: '#4A5568',
};

export const lightColors = {
  // Backgrounds
  background: '#F0F4FF',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  elevated: '#F8F9FF',

  // Accents (same as dark)
  primary: '#6C63FF',
  primaryLight: '#8B85FF',
  secondary: '#FF6584',
  success: '#4ECDC4',
  warning: '#F0A500',
  error: '#FF6B6B',
  info: '#74B9FF',

  gradientPrimary: ['#6C63FF', '#9B59B6'] as [string, string],
  gradientSuccess: ['#4ECDC4', '#44CF6C'] as [string, string],
  gradientWarning: ['#FFE66D', '#FFA502'] as [string, string],
  gradientHot: ['#FF6584', '#FF4757'] as [string, string],

  // Text
  textPrimary: '#0A0E1A',
  textSecondary: '#4A5568',
  textTertiary: '#8892A8',
  textInverse: '#F0F4FF',

  // Borders
  border: '#E2E8F0',
  borderLight: '#EEF2FF',

  // Glassmorphism
  glass: 'rgba(255,255,255,0.70)',
  glassBorder: 'rgba(255,255,255,0.90)',
  glassStrong: 'rgba(255,255,255,0.85)',

  // Opacity overlays
  overlay: 'rgba(0,0,0,0.40)',
  overlayLight: 'rgba(0,0,0,0.15)',

  // Tab / Navigation
  tabBar: '#FFFFFF',
  tabBarActive: '#6C63FF',
  tabBarInactive: '#8892A8',
};

export type ColorPalette = typeof darkColors;
