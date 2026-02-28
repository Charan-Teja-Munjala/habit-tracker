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
import { Habit } from '../types';

interface Props {
    navigation: any;
}

export function HomeScreen({ navigation }: Props) {
    const theme = useTheme();
    const profile = useUserStore((s) => s.profile);
    const { getTodayHabits, getTodayStats } = useHabitStore();
    const [refreshing, setRefreshing] = useState(false);

    const habits = getTodayHabits();
    const stats = getTodayStats();
    const scrollY = useRef(new Animated.Value(0)).current;

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 800);
    }, []);

    const heroOpacity = scrollY.interpolate({ inputRange: [0, 80], outputRange: [1, 0], extrapolate: 'clamp' });
    const heroTranslate = scrollY.interpolate({ inputRange: [0, 80], outputRange: [0, -20], extrapolate: 'clamp' });
    const stickyOpacity = scrollY.interpolate({ inputRange: [60, 100], outputRange: [0, 1], extrapolate: 'clamp' });

    const greetingHour = new Date().getHours();
    const greeting = greetingHour < 12 ? 'Good morning' : greetingHour < 17 ? 'Good afternoon' : 'Good evening';

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
                        style={[styles.avatarWrap, { backgroundColor: theme.colors.primary + '20' }]}
                        onPress={() => navigation.navigate('Profile')}
                    >
                        <Text style={[styles.avatarInner, { color: theme.colors.primary }]}>
                            {profile.name?.charAt(0)?.toUpperCase() || '?'}
                        </Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.xpWrap}>
                    <XPBar xp={profile.totalXP} />
                </View>
            </Animated.View>

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
                    title="Rate"
                    value={`${Math.round(stats.completionRate * 100)}%`}
                    icon="stats-chart"
                    iconColor={theme.colors.primary}
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

            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Today's Habits</Text>
            {habits.length === 0 && (
                <View style={styles.emptyWrap}>
                    <Ionicons name="add-circle-outline" size={48} color={theme.colors.textTertiary} />
                    <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                        No habits yet. Tap + to add your first!
                    </Text>
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
                data={habits}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <HabitCard
                        habit={item}
                        onPress={(h) => navigation.navigate('HabitDetail', { habitId: h.id })}
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
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    heroHeader: { paddingTop: 52, paddingHorizontal: 20, paddingBottom: 16 },
    heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    greeting: { fontSize: 13, fontWeight: '500', marginBottom: 4 },
    heroName: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
    avatarWrap: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    avatarInner: { fontSize: 20, fontWeight: '800' },
    xpWrap: { marginTop: 4 },
    statsRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 16, alignItems: 'center' },
    ringCard: { borderRadius: 16, borderWidth: 1, padding: 8, alignItems: 'center', justifyContent: 'center' },
    sectionTitle: { fontSize: 18, fontWeight: '700', paddingHorizontal: 20, marginBottom: 8 },
    emptyWrap: { alignItems: 'center', paddingVertical: 48 },
    emptyText: { fontSize: 14, marginTop: 12, textAlign: 'center', paddingHorizontal: 32 },
    stickyHeader: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, paddingTop: 52, paddingBottom: 10, paddingHorizontal: 20 },
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
