import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../hooks/useTheme';
import { useHabitStore } from '../store/habitStore';
import { useUserStore } from '../store/userStore';
import { ProgressRing } from '../components/ProgressRing';
import { StreakCounter } from '../components/StreakCounter';
import { CalendarHeatmap } from '../components/CalendarHeatmap';
import { AnimatedButton } from '../components/AnimatedButton';
import { LevelUpModal } from '../components/LevelUpModal';
import { AchievementToast } from '../components/AchievementToast';
import { isStreakAtRisk } from '../utils/streakUtils';
import { formatDate } from '../utils/dateUtils';
import { TODAY } from '../utils/dateUtils';
import { ACHIEVEMENTS } from '../constants/habits';
import { getLevelTitle } from '../utils/xpUtils';
import { useHaptics } from '../hooks/useHaptics';

interface Props {
    navigation: any;
    route: { params: { habitId: string } };
}

export function HabitDetailScreen({ navigation, route }: Props) {
    const theme = useTheme();
    const haptics = useHaptics();
    const { getHabitById, deleteHabit, markComplete, unmarkComplete, getActiveHabits } = useHabitStore();
    const addXP = useUserStore((s) => s.addXP);
    const profile = useUserStore((s) => s.profile);
    const checkAchievements = useUserStore((s) => s.checkAchievements);

    const [levelUpData, setLevelUpData] = useState<{ level: number; title: string } | null>(null);
    const [unlockedId, setUnlockedId] = useState<string | null>(null);

    const habit = getHabitById(route.params.habitId);

    if (!habit) {
        navigation.goBack();
        return null;
    }

    const today = TODAY();
    const isCompletedToday = habit.completedDates.includes(today);

    const completionRate = habit.completedDates.length > 0
        ? Math.min(1, habit.completedDates.length / Math.max(1, Math.round((Date.now() - new Date(habit.createdAt).getTime()) / 86400000)))
        : 0;

    const atRisk = isStreakAtRisk(habit.completedDates);

    const handleToggleComplete = () => {
        if (isCompletedToday) {
            unmarkComplete(habit.id);
            haptics.light();
            return;
        }
        haptics.success();
        const result = markComplete(habit.id, profile.totalXP);
        const { newLevel, didLevelUp } = addXP(result.xpEarned);

        if (didLevelUp) {
            setLevelUpData({ level: newLevel, title: getLevelTitle(newLevel) });
        }

        // Achievement check
        const allHabits = getActiveHabits();
        const totalCompletions = allHabits.reduce((s, h) => s + h.completedDates.length, 0);
        const maxStreak = Math.max(...allHabits.map((h) => h.longestStreak), result.newStreak);
        const newlyUnlocked = checkAchievements(totalCompletions, maxStreak, allHabits.length);
        if (newlyUnlocked.length > 0) setUnlockedId(newlyUnlocked[0]);
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Habit',
            `Delete "${habit.title}"? This cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => { deleteHabit(habit.id); navigation.goBack(); },
                },
            ]
        );
    };

    // Recent notes — last 5 days that have notes
    const recentNotes = Object.entries(habit.notes ?? {})
        .sort(([a], [b]) => b.localeCompare(a))
        .slice(0, 5);

    const unlockedAchievement = unlockedId ? ACHIEVEMENTS.find((a) => a.id === unlockedId) : null;

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header hero */}
                <View style={[styles.heroCard, { backgroundColor: habit.color + '18', borderColor: habit.color + '40' }]}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={22} color={theme.colors.textPrimary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.editBtn}
                        onPress={() => navigation.navigate('AddHabit', { habitId: habit.id })}
                    >
                        <Ionicons name="pencil-outline" size={20} color={habit.color} />
                    </TouchableOpacity>
                    <View style={[styles.heroIcon, { backgroundColor: habit.color + '25' }]}>
                        <Ionicons name={habit.icon as any} size={42} color={habit.color} />
                    </View>
                    <Text style={[styles.heroTitle, { color: theme.colors.textPrimary }]}>{habit.title}</Text>
                    {habit.description ? (
                        <Text style={[styles.heroDesc, { color: theme.colors.textSecondary }]}>{habit.description}</Text>
                    ) : null}
                    <View style={styles.heroMeta}>
                        <View style={[styles.badge, { backgroundColor: habit.color + '25' }]}>
                            <Text style={[styles.badgeText, { color: habit.color }]}>{habit.category}</Text>
                        </View>
                        <View style={[styles.badge, { backgroundColor: theme.colors.primary + '20' }]}>
                            <Text style={[styles.badgeText, { color: theme.colors.primary }]}>{habit.frequency}</Text>
                        </View>
                        <View style={[styles.badge, { backgroundColor: theme.colors.warning + '20' }]}>
                            <Text style={[styles.badgeText, { color: theme.colors.warning }]}>+{habit.xpReward} XP</Text>
                        </View>
                        {habit.reminderTime && (
                            <View style={[styles.badge, { backgroundColor: theme.colors.info + '20' }]}>
                                <Ionicons name="alarm-outline" size={11} color={theme.colors.info} />
                                <Text style={[styles.badgeText, { color: theme.colors.info }]}>
                                    {' '}{habit.reminderTime.hour}:00
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Mark complete button */}
                <View style={styles.completeSection}>
                    <TouchableOpacity
                        onPress={handleToggleComplete}
                        activeOpacity={0.85}
                        style={[
                            styles.completeBtn,
                            { borderColor: isCompletedToday ? habit.color + '60' : habit.color, overflow: 'hidden' },
                        ]}
                    >
                        {isCompletedToday ? (
                            <>
                                <View style={[StyleSheet.absoluteFillObject, { backgroundColor: habit.color + '15' }]} />
                                <Ionicons name="checkmark-circle" size={22} color={habit.color} />
                                <Text style={[styles.completeBtnText, { color: habit.color }]}>Completed Today ✓</Text>
                                <Text style={[styles.completeBtnSub, { color: theme.colors.textTertiary }]}>Tap to undo</Text>
                            </>
                        ) : (
                            <>
                                <LinearGradient
                                    colors={[habit.color, habit.color + 'BB']}
                                    style={StyleSheet.absoluteFillObject}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                />
                                <Ionicons name="checkmark-circle-outline" size={22} color="#fff" />
                                <Text style={[styles.completeBtnText, { color: '#fff' }]}>Mark Complete</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Stats row */}
                <View style={styles.statsRow}>
                    <View style={[styles.statCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                        <StreakCounter streak={habit.streak} atRisk={atRisk} size="lg" />
                        <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Current Streak</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                        <Text style={[styles.statVal, { color: theme.colors.textPrimary }]}>{habit.longestStreak}</Text>
                        <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Best Streak</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                        <ProgressRing
                            progress={completionRate}
                            size={60}
                            strokeWidth={6}
                            label={`${Math.round(completionRate * 100)}%`}
                            gradientColors={[habit.color, habit.color + 'AA']}
                        />
                        <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Rate</Text>
                    </View>
                </View>

                {/* Heatmap */}
                <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Activity</Text>
                    <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
                        {habit.completedDates.length} total completions
                    </Text>
                    <View style={{ marginTop: 12 }}>
                        <CalendarHeatmap completedDates={habit.completedDates} accentColor={habit.color} weeks={12} />
                    </View>
                </View>

                {/* Notes */}
                {recentNotes.length > 0 && (
                    <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>📝 Recent Notes</Text>
                        {recentNotes.map(([date, note]) => (
                            <View key={date} style={[styles.noteRow, { borderBottomColor: theme.colors.border }]}>
                                <Text style={[styles.noteDate, { color: theme.colors.textTertiary }]}>{formatDate(date)}</Text>
                                <Text style={[styles.noteContent, { color: theme.colors.textPrimary }]}>{note}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Info */}
                <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Details</Text>
                    <View style={styles.infoRow}>
                        <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Created</Text>
                        <Text style={[styles.infoValue, { color: theme.colors.textPrimary }]}>{formatDate(habit.createdAt.slice(0, 10))}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Frequency</Text>
                        <Text style={[styles.infoValue, { color: theme.colors.textPrimary }]}>
                            {habit.frequency === 'custom' && habit.customDays
                                ? `Custom (${habit.customDays.length} days/wk)`
                                : habit.frequency}
                        </Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>XP Reward</Text>
                        <Text style={[styles.infoValue, { color: theme.colors.primary }]}>+{habit.xpReward} per completion</Text>
                    </View>
                    {habit.reminderTime && (
                        <View style={styles.infoRow}>
                            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Reminder</Text>
                            <Text style={[styles.infoValue, { color: theme.colors.info }]}>
                                Daily at {habit.reminderTime.hour}:00
                            </Text>
                        </View>
                    )}
                </View>

                {/* Delete */}
                <View style={styles.actions}>
                    <AnimatedButton
                        title="Delete Habit"
                        onPress={handleDelete}
                        variant="outline"
                        style={{ flex: 1, borderColor: theme.colors.error }}
                        textStyle={{ color: theme.colors.error }}
                    />
                </View>
                <View style={{ height: 40 }} />
            </ScrollView>

            {levelUpData && (
                <LevelUpModal
                    level={levelUpData.level}
                    levelTitle={levelUpData.title}
                    onClose={() => setLevelUpData(null)}
                />
            )}
            {unlockedAchievement && (
                <AchievementToast
                    title={unlockedAchievement.title}
                    description={unlockedAchievement.description}
                    icon={unlockedAchievement.icon}
                    color={unlockedAchievement.color}
                    onDone={() => setUnlockedId(null)}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    heroCard: { margin: 16, borderRadius: 24, borderWidth: 1, padding: 24, alignItems: 'center' },
    backBtn: { position: 'absolute', top: 16, left: 16 },
    editBtn: { position: 'absolute', top: 16, right: 16 },
    heroIcon: { width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginTop: 12, marginBottom: 16 },
    heroTitle: { fontSize: 24, fontWeight: '800', textAlign: 'center' },
    heroDesc: { fontSize: 14, textAlign: 'center', marginTop: 6, lineHeight: 20 },
    heroMeta: { flexDirection: 'row', gap: 8, marginTop: 16, flexWrap: 'wrap', justifyContent: 'center' },
    badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 99 },
    badgeText: { fontSize: 12, fontWeight: '700' },

    completeSection: { paddingHorizontal: 16, marginBottom: 12 },
    completeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 16,
        borderRadius: 16,
        borderWidth: 1.5,
    },
    completeBtnText: { fontSize: 16, fontWeight: '700' },
    completeBtnSub: { fontSize: 11, marginLeft: -4 },

    statsRow: { flexDirection: 'row', paddingHorizontal: 12, gap: 8, marginBottom: 12 },
    statCard: { flex: 1, borderRadius: 16, borderWidth: 1, padding: 14, alignItems: 'center', gap: 6 },
    statVal: { fontSize: 26, fontWeight: '800' },
    statLabel: { fontSize: 11, fontWeight: '500', textAlign: 'center' },

    section: { marginHorizontal: 16, marginBottom: 12, borderRadius: 16, borderWidth: 1, padding: 16 },
    sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
    metaText: { fontSize: 12, fontWeight: '500' },
    infoRow: {
        flexDirection: 'row', justifyContent: 'space-between',
        paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#2A3150',
    },
    infoLabel: { fontSize: 14, fontWeight: '500' },
    infoValue: { fontSize: 14, fontWeight: '600' },

    noteRow: { paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth },
    noteDate: { fontSize: 11, fontWeight: '600', marginBottom: 4 },
    noteContent: { fontSize: 13, lineHeight: 20 },

    actions: { flexDirection: 'row', paddingHorizontal: 16, marginTop: 4 },
});
