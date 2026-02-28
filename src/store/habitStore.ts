import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Habit, TodayStats } from '../types';
import {
    calculateCurrentStreak,
    calculateLongestStreak,
} from '../utils/streakUtils';
import { TODAY } from '../utils/dateUtils';

interface HabitStore {
    habits: Habit[];
    isLoading: boolean;

    // CRUD
    addHabit: (habit: Omit<Habit, 'id' | 'completedDates' | 'streak' | 'longestStreak' | 'createdAt'>) => string;
    editHabit: (id: string, updates: Partial<Habit>) => void;
    deleteHabit: (id: string) => void;
    reorderHabits: (from: number, to: number) => void;

    // Completion
    markComplete: (id: string) => { xpEarned: number; newStreak: number; leveledUp: boolean };
    unmarkComplete: (id: string) => void;

    // Selectors
    getTodayStats: () => TodayStats;
    getHabitById: (id: string) => Habit | undefined;
    getTodayHabits: () => Habit[];
    getActiveHabits: () => Habit[];
}

export const useHabitStore = create<HabitStore>()(
    persist(
        (set, get) => ({
            habits: [],
            isLoading: false,

            addHabit: (habitData) => {
                const id = `habit_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
                const newHabit: Habit = {
                    ...habitData,
                    id,
                    completedDates: [],
                    streak: 0,
                    longestStreak: 0,
                    createdAt: new Date().toISOString(),
                };
                set((state) => ({ habits: [newHabit, ...state.habits] }));
                return id;
            },

            editHabit: (id, updates) => {
                set((state) => ({
                    habits: state.habits.map((h) =>
                        h.id === id ? { ...h, ...updates } : h
                    ),
                }));
            },

            deleteHabit: (id) => {
                set((state) => ({
                    habits: state.habits.filter((h) => h.id !== id),
                }));
            },

            reorderHabits: (from, to) => {
                set((state) => {
                    const habits = [...state.habits];
                    const [moved] = habits.splice(from, 1);
                    habits.splice(to, 0, moved);
                    return { habits };
                });
            },

            markComplete: (id) => {
                const today = TODAY();
                let xpEarned = 0;
                let newStreak = 0;
                let leveledUp = false;

                set((state) => ({
                    habits: state.habits.map((h) => {
                        if (h.id !== id || h.completedDates.includes(today)) return h;
                        const newDates = [...h.completedDates, today];
                        const streak = calculateCurrentStreak(newDates);
                        const longestStreak = calculateLongestStreak(newDates);
                        xpEarned = h.xpReward;
                        newStreak = streak;
                        return { ...h, completedDates: newDates, streak, longestStreak };
                    }),
                }));

                return { xpEarned, newStreak, leveledUp };
            },

            unmarkComplete: (id) => {
                const today = TODAY();
                set((state) => ({
                    habits: state.habits.map((h) => {
                        if (h.id !== id) return h;
                        const newDates = h.completedDates.filter((d) => d !== today);
                        const streak = calculateCurrentStreak(newDates);
                        const longestStreak = calculateLongestStreak(newDates);
                        return { ...h, completedDates: newDates, streak, longestStreak };
                    }),
                }));
            },

            getTodayStats: () => {
                const today = TODAY();
                const habits = get().getActiveHabits();
                const completed = habits.filter((h) => h.completedDates.includes(today));
                const total = habits.length;
                const totalXPEarned = completed.reduce((sum, h) => sum + h.xpReward, 0);
                return {
                    total,
                    completed: completed.length,
                    completionRate: total > 0 ? completed.length / total : 0,
                    totalXPEarned,
                };
            },

            getHabitById: (id) => get().habits.find((h) => h.id === id),

            getTodayHabits: () => {
                const today = new Date();
                const dayOfWeek = today.getDay(); // 0=Sun
                return get().habits.filter((h) => {
                    if (h.frequency === 'daily') return true;
                    if (h.frequency === 'weekly') return dayOfWeek === 1; // Monday
                    if (h.frequency === 'custom') return h.customDays?.includes(dayOfWeek) ?? false;
                    return true;
                });
            },

            getActiveHabits: () => get().getTodayHabits(),
        }),
        {
            name: 'habit-store',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
