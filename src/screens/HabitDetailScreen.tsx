import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useHabitStore } from '../store/habitStore';
import { ProgressRing } from '../components/ProgressRing';
import { StreakCounter } from '../components/StreakCounter';
import { CalendarHeatmap } from '../components/CalendarHeatmap';
import { AnimatedButton } from '../components/AnimatedButton';
import { isStreakAtRisk } from '../utils/streakUtils';
import { formatDate } from '../utils/dateUtils';

interface Props {
    navigation: any;
    route: { params: { habitId: string } };
}

export function HabitDetailScreen({ navigation, route }: Props) {
    const theme = useTheme();
    const { getHabitById, deleteHabit } = useHabitStore();
    const habit = getHabitById(route.params.habitId);

    if (!habit) {
        navigation.goBack();
        return null;
    }

    const completionRate = habit.completedDates.length > 0
        ? Math.min(1, habit.completedDates.length / Math.max(1, Math.round((Date.now() - new Date(habit.createdAt).getTime()) / 86400000)))
        : 0;

    const atRisk = isStreakAtRisk(habit.completedDates);

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

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            showsVerticalScrollIndicator={false}
        >
            {/* Header */}
            <View style={[styles.heroCard, { backgroundColor: habit.color + '18', borderColor: habit.color + '40' }]}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={22} color={theme.colors.textPrimary} />
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
                </View>
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

            {/* Info */}
            <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Details</Text>
                <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Created</Text>
                    <Text style={[styles.infoValue, { color: theme.colors.textPrimary }]}>{formatDate(habit.createdAt.slice(0, 10))}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Frequency</Text>
                    <Text style={[styles.infoValue, { color: theme.colors.textPrimary }]}>{habit.frequency}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>XP Reward</Text>
                    <Text style={[styles.infoValue, { color: theme.colors.primary }]}>+{habit.xpReward} per completion</Text>
                </View>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
                <AnimatedButton
                    title="Edit Habit"
                    onPress={() => navigation.navigate('AddHabit', { habitId: habit.id })}
                    variant="secondary"
                    style={{ flex: 1, marginRight: 8 }}
                />
                <AnimatedButton
                    title="Delete"
                    onPress={handleDelete}
                    variant="outline"
                    style={{ flex: 1, borderColor: theme.colors.error }}
                    textStyle={{ color: theme.colors.error }}
                />
            </View>
            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    heroCard: { margin: 16, borderRadius: 24, borderWidth: 1, padding: 24, alignItems: 'center' },
    backBtn: { position: 'absolute', top: 16, left: 16 },
    heroIcon: { width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginTop: 12, marginBottom: 16 },
    heroTitle: { fontSize: 24, fontWeight: '800', textAlign: 'center' },
    heroDesc: { fontSize: 14, textAlign: 'center', marginTop: 6, lineHeight: 20 },
    heroMeta: { flexDirection: 'row', gap: 8, marginTop: 16, flexWrap: 'wrap', justifyContent: 'center' },
    badge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 99 },
    badgeText: { fontSize: 12, fontWeight: '700' },
    statsRow: { flexDirection: 'row', paddingHorizontal: 12, gap: 8, marginBottom: 12 },
    statCard: { flex: 1, borderRadius: 16, borderWidth: 1, padding: 14, alignItems: 'center', gap: 6 },
    statVal: { fontSize: 26, fontWeight: '800' },
    statLabel: { fontSize: 11, fontWeight: '500', textAlign: 'center' },
    section: { marginHorizontal: 16, marginBottom: 12, borderRadius: 16, borderWidth: 1, padding: 16 },
    sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
    metaText: { fontSize: 12, fontWeight: '500' },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#2A3150' },
    infoLabel: { fontSize: 14, fontWeight: '500' },
    infoValue: { fontSize: 14, fontWeight: '600' },
    actions: { flexDirection: 'row', paddingHorizontal: 16, marginTop: 4 },
});
