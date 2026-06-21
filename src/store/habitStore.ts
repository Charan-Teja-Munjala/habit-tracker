import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Habit, TodayStats } from '../types';
import {
    calculateCurrentStreak,
    calculateLongestStreak,
} from '../utils/streakUtils';
import { TODAY } from '../utils/dateUtils';
import { levelFromXP } from '../utils/xpUtils';

interface HabitStore {
    habits: Habit[];
    isLoading: boolean;

    // CRUD
    addHabit: (habit: Omit<Habit, 'id' | 'completedDates' | 'streak' | 'longestStreak' | 'createdAt' | 'notes' | 'moods'>) => string;
    editHabit: (id: string, updates: Partial<Habit>) => void;
    deleteHabit: (id: string) => void;
    archiveHabit: (id: string) => void;
    reorderHabits: (from: number, to: number) => void;

    // Completion
    markComplete: (id: string, currentXP: number, note?: string, mood?: string) => { xpEarned: number; newStreak: number; leveledUp: boolean; newLevel: number };
    unmarkComplete: (id: string) => void;
    addNote: (id: string, date: string, note: string, mood?: string) => void;

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
                    notes: {},
                    moods: {},
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

            archiveHabit: (id) => {
                set((state) => ({
                    habits: state.habits.map((h) =>
                        h.id === id ? { ...h, archived: true } : h
                    ),
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

            markComplete: (id, currentXP, note, mood) => {
                const today = TODAY();
                let xpEarned = 0;
                let newStreak = 0;

                set((state) => ({
                    habits: state.habits.map((h) => {
                        if (h.id !== id || h.completedDates.includes(today)) return h;
                        const newDates = [...h.completedDates, today];
                        const streak = calculateCurrentStreak(newDates);
                        const longestStreak = calculateLongestStreak(newDates);
                        xpEarned = h.xpReward;
                        newStreak = streak;
                        const newNotes = note
                            ? { ...(h.notes ?? {}), [today]: note }
                            : h.notes ?? {};
                        const newMoods = mood
                            ? { ...(h.moods ?? {}), [today]: mood }
                            : h.moods ?? {};
                        return { ...h, completedDates: newDates, streak, longestStreak, notes: newNotes, moods: newMoods };
                    }),
                }));

                // Compute level-up based on currentXP passed in
                const newXP = currentXP + xpEarned;
                const oldLevel = levelFromXP(currentXP);
                const newLevel = levelFromXP(newXP);
                const leveledUp = newLevel > oldLevel;

                return { xpEarned, newStreak, leveledUp, newLevel };
            },

            unmarkComplete: (id) => {
                const today = TODAY();
                set((state) => ({
                    habits: state.habits.map((h) => {
                        if (h.id !== id) return h;
                        const newDates = h.completedDates.filter((d) => d !== today);
                        const streak = calculateCurrentStreak(newDates);
                        const longestStreak = calculateLongestStreak(newDates);
                        const newNotes = { ...(h.notes ?? {}) };
                        delete newNotes[today];
                        return { ...h, completedDates: newDates, streak, longestStreak, notes: newNotes };
                    }),
                }));
            },

            addNote: (id, date, note, mood) => {
                set((state) => ({
                    habits: state.habits.map((h) => {
                        if (h.id !== id) return h;
                        const newNotes = note.trim()
                            ? { ...(h.notes ?? {}), [date]: note }
                            : { ...(h.notes ?? {}) };
                        if (!note.trim()) delete newNotes[date];
                        const newMoods = mood
                            ? { ...(h.moods ?? {}), [date]: mood }
                            : { ...(h.moods ?? {}) };
                        if (!mood) delete newMoods[date];
                        return { ...h, notes: newNotes, moods: newMoods };
                    }),
                }));
            },

            getTodayStats: () => {
                const today = TODAY();
                const habits = get().getTodayHabits();
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
                    if (h.archived) return false;
                    if (h.frequency === 'daily') return true;
                    if (h.frequency === 'weekly') return h.customDays?.includes(dayOfWeek) ?? dayOfWeek === 1;
                    if (h.frequency === 'custom') return h.customDays?.includes(dayOfWeek) ?? false;
                    return true;
                });
            },

            // Returns all non-archived habits (regardless of schedule)
            getActiveHabits: () => get().habits.filter((h) => !h.archived),
        }),
        {
            name: 'habit-store',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
