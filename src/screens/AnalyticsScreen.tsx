import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { useHabitStore } from '../store/habitStore';
import { ProgressRing } from '../components/ProgressRing';
import { StatsCard } from '../components/StatsCard';
import { CalendarHeatmap } from '../components/CalendarHeatmap';
import { getWeekDates, TODAY } from '../utils/dateUtils';
import { DAY_LABELS } from '../constants/habits';

interface Props { navigation: any; }

export function AnalyticsScreen({ navigation }: Props) {
    const theme = useTheme();
    const { habits, getTodayStats } = useHabitStore();
    const stats = getTodayStats();

    // Weekly bar data
    const weekDates = getWeekDates();
    const weeklyData = weekDates.map((date, i) => ({
        day: DAY_LABELS[i % 7],
        count: habits.filter((h) => h.completedDates.includes(date)).length,
    }));
    const maxWeekly = Math.max(...weeklyData.map((w) => w.count), 1);

    // Best habit
    const bestHabit = [...habits].sort((a, b) => b.streak - a.streak)[0];

    // Total completions
    const totalCompletions = habits.reduce((s, h) => s + h.completedDates.length, 0);

    // Consistency score = avg completion rate across all habits
    const consistencyScore = habits.length
        ? Math.round(
            (habits.reduce((s, h) => {
                const days = Math.max(1, Math.round((Date.now() - new Date(h.createdAt).getTime()) / 86400000));
                return s + h.completedDates.length / days;
            }, 0) / habits.length) * 100
        )
        : 0;

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            <Text style={[styles.pageTitle, { color: theme.colors.textPrimary }]}>Analytics</Text>

            {/* Overview ring */}
            <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <View style={styles.overviewRow}>
                    <ProgressRing
                        progress={stats.completionRate}
                        size={110}
                        strokeWidth={10}
                        label={`${Math.round(stats.completionRate * 100)}%`}
                        sublabel="Today"
                        gradientColors={theme.colors.gradientPrimary}
                    />
                    <View style={styles.overviewDetails}>
                        <Text style={[styles.overviewValue, { color: theme.colors.textPrimary }]}>
                            {totalCompletions}
                        </Text>
                        <Text style={[styles.overviewLabel, { color: theme.colors.textSecondary }]}>
                            Total Completions
                        </Text>
                        <View style={styles.divider} />
                        <Text style={[styles.overviewValue, { color: theme.colors.success }]}>
                            {consistencyScore}%
                        </Text>
                        <Text style={[styles.overviewLabel, { color: theme.colors.textSecondary }]}>
                            Consistency Score
                        </Text>
                    </View>
                </View>
            </View>

            {/* Stats row */}
            <View style={styles.statsRow}>
                <StatsCard
                    title="Total Habits"
                    value={habits.length}
                    icon="list"
                    iconColor={theme.colors.primary}
                    style={{ marginRight: 8, flex: 1 }}
                />
                <StatsCard
                    title="Best Streak"
                    value={bestHabit?.longestStreak ?? 0}
                    icon="flame"
                    iconColor={theme.colors.secondary}
                    style={{ flex: 1 }}
                />
            </View>

            {/* Weekly chart */}
            <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>This Week</Text>
                <View style={styles.barChart}>
                    {weeklyData.map((item) => (
                        <View key={item.day} style={styles.barCol}>
                            <View style={styles.barContainer}>
                                <View
                                    style={[
                                        styles.bar,
                                        {
                                            height: Math.max(4, (item.count / maxWeekly) * 80),
                                            backgroundColor: item.count > 0 ? theme.colors.primary : theme.colors.border,
                                        },
                                    ]}
                                />
                            </View>
                            <Text style={[styles.barLabel, { color: theme.colors.textSecondary }]}>
                                {item.day}
                            </Text>
                            <Text style={[styles.barValue, { color: theme.colors.textPrimary }]}>
                                {item.count}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Best habit */}
            {bestHabit && (
                <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                    <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>🏆 Best Habit</Text>
                    <View style={styles.bestRow}>
                        <View style={[styles.bestIcon, { backgroundColor: bestHabit.color + '25' }]}>
                            <Text style={{ fontSize: 24 }}></Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.bestTitle, { color: theme.colors.textPrimary }]}>
                                {bestHabit.title}
                            </Text>
                            <Text style={[styles.bestSub, { color: theme.colors.textSecondary }]}>
                                {bestHabit.streak} day streak · {bestHabit.completedDates.length} completions
                            </Text>
                        </View>
                    </View>
                </View>
            )}

            {/* Per-habit heatmaps */}
            {habits.slice(0, 5).map((habit) => (
                <View key={habit.id} style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                    <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>
                        {habit.title}
                    </Text>
                    <CalendarHeatmap
                        completedDates={habit.completedDates}
                        accentColor={habit.color}
                        weeks={8}
                    />
                </View>
            ))}

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 16 },
    pageTitle: { fontSize: 28, fontWeight: '800', marginBottom: 16, marginTop: 8, letterSpacing: -0.5 },
    card: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 12 },
    cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
    overviewRow: { flexDirection: 'row', alignItems: 'center', gap: 24 },
    overviewDetails: { flex: 1 },
    overviewValue: { fontSize: 26, fontWeight: '800' },
    overviewLabel: { fontSize: 11, fontWeight: '500', marginBottom: 8 },
    divider: { height: 1, backgroundColor: '#2A3150', marginVertical: 8 },
    statsRow: { flexDirection: 'row', marginBottom: 12 },
    barChart: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 120 },
    barCol: { flex: 1, alignItems: 'center' },
    barContainer: { height: 80, justifyContent: 'flex-end', width: '100%', alignItems: 'center' },
    bar: { width: 20, borderRadius: 6 },
    barLabel: { fontSize: 10, fontWeight: '500', marginTop: 4 },
    barValue: { fontSize: 11, fontWeight: '700' },
    bestRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    bestIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    bestTitle: { fontSize: 15, fontWeight: '700' },
    bestSub: { fontSize: 12, fontWeight: '500', marginTop: 2 },
});
