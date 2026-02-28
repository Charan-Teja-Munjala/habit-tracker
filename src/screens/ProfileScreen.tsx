import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Switch,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../hooks/useTheme';
import { useUserStore } from '../store/userStore';
import { useHabitStore } from '../store/habitStore';
import { XPBar } from '../components/XPBar';
import { formatDate } from '../utils/dateUtils';
import { getLevelTitle } from '../utils/xpUtils';

interface Props { navigation: any; }

export function ProfileScreen({ navigation }: Props) {
    const theme = useTheme();
    const profile = useUserStore((s) => s.profile);
    const themeMode = useUserStore((s) => s.themeMode);
    const toggleTheme = useUserStore((s) => s.toggleTheme);
    const { habits } = useHabitStore();

    const totalCompletions = habits.reduce((s, h) => s + h.completedDates.length, 0);
    const maxStreak = Math.max(...habits.map((h) => h.longestStreak), 0);

    const handleResetData = () => {
        Alert.alert(
            'Reset All Data',
            'This will permanently delete all habits and progress. Are you sure?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Reset', style: 'destructive', onPress: () => { } },
            ]
        );
    };

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            {/* Hero */}
            <LinearGradient
                colors={theme.colors.gradientPrimary}
                style={styles.hero}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.avatarWrap}>
                    <Text style={styles.avatarText}>
                        {profile.name.charAt(0).toUpperCase() || '?'}
                    </Text>
                </View>
                <Text style={styles.heroName}>{profile.name}</Text>
                <View style={[styles.levelPill]}>
                    <Text style={styles.levelPillText}>
                        Lv {profile.level} · {getLevelTitle(profile.level)}
                    </Text>
                </View>
            </LinearGradient>

            {/* XP Bar */}
            <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <XPBar xp={profile.totalXP} />
            </View>

            {/* Stats */}
            <View style={[styles.statsGrid]}>
                {[
                    { label: 'Total Habits', value: habits.length, icon: 'list', color: theme.colors.primary },
                    { label: 'Completions', value: totalCompletions, icon: 'checkmark-circle', color: theme.colors.success },
                    { label: 'Best Streak', value: maxStreak, icon: 'flame', color: theme.colors.secondary },
                    { label: 'Achievements', value: profile.achievements.length, icon: 'trophy', color: theme.colors.warning },
                ].map((s) => (
                    <View key={s.label} style={[styles.statCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                        <View style={[styles.statIconWrap, { backgroundColor: s.color + '20' }]}>
                            <Ionicons name={s.icon as any} size={18} color={s.color} />
                        </View>
                        <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>{s.value}</Text>
                        <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{s.label}</Text>
                    </View>
                ))}
            </View>

            {/* Info */}
            <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Account</Text>
                <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Member Since</Text>
                    <Text style={[styles.infoValue, { color: theme.colors.textPrimary }]}>
                        {formatDate(profile.joinedAt.slice(0, 10))}
                    </Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Streak Freezes</Text>
                    <Text style={[styles.infoValue, { color: theme.colors.primary }]}>{profile.streakFreeze} remaining</Text>
                </View>
            </View>

            {/* Settings */}
            <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Settings</Text>
                <View style={styles.settingRow}>
                    <View style={styles.settingLeft}>
                        <Ionicons name="moon" size={20} color={theme.colors.primary} />
                        <Text style={[styles.settingLabel, { color: theme.colors.textPrimary }]}>Dark Mode</Text>
                    </View>
                    <Switch
                        value={themeMode === 'dark'}
                        onValueChange={toggleTheme}
                        trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                        thumbColor="#fff"
                    />
                </View>
            </View>

            {/* Danger zone */}
            <TouchableOpacity
                style={[styles.dangerBtn, { borderColor: theme.colors.error }]}
                onPress={handleResetData}
            >
                <Ionicons name="trash-outline" size={18} color={theme.colors.error} />
                <Text style={[styles.dangerText, { color: theme.colors.error }]}>Reset All Data</Text>
            </TouchableOpacity>

            <View style={{ height: 50 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { paddingBottom: 40 },
    hero: { paddingTop: 60, paddingBottom: 32, alignItems: 'center' },
    avatarWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    avatarText: { fontSize: 36, fontWeight: '800', color: '#fff' },
    heroName: { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 8 },
    levelPill: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 99 },
    levelPillText: { color: '#fff', fontSize: 13, fontWeight: '600' },
    section: { marginHorizontal: 16, marginTop: 12, borderRadius: 16, borderWidth: 1, padding: 16 },
    sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#2A3150' },
    infoLabel: { fontSize: 14, fontWeight: '500' },
    infoValue: { fontSize: 14, fontWeight: '600' },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, marginTop: 12, gap: 8 },
    statCard: { width: '47%', borderRadius: 14, borderWidth: 1, padding: 14 },
    statIconWrap: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
    statValue: { fontSize: 22, fontWeight: '800' },
    statLabel: { fontSize: 11, fontWeight: '500', marginTop: 2 },
    settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
    settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    settingLabel: { fontSize: 15, fontWeight: '500' },
    dangerBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginHorizontal: 16, marginTop: 16, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5 },
    dangerText: { fontSize: 15, fontWeight: '600' },
});
