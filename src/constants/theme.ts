/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const COLORS = {
  light: {
    accent: "#000",
    background: '#ffffff',
    backgroundElement: '#e7e7e7',
    backgroundSelected: '#f5f5f5',
    border: "#E4E7EC",
    card: "#FFFFFF",
    danger: "#E5484D",
    dangerSoft: "#FDECEC",
    muted: "#a4a4a4",
    text: '#000000',
    textSecondary: '#6d6d6d',
  },
  dark: {
    accent: "#fff",
    background: '#000000',
    backgroundElement: '#1A1A1A',
    backgroundSelected: '#2A2A2A',
    border: "#2C2D33",
    card: "#141414",
    danger: "#FF6B6B",
    dangerSoft: "#3B1D1D",
    muted: "#757575",
    text: '#ffffff',
    textSecondary: '#B0B4BA',
  },
} as const;

export type ThemeColor = keyof typeof COLORS.light & keyof typeof COLORS.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
