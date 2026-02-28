export type Frequency = 'daily' | 'weekly' | 'custom';
export type Category = 'Health' | 'Learning' | 'Fitness' | 'Mindset' | 'Work';

export interface Habit {
    id: string;
    title: string;
    description?: string;
    frequency: Frequency;
    customDays?: number[]; // 0=Sunday..6=Saturday
    completedDates: string[]; // ISO YYYY-MM-DD
    streak: number;
    longestStreak: number;
    xpReward: number;
    color: string;
    icon: string;
    category: Category;
    createdAt: string;
}

export interface TodayStats {
    total: number;
    completed: number;
    completionRate: number;
    totalXPEarned: number;
}
