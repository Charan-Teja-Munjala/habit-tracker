import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { useTheme } from '../hooks/useTheme';
import { useHabitStore } from '../store/habitStore';
import { ProgressRing } from '../components/ProgressRing';
import { StatsCard } from '../components/StatsCard';
import { CalendarHeatmap } from '../components/CalendarHeatmap';
import { getWeekDates, TODAY } from '../utils/dateUtils';
import { DAY_LABELS } from '../constants/habits';

interface Props { navigation: any; }

type TimeFilter = '7d' | '30d' | 'all';

export function AnalyticsScreen({ navigation }: Props) {
    const theme = useTheme();
    const { habits, getTodayStats } = useHabitStore();
    const stats = getTodayStats();
    const [timeFilter, setTimeFilter] = useState<TimeFilter>('7d');
    const [showAllHeatmaps, setShowAllHeatmaps] = useState(false);

    // Weekly bar data
    const weekDates = getWeekDates();
    const weeklyData = weekDates.map((date, i) => ({
        value: habits.filter((h) => h.completedDates.includes(date)).length,
        label: DAY_LABELS[i % 7],
        frontColor: habits.filter((h) => h.completedDates.includes(date)).length > 0
            ? theme.colors.primary
            : theme.colors.border,
        topLabelComponent: () => {
            const count = habits.filter((h) => h.completedDates.includes(date)).length;
            return count > 0 ? (
                <Text style={{ color: theme.colors.textSecondary, fontSize: 9, fontWeight: '600', marginBottom: 2 }}>
                    {count}
                </Text>
            ) : null;
        },
    }));

    // 30-day trend data
    const getLast30Days = () => {
        const days: string[] = [];
        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            days.push(d.toISOString().slice(0, 10));
        }
        return days;
    };
    const last30Days = getLast30Days();
    const trendData = last30Days.map((date, i) => ({
        value: habits.filter((h) => h.completedDates.includes(date)).length,
        label: i % 7 === 0 ? `W${Math.floor(i / 7) + 1}` : '',
        frontColor: theme.colors.secondary,
        dataPointColor: theme.colors.secondary,
    }));
    const maxTrend = Math.max(...trendData.map((d) => d.value), 1);

    // Best habit
    const bestHabit = [...habits].sort((a, b) => b.streak - a.streak)[0];

    // Total completions
    const totalCompletions = habits.reduce((s, h) => s + h.completedDates.length, 0);

    // Consistency score: today's date range
    const consistencyScore = habits.length
        ? Math.round(
            (habits.reduce((s, h) => {
                const days = Math.max(1, Math.round((Date.now() - new Date(h.createdAt).getTime()) / 86400000));
                return s + h.completedDates.length / days;
            }, 0) / habits.length) * 100
        )
        : 0;

    // Per-habit completion rate sorted by total completions
    const habitsByCompletion = [...habits].sort((a, b) => b.completedDates.length - a.completedDates.length);

    const maxCompletions = Math.max(...habits.map((h) => h.completedDates.length), 1);

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

            {/* Weekly bar chart using gifted-charts */}
            <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>📊 This Week</Text>
                {habits.length === 0 ? (
                    <Text style={[styles.emptyChartText, { color: theme.colors.textTertiary }]}>Add habits to see your weekly chart</Text>
                ) : (
                    <BarChart
                        data={weeklyData}
                        barWidth={28}
                        spacing={12}
                        roundedTop
                        roundedBottom
                        hideRules
                        xAxisThickness={0}
                        yAxisThickness={0}
                        yAxisTextStyle={{ color: theme.colors.textTertiary, fontSize: 10 }}
                        xAxisLabelTextStyle={{ color: theme.colors.textSecondary, fontSize: 11, fontWeight: '600' }}
                        noOfSections={4}
                        maxValue={Math.max(...weeklyData.map((d) => d.value), 4)}
                        barBorderRadius={6}
                        isAnimated
                        animationDuration={600}
                    />
                )}
            </View>

            {/* 30-day trend */}
            <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>📈 30-Day Trend</Text>
                {habits.length === 0 ? (
                    <Text style={[styles.emptyChartText, { color: theme.colors.textTertiary }]}>Add habits to see your trend</Text>
                ) : (
                    <BarChart
                        data={trendData}
                        barWidth={6}
                        spacing={3}
                        roundedTop
                        hideRules
                        xAxisThickness={0}
                        yAxisThickness={0}
                        yAxisTextStyle={{ color: theme.colors.textTertiary, fontSize: 10 }}
                        xAxisLabelTextStyle={{ color: theme.colors.textSecondary, fontSize: 9 }}
                        noOfSections={3}
                        maxValue={maxTrend}
                        barBorderRadius={3}
                        isAnimated
                        animationDuration={800}
                    />
                )}
            </View>

            {/* Per-habit bar comparison */}
            {habitsByCompletion.length > 0 && (
                <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                    <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>🏅 Habit Leaderboard</Text>
                    {habitsByCompletion.slice(0, 5).map((habit, idx) => (
                        <View key={habit.id} style={styles.leaderRow}>
                            <Text style={[styles.leaderRank, { color: theme.colors.textTertiary }]}>#{idx + 1}</Text>
                            <View style={[styles.leaderIcon, { backgroundColor: habit.color + '25' }]}>
                                <Text style={{ fontSize: 14 }}>{habit.icon.includes('outline') ? '⭐' : '⭐'}</Text>
                            </View>
                            <View style={styles.leaderContent}>
                                <View style={styles.leaderHeader}>
                                    <Text style={[styles.leaderName, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                                        {habit.title}
                                    </Text>
                                    <Text style={[styles.leaderCount, { color: habit.color }]}>
                                        {habit.completedDates.length}×
                                    </Text>
                                </View>
                                <View style={[styles.leaderTrack, { backgroundColor: theme.colors.border }]}>
                                    <View
                                        style={[
                                            styles.leaderFill,
                                            {
                                                backgroundColor: habit.color,
                                                width: `${(habit.completedDates.length / maxCompletions) * 100}%` as any,
                                            },
                                        ]}
                                    />
                                </View>
                            </View>
                        </View>
                    ))}
                </View>
            )}

            {/* Best habit */}
            {bestHabit && (
                <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                    <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>🏆 Best Streak Habit</Text>
                    <View style={styles.bestRow}>
                        <View style={[styles.bestIcon, { backgroundColor: bestHabit.color + '25' }]}>
                            <Text style={{ fontSize: 22 }}>🔥</Text>
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
            {habits.length > 0 && (
                <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                    <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>📅 Activity Maps</Text>
                    {(showAllHeatmaps ? habits : habits.slice(0, 3)).map((habit) => (
                        <View key={habit.id} style={styles.heatmapSection}>
                            <View style={styles.heatmapHeader}>
                                <View style={[styles.heatmapDot, { backgroundColor: habit.color }]} />
                                <Text style={[styles.heatmapTitle, { color: theme.colors.textPrimary }]}>
                                    {habit.title}
                                </Text>
                                <Text style={[styles.heatmapSub, { color: habit.color }]}>
                                    {habit.streak}d 🔥
                                </Text>
                            </View>
                            <CalendarHeatmap
                                completedDates={habit.completedDates}
                                accentColor={habit.color}
                                weeks={8}
                            />
                        </View>
                    ))}
                    {habits.length > 3 && (
                        <TouchableOpacity
                            onPress={() => setShowAllHeatmaps(!showAllHeatmaps)}
                            style={[styles.showMoreBtn, { borderColor: theme.colors.border }]}
                        >
                            <Text style={[styles.showMoreText, { color: theme.colors.primary }]}>
                                {showAllHeatmaps ? 'Show less' : `Show all ${habits.length} habits`}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 16 },
    pageTitle: { fontSize: 28, fontWeight: '800', marginBottom: 16, marginTop: 8, letterSpacing: -0.5 },
    card: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 12 },
    cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 14 },
    emptyChartText: { fontSize: 13, textAlign: 'center', paddingVertical: 20 },
    overviewRow: { flexDirection: 'row', alignItems: 'center', gap: 24 },
    overviewDetails: { flex: 1 },
    overviewValue: { fontSize: 26, fontWeight: '800' },
    overviewLabel: { fontSize: 11, fontWeight: '500', marginBottom: 8 },
    divider: { height: 1, backgroundColor: '#2A3150', marginVertical: 8 },
    statsRow: { flexDirection: 'row', marginBottom: 12 },

    leaderRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
    leaderRank: { width: 20, fontSize: 12, fontWeight: '700', textAlign: 'center' },
    leaderIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    leaderContent: { flex: 1 },
    leaderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
    leaderName: { fontSize: 13, fontWeight: '600', flex: 1, marginRight: 8 },
    leaderCount: { fontSize: 12, fontWeight: '700' },
    leaderTrack: { height: 6, borderRadius: 99, overflow: 'hidden' },
    leaderFill: { height: '100%', borderRadius: 99 },

    bestRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    bestIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    bestTitle: { fontSize: 15, fontWeight: '700' },
    bestSub: { fontSize: 12, fontWeight: '500', marginTop: 2 },

    heatmapSection: { marginBottom: 16 },
    heatmapHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
    heatmapDot: { width: 8, height: 8, borderRadius: 4 },
    heatmapTitle: { flex: 1, fontSize: 13, fontWeight: '600' },
    heatmapSub: { fontSize: 12, fontWeight: '700' },
    showMoreBtn: { alignItems: 'center', paddingVertical: 10, borderTopWidth: 1, marginTop: 4 },
    showMoreText: { fontSize: 13, fontWeight: '600' },
});
