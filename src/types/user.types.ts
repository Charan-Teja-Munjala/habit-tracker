export interface UserProfile {
    id: string;
    name: string;
    totalXP: number;
    level: number;
    achievements: string[];
    streakFreeze: number;
    joinedAt: string;
}

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    color: string;
    xpReward: number;
    condition: {
        type: 'streak' | 'total_habits' | 'total_completions' | 'level' | 'category_completions';
        value: number;
        category?: string;
    };
    unlockedAt?: string;
}
