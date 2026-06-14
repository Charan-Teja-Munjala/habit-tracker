import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../hooks/useTheme';
import { useUserStore } from '../store/userStore';
import { useHabitStore } from '../store/habitStore';
import { ACHIEVEMENTS } from '../constants/habits';
import { Achievement } from '../types';

interface Props { navigation: any; }

type Filter = 'all' | 'unlocked' | 'locked';

export function AchievementsScreen({ navigation }: Props) {
    const theme = useTheme();
    const profile = useUserStore((s) => s.profile);
    const { habits } = useHabitStore();
    const [filter, setFilter] = useState<Filter>('all');

    const maxStreak = Math.max(...habits.map((h) => h.longestStreak), 0);
    const totalCompletions = habits.reduce((s, h) => s + h.completedDates.length, 0);

    const getProgress = (a: Achievement): number => {
        switch (a.condition.type) {
            case 'streak': return Math.min(1, maxStreak / a.condition.value);
            case 'total_completions': return Math.min(1, totalCompletions / a.condition.value);
            case 'total_habits': return Math.min(1, habits.length / a.condition.value);
            case 'level': return Math.min(1, profile.level / a.condition.value);
            default: return 0;
        }
    };

    const filtered = ACHIEVEMENTS.filter((a) => {
        const unlocked = profile.achievements.includes(a.id);
        if (filter === 'unlocked') return unlocked;
        if (filter === 'locked') return !unlocked;
        return true;
    });

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            <Text style={[styles.pageTitle, { color: theme.colors.textPrimary }]}>Achievements</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                {profile.achievements.length}/{ACHIEVEMENTS.length} unlocked
            </Text>

            {/* Filter */}
            <View style={styles.filterRow}>
                {(['all', 'unlocked', 'locked'] as Filter[]).map((f) => (
                    <TouchableOpacity
                        key={f}
                        onPress={() => setFilter(f)}
                        style={[
                            styles.filterBtn,
                            {
                                backgroundColor: filter === f ? theme.colors.primary : theme.colors.card,
                                borderColor: filter === f ? theme.colors.primary : theme.colors.border,
                            },
                        ]}
                    >
                        <Text style={[styles.filterText, { color: filter === f ? '#fff' : theme.colors.textSecondary }]}>
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Grid */}
            <View style={styles.grid}>
                {filtered.map((achievement) => {
                    const unlocked = profile.achievements.includes(achievement.id);
                    const progress = getProgress(achievement);
                    const scaleAnim = useRef(new Animated.Value(unlocked ? 1 : 0.97)).current;

                    return (
                        <Animated.View
                            key={achievement.id}
                            style={[
                                styles.badge,
                                {
                                    backgroundColor: theme.colors.card,
                                    borderColor: unlocked ? achievement.color + '60' : theme.colors.border,
                                    opacity: unlocked ? 1 : 0.65,
                                    transform: [{ scale: scaleAnim }],
                                },
                            ]}
                        >
                            {unlocked && (
                                <LinearGradient
                                    colors={[achievement.color + '20', 'transparent']}
                                    style={StyleSheet.absoluteFillObject}
                                />
                            )}
                            {/* Badge icon */}
                            <View
                                style={[
                                    styles.badgeIconWrap,
                                    {
                                        backgroundColor: unlocked ? achievement.color + '20' : theme.colors.border + '40',
                                    },
                                ]}
                            >
                                <Ionicons
                                    name={achievement.icon as any}
                                    size={26}
                                    color={unlocked ? achievement.color : theme.colors.textTertiary}
                                />
                            </View>

                            <Text
                                style={[
                                    styles.badgeTitle,
                                    { color: unlocked ? theme.colors.textPrimary : theme.colors.textTertiary },
                                ]}
                                numberOfLines={1}
                            >
                                {achievement.title}
                            </Text>
                            <Text
                                style={[styles.badgeDesc, { color: theme.colors.textSecondary }]}
                                numberOfLines={2}
                            >
                                {achievement.description}
                            </Text>

                            {/* Progress bar */}
                            {!unlocked && (
                                <View style={[styles.progressTrack, { backgroundColor: theme.colors.border }]}>
                                    <View
                                        style={[
                                            styles.progressFill,
                                            { backgroundColor: achievement.color, width: `${progress * 100}%` as any },
                                        ]}
                                    />
                                </View>
                            )}

                            {/* XP reward */}
                            <View style={[styles.xpPill, { backgroundColor: unlocked ? achievement.color + '25' : theme.colors.border + '60' }]}>
                                <Text style={[styles.xpText, { color: unlocked ? achievement.color : theme.colors.textTertiary }]}>
                                    +{achievement.xpReward} XP
                                </Text>
                            </View>

                            {unlocked && (
                                <View style={styles.checkMark}>
                                    <Ionicons name="checkmark-circle" size={16} color={achievement.color} />
                                </View>
                            )}
                        </Animated.View>
                    );
                })}
            </View>

            <View style={{ height: 50 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 16 },
    pageTitle: { fontSize: 28, fontWeight: '800', marginBottom: 4, marginTop: 8, letterSpacing: -0.5 },
    subtitle: { fontSize: 14, fontWeight: '500', marginBottom: 16 },
    filterRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
    filterBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 99, borderWidth: 1.5 },
    filterText: { fontSize: 13, fontWeight: '600' },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    badge: {
        width: '47%',
        borderRadius: 18,
        borderWidth: 1,
        padding: 14,
        overflow: 'hidden',
        position: 'relative',
    },
    badgeIconWrap: { width: 50, height: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
    badgeTitle: { fontSize: 13, fontWeight: '700', marginBottom: 4 },
    badgeDesc: { fontSize: 11, lineHeight: 16, marginBottom: 8 },
    progressTrack: { height: 4, borderRadius: 99, overflow: 'hidden', marginBottom: 8 },
    progressFill: { height: '100%', borderRadius: 99 },
    xpPill: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 },
    xpText: { fontSize: 10, fontWeight: '700' },
    checkMark: { position: 'absolute', top: 10, right: 10 },
});
