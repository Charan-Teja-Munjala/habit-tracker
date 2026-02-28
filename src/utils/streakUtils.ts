import { differenceInCalendarDays, parseISO } from 'date-fns';
import { TODAY } from './dateUtils';

/**
 * Calculate current streak from an array of completed ISO date strings.
 * Streak is consecutive days ending today or yesterday.
 */
export const calculateCurrentStreak = (completedDates: string[]): number => {
    if (!completedDates.length) return 0;
    const sorted = [...completedDates].sort().reverse();
    const today = TODAY();
    let streak = 0;
    let expectedDate = today;

    for (const date of sorted) {
        const diff = differenceInCalendarDays(parseISO(expectedDate), parseISO(date));
        if (diff === 0) {
            streak++;
            const d = new Date(expectedDate);
            d.setDate(d.getDate() - 1);
            expectedDate = d.toISOString().slice(0, 10);
        } else if (diff === 1 && streak === 0) {
            // Allow yesterday as start of streak
            streak++;
            const d = new Date(date);
            d.setDate(d.getDate() - 1);
            expectedDate = d.toISOString().slice(0, 10);
        } else {
            break;
        }
    }
    return streak;
};

export const calculateLongestStreak = (completedDates: string[]): number => {
    if (!completedDates.length) return 0;
    const sorted = [...new Set(completedDates)].sort();
    let longest = 1;
    let current = 1;

    for (let i = 1; i < sorted.length; i++) {
        const diff = differenceInCalendarDays(parseISO(sorted[i]), parseISO(sorted[i - 1]));
        if (diff === 1) {
            current++;
            longest = Math.max(longest, current);
        } else {
            current = 1;
        }
    }
    return longest;
};

export const isStreakAtRisk = (completedDates: string[]): boolean => {
    if (!completedDates.length) return false;
    const today = TODAY();
    const isCompletedToday = completedDates.includes(today);
    const streak = calculateCurrentStreak(completedDates);
    return !isCompletedToday && streak > 0;
};
