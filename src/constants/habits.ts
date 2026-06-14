import { Category } from '../types';
import { Achievement } from '../types/user.types';

export const CATEGORIES: { id: Category; label: string; icon: string; color: string }[] = [
    { id: 'Health', label: 'Health', icon: 'heart', color: '#FF6584' },
    { id: 'Fitness', label: 'Fitness', icon: 'barbell', color: '#4ECDC4' },
    { id: 'Learning', label: 'Learning', icon: 'book', color: '#6C63FF' },
    { id: 'Mindset', label: 'Mindset', icon: 'leaf', color: '#FFE66D' },
    { id: 'Work', label: 'Work', icon: 'briefcase', color: '#74B9FF' },
    { id: 'Creative', label: 'Creative', icon: 'brush', color: '#FD79A8' },
    { id: 'Social', label: 'Social', icon: 'people', color: '#55EFC4' },
    { id: 'Finance', label: 'Finance', icon: 'cash', color: '#FDCB6E' },
];

export const HABIT_COLORS = [
    '#6C63FF', '#FF6584', '#4ECDC4', '#FFE66D', '#74B9FF',
    '#FF7675', '#A29BFE', '#55EFC4', '#FDCB6E', '#81ECEC',
    '#FD79A8', '#00CEC9', '#E17055', '#0984E3', '#6AB04C',
    '#EB4D4B', '#F9CA24', '#B8E994', '#786FA6', '#F8EFBA',
];

export const HABIT_ICONS = [
    'heart', 'fitness', 'book-outline', 'leaf-outline', 'briefcase-outline',
    'water-outline', 'moon-outline', 'sunny-outline', 'bicycle-outline', 'walk-outline',
    'musical-notes-outline', 'brush-outline', 'code-slash-outline', 'cafe-outline', 'bed-outline',
    'barbell-outline', 'nutrition-outline', 'medal-outline', 'trophy-outline', 'star-outline',
    'flame-outline', 'battery-charging-outline', 'headset-outline', 'camera-outline',
    'people-outline', 'cash-outline', 'school-outline', 'rocket-outline', 'diamond-outline',
    'shield-outline', 'thunderstorm-outline', 'planet-outline', 'color-palette-outline', 'pencil-outline',
];

export const XP_THRESHOLDS = [0, 100, 250, 500, 900, 1400, 2000, 2800, 3800, 5000, 6500, 8500, 11000];
export const LEVEL_TITLES = [
    'Beginner', 'Apprentice', 'Achiever', 'Striver', 'Performer',
    'Champion', 'Elite', 'Expert', 'Master', 'Legend', 'Apex', 'Titan', 'Mythic',
];

export const ACHIEVEMENTS: Achievement[] = [
    {
        id: 'first_habit',
        title: 'First Step',
        description: 'Create your first habit',
        icon: 'star',
        color: '#FFE66D',
        xpReward: 50,
        condition: { type: 'total_habits', value: 1 },
    },
    {
        id: 'streak_3',
        title: 'On a Roll',
        description: 'Maintain a 3-day streak',
        icon: 'flame',
        color: '#FF6584',
        xpReward: 75,
        condition: { type: 'streak', value: 3 },
    },
    {
        id: 'streak_7',
        title: 'Week Warrior',
        description: 'Maintain a 7-day streak',
        icon: 'trophy',
        color: '#6C63FF',
        xpReward: 150,
        condition: { type: 'streak', value: 7 },
    },
    {
        id: 'streak_14',
        title: 'Fortnight Force',
        description: '14-day streak — unstoppable!',
        icon: 'shield',
        color: '#74B9FF',
        xpReward: 300,
        condition: { type: 'streak', value: 14 },
    },
    {
        id: 'streak_30',
        title: 'Monthly Legend',
        description: '30-day streak achieved',
        icon: 'medal',
        color: '#4ECDC4',
        xpReward: 500,
        condition: { type: 'streak', value: 30 },
    },
    {
        id: 'streak_100',
        title: 'Centurion Streak',
        description: '100 consecutive days!',
        icon: 'planet',
        color: '#A29BFE',
        xpReward: 1000,
        condition: { type: 'streak', value: 100 },
    },
    {
        id: 'completions_10',
        title: 'Getting Started',
        description: 'Complete 10 habits total',
        icon: 'checkmark-circle',
        color: '#74B9FF',
        xpReward: 100,
        condition: { type: 'total_completions', value: 10 },
    },
    {
        id: 'completions_50',
        title: 'Half Century',
        description: 'Complete 50 habits total',
        icon: 'ribbon',
        color: '#A29BFE',
        xpReward: 200,
        condition: { type: 'total_completions', value: 50 },
    },
    {
        id: 'completions_100',
        title: 'Centurion',
        description: 'Complete 100 habits total',
        icon: 'shield',
        color: '#FDCB6E',
        xpReward: 400,
        condition: { type: 'total_completions', value: 100 },
    },
    {
        id: 'completions_500',
        title: 'Habit Machine',
        description: '500 total completions',
        icon: 'rocket',
        color: '#FF6584',
        xpReward: 750,
        condition: { type: 'total_completions', value: 500 },
    },
    {
        id: 'level_5',
        title: 'Rising Star',
        description: 'Reach level 5',
        icon: 'rocket',
        color: '#6C63FF',
        xpReward: 200,
        condition: { type: 'level', value: 5 },
    },
    {
        id: 'level_10',
        title: 'Elite Achiever',
        description: 'Reach level 10',
        icon: 'diamond',
        color: '#FFE66D',
        xpReward: 500,
        condition: { type: 'level', value: 10 },
    },
    {
        id: 'habits_5',
        title: 'Habit Collector',
        description: 'Create 5 habits',
        icon: 'apps',
        color: '#55EFC4',
        xpReward: 100,
        condition: { type: 'total_habits', value: 5 },
    },
    {
        id: 'habits_10',
        title: 'Habit Master',
        description: 'Create 10 habits',
        icon: 'grid',
        color: '#FD79A8',
        xpReward: 200,
        condition: { type: 'total_habits', value: 10 },
    },
];

export const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const DAY_LABELS_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
export const MONTH_LABELS = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];
