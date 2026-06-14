import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Switch,
    TouchableOpacity,
    Alert,
    Modal,
    FlatList,
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
    const notifSettings = useUserStore((s) => s.notificationSettings);
    const updateNotifSettings = useUserStore((s) => s.updateNotificationSettings);
    const resetAllData = useUserStore((s) => s.resetAllData);
    const { habits, deleteHabit } = useHabitStore();
    const [showTimePicker, setShowTimePicker] = useState(false);

    const totalCompletions = habits.reduce((s, h) => s + h.completedDates.length, 0);
    const maxStreak = Math.max(...habits.map((h) => h.longestStreak), 0);
    const totalXPFromHabits = habits.reduce((s, h) => s + h.completedDates.length * h.xpReward, 0);

    const handleResetData = () => {
        Alert.alert(
            'Reset All Data',
            'This will permanently delete ALL habits and reset your profile. This cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reset Everything',
                    style: 'destructive',
                    onPress: () => {
                        // Delete all habits from habit store
                        habits.forEach((h) => deleteHabit(h.id));
                        // Reset user profile
                        resetAllData();
                    },
                },
            ]
        );
    };

    const hours = Array.from({ length: 24 }, (_, i) => i);
    const formatHour = (h: number) => {
        const suffix = h < 12 ? 'AM' : 'PM';
        const display = h === 0 ? 12 : h > 12 ? h - 12 : h;
        return `${display}:00 ${suffix}`;
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
                {/* Decorative circles */}
                <View style={styles.heroDeco1} />
                <View style={styles.heroDeco2} />

                <View style={styles.avatarWrap}>
                    <Text style={styles.avatarText}>
                        {profile.name.charAt(0).toUpperCase() || '?'}
                    </Text>
                </View>
                <Text style={styles.heroName}>{profile.name}</Text>
                <View style={styles.levelPill}>
                    <Text style={styles.levelPillText}>
                        Lv {profile.level} · {getLevelTitle(profile.level)}
                    </Text>
                </View>

                {/* Streak freeze info */}
                <View style={styles.freezeRow}>
                    <Ionicons name="shield-checkmark" size={14} color="rgba(255,255,255,0.85)" />
                    <Text style={styles.freezeText}>{profile.streakFreeze} Streak Freeze{profile.streakFreeze !== 1 ? 's' : ''} remaining</Text>
                </View>
            </LinearGradient>

            {/* XP Bar */}
            <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <XPBar xp={profile.totalXP} />
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
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

            {/* Account Info */}
            <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Account</Text>
                <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Member Since</Text>
                    <Text style={[styles.infoValue, { color: theme.colors.textPrimary }]}>
                        {formatDate(profile.joinedAt.slice(0, 10))}
                    </Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Total XP Earned</Text>
                    <Text style={[styles.infoValue, { color: theme.colors.warning }]}>{profile.totalXP} XP</Text>
                </View>
                <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                    <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Streak Freezes</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Ionicons name="shield-checkmark" size={14} color={theme.colors.info} />
                        <Text style={[styles.infoValue, { color: theme.colors.primary }]}>{profile.streakFreeze} remaining</Text>
                    </View>
                </View>
            </View>

            {/* Notifications */}
            <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>🔔 Notifications</Text>

                <View style={styles.settingRow}>
                    <View style={styles.settingLeft}>
                        <Ionicons name="alarm-outline" size={20} color={theme.colors.primary} />
                        <View>
                            <Text style={[styles.settingLabel, { color: theme.colors.textPrimary }]}>Daily Reminder</Text>
                            <Text style={[styles.settingSubLabel, { color: theme.colors.textSecondary }]}>
                                Every day at {formatHour(notifSettings.dailyReminderTime.hour)}
                            </Text>
                        </View>
                    </View>
                    <Switch
                        value={notifSettings.dailyReminderEnabled}
                        onValueChange={(v) => updateNotifSettings({ dailyReminderEnabled: v })}
                        trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                        thumbColor="#fff"
                    />
                </View>

                {notifSettings.dailyReminderEnabled && (
                    <TouchableOpacity
                        style={[styles.timeRow, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}
                        onPress={() => setShowTimePicker(true)}
                    >
                        <Ionicons name="time-outline" size={16} color={theme.colors.textSecondary} />
                        <Text style={[styles.timeText, { color: theme.colors.textPrimary }]}>
                            Change time: {formatHour(notifSettings.dailyReminderTime.hour)}
                        </Text>
                        <Ionicons name="chevron-forward" size={16} color={theme.colors.textTertiary} />
                    </TouchableOpacity>
                )}

                <View style={[styles.settingRow, { marginTop: 12 }]}>
                    <View style={styles.settingLeft}>
                        <Ionicons name="flame-outline" size={20} color={theme.colors.secondary} />
                        <View>
                            <Text style={[styles.settingLabel, { color: theme.colors.textPrimary }]}>Evening Streak Alert</Text>
                            <Text style={[styles.settingSubLabel, { color: theme.colors.textSecondary }]}>Remind at 9 PM if incomplete</Text>
                        </View>
                    </View>
                    <Switch
                        value={notifSettings.eveningAlertEnabled}
                        onValueChange={(v) => updateNotifSettings({ eveningAlertEnabled: v })}
                        trackColor={{ false: theme.colors.border, true: theme.colors.secondary }}
                        thumbColor="#fff"
                    />
                </View>

                <View style={[styles.settingRow, { marginTop: 12 }]}>
                    <View style={styles.settingLeft}>
                        <Ionicons name="trophy-outline" size={20} color={theme.colors.warning} />
                        <View>
                            <Text style={[styles.settingLabel, { color: theme.colors.textPrimary }]}>Achievement Alerts</Text>
                            <Text style={[styles.settingSubLabel, { color: theme.colors.textSecondary }]}>Notify when you unlock badges</Text>
                        </View>
                    </View>
                    <Switch
                        value={notifSettings.achievementsEnabled}
                        onValueChange={(v) => updateNotifSettings({ achievementsEnabled: v })}
                        trackColor={{ false: theme.colors.border, true: theme.colors.warning }}
                        thumbColor="#fff"
                    />
                </View>
            </View>

            {/* App Settings */}
            <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>⚙️ App Settings</Text>
                <View style={styles.settingRow}>
                    <View style={styles.settingLeft}>
                        <Ionicons name={themeMode === 'dark' ? 'moon' : 'sunny'} size={20} color={theme.colors.primary} />
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

            {/* Quick Navigation */}
            <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Quick Links</Text>
                <TouchableOpacity
                    style={styles.quickLink}
                    onPress={() => navigation.navigate('Achievements')}
                >
                    <View style={[styles.quickIcon, { backgroundColor: theme.colors.warning + '20' }]}>
                        <Ionicons name="trophy" size={18} color={theme.colors.warning} />
                    </View>
                    <Text style={[styles.quickText, { color: theme.colors.textPrimary }]}>View Achievements</Text>
                    <Ionicons name="chevron-forward" size={16} color={theme.colors.textTertiary} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.quickLink}
                    onPress={() => navigation.navigate('Analytics')}
                >
                    <View style={[styles.quickIcon, { backgroundColor: theme.colors.primary + '20' }]}>
                        <Ionicons name="bar-chart" size={18} color={theme.colors.primary} />
                    </View>
                    <Text style={[styles.quickText, { color: theme.colors.textPrimary }]}>View Analytics</Text>
                    <Ionicons name="chevron-forward" size={16} color={theme.colors.textTertiary} />
                </TouchableOpacity>
            </View>

            {/* Danger zone */}
            <View style={[styles.dangerSection, { borderColor: theme.colors.error + '40', backgroundColor: theme.colors.error + '08' }]}>
                <Text style={[styles.dangerSectionTitle, { color: theme.colors.error }]}>⚠️ Danger Zone</Text>
                <TouchableOpacity
                    style={[styles.dangerBtn, { borderColor: theme.colors.error }]}
                    onPress={handleResetData}
                >
                    <Ionicons name="trash-outline" size={18} color={theme.colors.error} />
                    <Text style={[styles.dangerText, { color: theme.colors.error }]}>Reset All Data</Text>
                </TouchableOpacity>
            </View>

            <View style={{ height: 50 }} />

            {/* Hour picker modal */}
            <Modal visible={showTimePicker} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalCard, { backgroundColor: theme.colors.card }]}>
                        <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>Pick reminder time</Text>
                        <FlatList
                            data={hours}
                            keyExtractor={(h) => String(h)}
                            style={{ maxHeight: 300 }}
                            renderItem={({ item: h }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.hourRow,
                                        h === notifSettings.dailyReminderTime.hour && { backgroundColor: theme.colors.primary + '20' },
                                    ]}
                                    onPress={() => {
                                        updateNotifSettings({ dailyReminderTime: { hour: h, minute: 0 } });
                                        setShowTimePicker(false);
                                    }}
                                >
                                    <Text style={[
                                        styles.hourText,
                                        { color: h === notifSettings.dailyReminderTime.hour ? theme.colors.primary : theme.colors.textPrimary },
                                    ]}>
                                        {formatHour(h)}
                                    </Text>
                                    {h === notifSettings.dailyReminderTime.hour && (
                                        <Ionicons name="checkmark" size={18} color={theme.colors.primary} />
                                    )}
                                </TouchableOpacity>
                            )}
                        />
                        <TouchableOpacity onPress={() => setShowTimePicker(false)} style={styles.cancelBtn}>
                            <Text style={{ color: theme.colors.textSecondary, fontWeight: '600' }}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { paddingBottom: 40 },
    hero: {
        paddingTop: 60, paddingBottom: 32, alignItems: 'center',
        overflow: 'hidden',
    },
    heroDeco1: {
        position: 'absolute', width: 160, height: 160, borderRadius: 80,
        backgroundColor: 'rgba(255,255,255,0.06)', top: -40, right: -20,
    },
    heroDeco2: {
        position: 'absolute', width: 100, height: 100, borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.04)', bottom: -20, left: -10,
    },
    avatarWrap: {
        width: 80, height: 80, borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.25)',
        alignItems: 'center', justifyContent: 'center', marginBottom: 12,
        borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)',
    },
    avatarText: { fontSize: 36, fontWeight: '800', color: '#fff' },
    heroName: { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 8 },
    levelPill: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 99, marginBottom: 10 },
    levelPillText: { color: '#fff', fontSize: 13, fontWeight: '600' },
    freezeRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    freezeText: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '500' },

    section: { marginHorizontal: 16, marginTop: 12, borderRadius: 16, borderWidth: 1, padding: 16 },
    sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
    infoRow: {
        flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10,
        borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#2A3150',
    },
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
    settingSubLabel: { fontSize: 12, marginTop: 1 },
    timeRow: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        marginTop: 8, marginLeft: 30, padding: 10, borderRadius: 10, borderWidth: 1,
    },
    timeText: { flex: 1, fontSize: 14, fontWeight: '500' },

    quickLink: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
    quickIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    quickText: { flex: 1, fontSize: 15, fontWeight: '500' },

    dangerSection: { marginHorizontal: 16, marginTop: 12, borderRadius: 16, borderWidth: 1, padding: 16 },
    dangerSectionTitle: { fontSize: 14, fontWeight: '700', marginBottom: 12 },
    dangerBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 8, paddingVertical: 13, borderRadius: 12, borderWidth: 1.5,
    },
    dangerText: { fontSize: 15, fontWeight: '600' },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
    modalCard: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
    modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16, textAlign: 'center' },
    hourRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingVertical: 14, paddingHorizontal: 16, borderRadius: 10, marginBottom: 4,
    },
    hourText: { fontSize: 16, fontWeight: '500' },
    cancelBtn: { alignItems: 'center', paddingTop: 16 },
});
