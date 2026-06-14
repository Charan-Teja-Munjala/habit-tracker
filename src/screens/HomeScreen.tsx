import React, { useCallback, useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
    TouchableOpacity,
    ScrollView,
    Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useHabitStore } from '../store/habitStore';
import { useUserStore } from '../store/userStore';
import { HabitCard } from '../components/HabitCard';
import { StatsCard } from '../components/StatsCard';
import { XPBar } from '../components/XPBar';
import { ProgressRing } from '../components/ProgressRing';
import { LevelUpModal } from '../components/LevelUpModal';
import { AchievementToast } from '../components/AchievementToast';
import { Habit } from '../types';
import { ACHIEVEMENTS, CATEGORIES } from '../constants/habits';
import { getLevelTitle } from '../utils/xpUtils';

interface Props {
    navigation: any;
}

type CategoryFilter = 'All' | string;

export function HomeScreen({ navigation }: Props) {
    const theme = useTheme();
    const profile = useUserStore((s) => s.profile);
    const { getTodayHabits, getTodayStats } = useHabitStore();
    const [refreshing, setRefreshing] = useState(false);
    const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('All');
    const [levelUpData, setLevelUpData] = useState<{ level: number; title: string } | null>(null);
    const [unlockedAchievementId, setUnlockedAchievementId] = useState<string | null>(null);

    const habits = getTodayHabits();
    const stats = getTodayStats();
    const scrollY = useRef(new Animated.Value(0)).current;

    // Filter habits by category
    const filteredHabits = categoryFilter === 'All'
        ? habits
        : habits.filter((h) => h.category === categoryFilter);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 800);
    }, []);

    const heroOpacity = scrollY.interpolate({ inputRange: [0, 80], outputRange: [1, 0], extrapolate: 'clamp' });
    const heroTranslate = scrollY.interpolate({ inputRange: [0, 80], outputRange: [0, -20], extrapolate: 'clamp' });
    const stickyOpacity = scrollY.interpolate({ inputRange: [60, 100], outputRange: [0, 1], extrapolate: 'clamp' });

    const greetingHour = new Date().getHours();
    const greeting = greetingHour < 12 ? 'Good morning' : greetingHour < 17 ? 'Good afternoon' : 'Good evening';

    const handleLevelUp = (level: number) => {
        setLevelUpData({ level, title: getLevelTitle(level) });
    };

    const handleAchievementUnlocked = (id: string) => {
        setUnlockedAchievementId(id);
    };

    const unlockedAchievement = unlockedAchievementId
        ? ACHIEVEMENTS.find((a) => a.id === unlockedAchievementId)
        : null;

    // Check if all done today
    const allDone = stats.total > 0 && stats.completed === stats.total;

    const ListHeader = () => (
        <View>
            {/* Hero header */}
            <Animated.View style={[styles.heroHeader, { opacity: heroOpacity, transform: [{ translateY: heroTranslate }] }]}>
                <LinearGradient colors={[theme.colors.surface, theme.colors.background]} style={StyleSheet.absoluteFillObject} />
                <View style={styles.heroTop}>
                    <View>
                        <Text style={[styles.greeting, { color: theme.colors.textSecondary }]}>{greeting} 👋</Text>
                        <Text style={[styles.heroName, { color: theme.colors.textPrimary }]}>{profile.name || 'Achiever'}</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.avatarWrap, { backgroundColor: theme.colors.primary + '25' }]}
                        onPress={() => navigation.navigate('Profile')}
                    >
                        <LinearGradient
                            colors={theme.colors.gradientPrimary}
                            style={StyleSheet.absoluteFillObject}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        />
                        <Text style={styles.avatarInner}>
                            {profile.name?.charAt(0)?.toUpperCase() || '?'}
                        </Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.xpWrap}>
                    <XPBar xp={profile.totalXP} />
                </View>
            </Animated.View>

            {/* All done banner */}
            {allDone && (
                <View style={[styles.allDoneBanner, { backgroundColor: theme.colors.success + '18', borderColor: theme.colors.success + '50' }]}>
                    <Text style={styles.allDoneEmoji}>🎉</Text>
                    <View>
                        <Text style={[styles.allDoneTitle, { color: theme.colors.success }]}>All habits done!</Text>
                        <Text style={[styles.allDoneSub, { color: theme.colors.textSecondary }]}>Amazing work today. Keep it up!</Text>
                    </View>
                </View>
            )}

            {/* Stats row */}
            <View style={styles.statsRow}>
                <StatsCard
                    title="Completed"
                    value={`${stats.completed}/${stats.total}`}
                    icon="checkmark-circle"
                    iconColor={theme.colors.success}
                    style={{ marginRight: 8 }}
                />
                <StatsCard
                    title="XP Today"
                    value={`+${stats.totalXPEarned}`}
                    icon="star"
                    iconColor={theme.colors.warning}
                    style={{ marginRight: 8 }}
                />
                <View style={[styles.ringCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.glassBorder }]}>
                    <ProgressRing
                        progress={stats.completionRate}
                        size={72}
                        strokeWidth={6}
                        label={`${Math.round(stats.completionRate * 100)}%`}
                        gradientColors={theme.colors.gradientPrimary}
                    />
                </View>
            </View>

            {/* Category filters */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filterScroll}
                contentContainerStyle={styles.filterContent}
            >
                <TouchableOpacity
                    onPress={() => setCategoryFilter('All')}
                    style={[
                        styles.filterPill,
                        {
                            backgroundColor: categoryFilter === 'All' ? theme.colors.primary : theme.colors.card,
                            borderColor: categoryFilter === 'All' ? theme.colors.primary : theme.colors.border,
                        },
                    ]}
                >
                    <Text style={[styles.filterPillText, { color: categoryFilter === 'All' ? '#fff' : theme.colors.textSecondary }]}>
                        All
                    </Text>
                </TouchableOpacity>
                {CATEGORIES.map((cat) => {
                    const active = categoryFilter === cat.id;
                    return (
                        <TouchableOpacity
                            key={cat.id}
                            onPress={() => setCategoryFilter(active ? 'All' : cat.id)}
                            style={[
                                styles.filterPill,
                                {
                                    backgroundColor: active ? cat.color + '25' : theme.colors.card,
                                    borderColor: active ? cat.color : theme.colors.border,
                                },
                            ]}
                        >
                            <Ionicons name={cat.icon as any} size={12} color={active ? cat.color : theme.colors.textSecondary} />
                            <Text style={[styles.filterPillText, { color: active ? cat.color : theme.colors.textSecondary }]}>
                                {cat.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
                Today's Habits
                {categoryFilter !== 'All' && (
                    <Text style={{ color: theme.colors.textTertiary, fontWeight: '500', fontSize: 14 }}>
                        {' '}· {categoryFilter}
                    </Text>
                )}
            </Text>

            {filteredHabits.length === 0 && (
                <View style={styles.emptyWrap}>
                    <View style={[styles.emptyIconWrap, { backgroundColor: theme.colors.primary + '15' }]}>
                        <Ionicons name="sparkles" size={40} color={theme.colors.primary} />
                    </View>
                    <Text style={[styles.emptyTitle, { color: theme.colors.textPrimary }]}>
                        {habits.length === 0 ? 'No habits yet' : 'No habits in this category'}
                    </Text>
                    <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                        {habits.length === 0
                            ? 'Tap + to create your first habit and start building momentum!'
                            : `Try switching to "All" or add a ${categoryFilter} habit.`}
                    </Text>
                    {habits.length === 0 && (
                        <TouchableOpacity
                            style={[styles.emptyBtn, { borderColor: theme.colors.primary }]}
                            onPress={() => navigation.navigate('AddHabit')}
                        >
                            <Ionicons name="add-circle" size={18} color={theme.colors.primary} />
                            <Text style={[styles.emptyBtnText, { color: theme.colors.primary }]}>Add your first habit</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Sticky header */}
            <Animated.View style={[styles.stickyHeader, { backgroundColor: theme.colors.surface, opacity: stickyOpacity }]}>
                <Text style={[styles.stickyTitle, { color: theme.colors.textPrimary }]}>
                    Today · {stats.completed}/{stats.total} done
                </Text>
            </Animated.View>

            <Animated.FlatList<Habit>
                data={filteredHabits}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <HabitCard
                        habit={item}
                        onPress={(h) => navigation.navigate('HabitDetail', { habitId: h.id })}
                        onAchievementUnlocked={handleAchievementUnlocked}
                        onLevelUp={handleLevelUp}
                    />
                )}
                ListHeaderComponent={ListHeader}
                ListFooterComponent={<View style={{ height: 110 }} />}
                onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
                scrollEventThrottle={16}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
                showsVerticalScrollIndicator={false}
            />

            {/* FAB */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('AddHabit')}
                activeOpacity={0.85}
            >
                <LinearGradient
                    colors={theme.colors.gradientPrimary}
                    style={StyleSheet.absoluteFillObject}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                />
                <Ionicons name="add" size={28} color="#fff" />
            </TouchableOpacity>

            {/* Level up modal */}
            {levelUpData && (
                <LevelUpModal
                    level={levelUpData.level}
                    levelTitle={levelUpData.title}
                    onClose={() => setLevelUpData(null)}
                />
            )}

            {/* Achievement toast */}
            {unlockedAchievement && (
                <AchievementToast
                    title={unlockedAchievement.title}
                    description={unlockedAchievement.description}
                    icon={unlockedAchievement.icon}
                    color={unlockedAchievement.color}
                    onDone={() => setUnlockedAchievementId(null)}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    heroHeader: { paddingTop: 52, paddingHorizontal: 20, paddingBottom: 16 },
    heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    greeting: { fontSize: 13, fontWeight: '500', marginBottom: 4 },
    heroName: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
    avatarWrap: {
        width: 44, height: 44, borderRadius: 14,
        alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
    },
    avatarInner: { fontSize: 20, fontWeight: '800', color: '#fff' },
    xpWrap: { marginTop: 4 },

    allDoneBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginHorizontal: 16,
        marginBottom: 12,
        padding: 14,
        borderRadius: 16,
        borderWidth: 1,
    },
    allDoneEmoji: { fontSize: 28 },
    allDoneTitle: { fontSize: 15, fontWeight: '700' },
    allDoneSub: { fontSize: 12, marginTop: 2 },

    statsRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 14, alignItems: 'center' },
    ringCard: { borderRadius: 16, borderWidth: 1, padding: 8, alignItems: 'center', justifyContent: 'center' },

    filterScroll: { marginBottom: 10 },
    filterContent: { paddingHorizontal: 16, gap: 8 },
    filterPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 13,
        paddingVertical: 7,
        borderRadius: 99,
        borderWidth: 1.5,
    },
    filterPillText: { fontSize: 12, fontWeight: '600' },

    sectionTitle: { fontSize: 18, fontWeight: '700', paddingHorizontal: 20, marginBottom: 8 },

    emptyWrap: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 24 },
    emptyIconWrap: {
        width: 80, height: 80, borderRadius: 24,
        alignItems: 'center', justifyContent: 'center', marginBottom: 16,
    },
    emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
    emptyText: { fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 20 },
    emptyBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1.5,
    },
    emptyBtnText: { fontSize: 14, fontWeight: '700' },

    stickyHeader: {
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
        paddingTop: 52, paddingBottom: 10, paddingHorizontal: 20,
    },
    stickyTitle: { fontSize: 17, fontWeight: '700' },

    fab: {
        position: 'absolute', bottom: 90, right: 20,
        width: 58, height: 58, borderRadius: 20,
        alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
        shadowColor: '#6C63FF',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
        elevation: 10,
    },
});
