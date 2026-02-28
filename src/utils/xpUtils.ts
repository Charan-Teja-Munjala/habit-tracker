import { XP_THRESHOLDS, LEVEL_TITLES } from '../constants/habits';

export const levelFromXP = (xp: number): number => {
    let level = 0;
    for (let i = 0; i < XP_THRESHOLDS.length; i++) {
        if (xp >= XP_THRESHOLDS[i]) level = i;
        else break;
    }
    return level;
};

export const xpForLevel = (level: number): number =>
    XP_THRESHOLDS[Math.min(level, XP_THRESHOLDS.length - 1)];

export const xpProgress = (xp: number): number => {
    const level = levelFromXP(xp);
    const currentThreshold = xpForLevel(level);
    const nextThreshold = xpForLevel(level + 1);
    if (nextThreshold === currentThreshold) return 1;
    return (xp - currentThreshold) / (nextThreshold - currentThreshold);
};

export const xpToNextLevel = (xp: number): number => {
    const level = levelFromXP(xp);
    return xpForLevel(level + 1) - xp;
};

export const getLevelTitle = (level: number): string =>
    LEVEL_TITLES[Math.min(level, LEVEL_TITLES.length - 1)];
