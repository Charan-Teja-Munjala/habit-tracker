import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '../types';
import { levelFromXP } from '../utils/xpUtils';
import { ACHIEVEMENTS } from '../constants/habits';
import { TODAY } from '../utils/dateUtils';

interface UserStore {
    profile: UserProfile;
    themeMode: 'dark' | 'light';
    hasOnboarded: boolean;

    // Actions
    initProfile: (name: string) => void;
    addXP: (amount: number) => { newLevel: number; didLevelUp: boolean };
    updateProfile: (updates: Partial<Pick<UserProfile, 'name'>>) => void;
    unlockAchievement: (id: string) => void;
    toggleTheme: () => void;
    useStreakFreeze: () => boolean;
    checkAchievements: (totalCompletions: number, maxStreak: number, totalHabits: number) => string[];
}

const defaultProfile: UserProfile = {
    id: 'user_1',
    name: '',
    totalXP: 0,
    level: 0,
    achievements: [],
    streakFreeze: 2,
    joinedAt: new Date().toISOString(),
};

export const useUserStore = create<UserStore>()(
    persist(
        (set, get) => ({
            profile: defaultProfile,
            themeMode: 'dark',
            hasOnboarded: false,

            initProfile: (name) => {
                set({
                    profile: {
                        ...defaultProfile,
                        id: `user_${Date.now()}`,
                        name,
                        joinedAt: new Date().toISOString(),
                    },
                    hasOnboarded: true,
                });
            },

            addXP: (amount) => {
                const { profile } = get();
                const newXP = profile.totalXP + amount;
                const newLevel = levelFromXP(newXP);
                const didLevelUp = newLevel > profile.level;
                set({ profile: { ...profile, totalXP: newXP, level: newLevel } });
                return { newLevel, didLevelUp };
            },

            updateProfile: (updates) => {
                set((state) => ({
                    profile: { ...state.profile, ...updates },
                }));
            },

            unlockAchievement: (id) => {
                const { profile } = get();
                if (profile.achievements.includes(id)) return;
                set({
                    profile: {
                        ...profile,
                        achievements: [...profile.achievements, id],
                    },
                });
            },

            toggleTheme: () => {
                set((state) => ({
                    themeMode: state.themeMode === 'dark' ? 'light' : 'dark',
                }));
            },

            useStreakFreeze: () => {
                const { profile } = get();
                if (profile.streakFreeze <= 0) return false;
                set({ profile: { ...profile, streakFreeze: profile.streakFreeze - 1 } });
                return true;
            },

            checkAchievements: (totalCompletions, maxStreak, totalHabits) => {
                const { profile } = get();
                const newlyUnlocked: string[] = [];

                ACHIEVEMENTS.forEach((achievement) => {
                    if (profile.achievements.includes(achievement.id)) return;
                    const { type, value } = achievement.condition;
                    let unlocked = false;

                    if (type === 'total_completions' && totalCompletions >= value) unlocked = true;
                    if (type === 'streak' && maxStreak >= value) unlocked = true;
                    if (type === 'total_habits' && totalHabits >= value) unlocked = true;
                    if (type === 'level' && profile.level >= value) unlocked = true;

                    if (unlocked) {
                        get().unlockAchievement(achievement.id);
                        newlyUnlocked.push(achievement.id);
                    }
                });

                return newlyUnlocked;
            },
        }),
        {
            name: 'user-store',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
