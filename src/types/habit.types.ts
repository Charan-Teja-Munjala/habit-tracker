export type Frequency = 'daily' | 'weekly' | 'custom';
export type Category = 'Health' | 'Learning' | 'Fitness' | 'Mindset' | 'Work' | 'Creative' | 'Social' | 'Finance';

export interface Habit {
    id: string;
    title: string;
    description?: string;
    frequency: Frequency;
    customDays?: number[]; // 0=Sunday..6=Saturday
    completedDates: string[]; // ISO YYYY-MM-DD
    notes?: Record<string, string>; // date → note text
    moods?: Record<string, string>; // date → mood emoji
    streak: number;
    longestStreak: number;
    xpReward: number;
    color: string;
    icon: string;
    category: Category;
    createdAt: string;
    reminderTime?: { hour: number; minute: number } | null; // per-habit reminder
    archived?: boolean;
}

export interface TodayStats {
    total: number;
    completed: number;
    completionRate: number;
    totalXPEarned: number;
}
