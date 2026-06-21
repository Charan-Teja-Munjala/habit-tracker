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
import { NoteJournalModal, MOODS } from '../components/NoteJournalModal';
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
    const { getHabitById, deleteHabit, markComplete, unmarkComplete, getActiveHabits, addNote } = useHabitStore();
    const addXP = useUserStore((s) => s.addXP);
    const profile = useUserStore((s) => s.profile);
    const checkAchievements = useUserStore((s) => s.checkAchievements);

    const [levelUpData, setLevelUpData] = useState<{ level: number; title: string } | null>(null);
    const [unlockedId, setUnlockedId] = useState<string | null>(null);
    const [journalModalVisible, setJournalModalVisible] = useState(false);
    const [editingDate, setEditingDate] = useState<string>(TODAY());
    const [showAllNotes, setShowAllNotes] = useState(false);

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

    const openJournalFor = (date: string) => {
        setEditingDate(date);
        setJournalModalVisible(true);
    };

    const handleSaveNote = (note: string, mood: string) => {
        addNote(habit.id, editingDate, note, mood);
    };

    // All notes sorted newest first
    const allNotes = Object.entries(habit.notes ?? {})
        .sort(([a], [b]) => b.localeCompare(a));

    // Dates that are completed but have no notes — for "journal missing" indicators
    const completedWithoutNote = habit.completedDates
        .filter((d) => !(habit.notes ?? {})[d])
        .sort((a, b) => b.localeCompare(a))
        .slice(0, 3);

    const displayedNotes = showAllNotes ? allNotes : allNotes.slice(0, 5);

    const unlockedAchievement = unlockedId ? ACHIEVEMENTS.find((a) => a.id === unlockedId) : null;

    const todayNote = habit.notes?.[today];
    const todayMood = habit.moods?.[today];

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

                    {/* Today's journal entry shortcut */}
                    {isCompletedToday && (
                        <TouchableOpacity
                            onPress={() => openJournalFor(today)}
                            style={[
                                styles.journalTodayBtn,
                                {
                                    backgroundColor: theme.colors.card,
                                    borderColor: todayNote ? habit.color + '50' : theme.colors.border,
                                },
                            ]}
                            activeOpacity={0.8}
                        >
                            <View style={[styles.journalBtnLeft, { backgroundColor: habit.color + '15' }]}>
                                <Text style={{ fontSize: 16 }}>
                                    {todayMood || '📝'}
                                </Text>
                            </View>
                            <View style={styles.journalBtnContent}>
                                <Text style={[styles.journalBtnTitle, { color: theme.colors.textPrimary }]}>
                                    {todayNote ? 'Today\'s Journal Entry' : 'Add Today\'s Note'}
                                </Text>
                                {todayNote ? (
                                    <Text style={[styles.journalBtnSub, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                                        {todayNote}
                                    </Text>
                                ) : (
                                    <Text style={[styles.journalBtnSub, { color: theme.colors.textTertiary }]}>
                                        What did you do today?
                                    </Text>
                                )}
                            </View>
                            <Ionicons
                                name={todayNote ? 'pencil-outline' : 'add-circle-outline'}
                                size={18}
                                color={todayNote ? habit.color : theme.colors.textTertiary}
                            />
                        </TouchableOpacity>
                    )}
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

                {/* ── Journal section ── */}
                <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                    <View style={styles.journalHeader}>
                        <View style={styles.journalTitleRow}>
                            <Ionicons name="journal" size={16} color={habit.color} />
                            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary, marginBottom: 0 }]}>
                                Journal
                            </Text>
                            <View style={[styles.journalCountBadge, { backgroundColor: habit.color + '20' }]}>
                                <Text style={[styles.journalCountText, { color: habit.color }]}>
                                    {allNotes.length}
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            onPress={() => openJournalFor(today)}
                            style={[styles.addEntryBtn, { backgroundColor: habit.color + '15', borderColor: habit.color + '40' }]}
                        >
                            <Ionicons name="add" size={14} color={habit.color} />
                            <Text style={[styles.addEntryText, { color: habit.color }]}>Add</Text>
                        </TouchableOpacity>
                    </View>

                    {allNotes.length === 0 ? (
                        <View style={styles.emptyJournal}>
                            <Text style={{ fontSize: 32, marginBottom: 8 }}>📖</Text>
                            <Text style={[styles.emptyJournalTitle, { color: theme.colors.textSecondary }]}>
                                No journal entries yet
                            </Text>
                            <Text style={[styles.emptyJournalSub, { color: theme.colors.textTertiary }]}>
                                Complete this habit and add a note to start your journal
                            </Text>
                        </View>
                    ) : (
                        <>
                            {displayedNotes.map(([date, note], index) => {
                                const mood = habit.moods?.[date];
                                const moodData = mood ? MOODS.find((m) => m.emoji === mood) : null;
                                const isLast = index === displayedNotes.length - 1;
                                return (
                                    <View key={date}>
                                        <View style={styles.journalEntry}>
                                            {/* Timeline line */}
                                            {!isLast && (
                                                <View style={[styles.timelineLine, { backgroundColor: theme.colors.border }]} />
                                            )}
                                            {/* Mood dot */}
                                            <View
                                                style={[
                                                    styles.timelineDot,
                                                    {
                                                        backgroundColor: moodData ? moodData.color + '30' : habit.color + '20',
                                                        borderColor: moodData ? moodData.color : habit.color + '50',
                                                    },
                                                ]}
                                            >
                                                <Text style={styles.timelineDotEmoji}>
                                                    {mood || '✍️'}
                                                </Text>
                                            </View>
                                            {/* Content */}
                                            <View style={styles.entryContent}>
                                                <View style={styles.entryHeader}>
                                                    <Text style={[styles.entryDate, { color: theme.colors.textTertiary }]}>
                                                        {formatDate(date)}
                                                    </Text>
                                                    {moodData && (
                                                        <View style={[styles.moodPill, { backgroundColor: moodData.color + '20' }]}>
                                                            <Text style={[styles.moodPillText, { color: moodData.color }]}>
                                                                {moodData.emoji} {moodData.label}
                                                            </Text>
                                                        </View>
                                                    )}
                                                    <TouchableOpacity
                                                        onPress={() => openJournalFor(date)}
                                                        style={styles.editEntryBtn}
                                                    >
                                                        <Ionicons name="pencil-outline" size={12} color={theme.colors.textTertiary} />
                                                    </TouchableOpacity>
                                                </View>
                                                <Text style={[styles.entryNote, { color: theme.colors.textPrimary }]}>
                                                    {note}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                );
                            })}

                            {allNotes.length > 5 && (
                                <TouchableOpacity
                                    onPress={() => setShowAllNotes(!showAllNotes)}
                                    style={[styles.showMoreBtn, { borderTopColor: theme.colors.border }]}
                                >
                                    <Text style={[styles.showMoreText, { color: theme.colors.primary }]}>
                                        {showAllNotes
                                            ? 'Show less'
                                            : `Show all ${allNotes.length} entries`}
                                    </Text>
                                    <Ionicons
                                        name={showAllNotes ? 'chevron-up' : 'chevron-down'}
                                        size={14}
                                        color={theme.colors.primary}
                                    />
                                </TouchableOpacity>
                            )}
                        </>
                    )}

                    {/* Completed days without notes */}
                    {completedWithoutNote.length > 0 && (
                        <View style={[styles.missingNotesBanner, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
                            <Ionicons name="time-outline" size={14} color={theme.colors.textTertiary} />
                            <Text style={[styles.missingNotesText, { color: theme.colors.textTertiary }]}>
                                {completedWithoutNote.length} completed day{completedWithoutNote.length > 1 ? 's' : ''} without notes
                            </Text>
                        </View>
                    )}
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
                    <View style={styles.infoRow}>
                        <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Journal Entries</Text>
                        <Text style={[styles.infoValue, { color: habit.color }]}>{allNotes.length} entries</Text>
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

            {/* Journal Modal */}
            <NoteJournalModal
                visible={journalModalVisible}
                onClose={() => setJournalModalVisible(false)}
                onSave={handleSaveNote}
                habitTitle={habit.title}
                habitColor={habit.color}
                habitIcon={habit.icon}
                date={editingDate}
                existingNote={habit.notes?.[editingDate] ?? ''}
                existingMood={habit.moods?.[editingDate] ?? ''}
            />

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

    completeSection: { paddingHorizontal: 16, marginBottom: 12, gap: 10 },
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

    journalTodayBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 14,
        borderRadius: 16,
        borderWidth: 1,
    },
    journalBtnLeft: {
        width: 40, height: 40, borderRadius: 12,
        alignItems: 'center', justifyContent: 'center',
    },
    journalBtnContent: { flex: 1 },
    journalBtnTitle: { fontSize: 13, fontWeight: '700' },
    journalBtnSub: { fontSize: 11, marginTop: 2 },

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

    // Journal styles
    journalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
    journalTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    journalCountBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 99 },
    journalCountText: { fontSize: 11, fontWeight: '700' },
    addEntryBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        paddingHorizontal: 10, paddingVertical: 6, borderRadius: 99, borderWidth: 1,
    },
    addEntryText: { fontSize: 12, fontWeight: '700' },

    emptyJournal: { alignItems: 'center', paddingVertical: 20 },
    emptyJournalTitle: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
    emptyJournalSub: { fontSize: 12, textAlign: 'center', lineHeight: 18 },

    journalEntry: {
        flexDirection: 'row',
        gap: 12,
        paddingBottom: 16,
        position: 'relative',
    },
    timelineLine: {
        position: 'absolute',
        left: 18,
        top: 36,
        bottom: 0,
        width: 1.5,
    },
    timelineDot: {
        width: 36, height: 36,
        borderRadius: 18,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    timelineDotEmoji: { fontSize: 15 },
    entryContent: { flex: 1, paddingTop: 6 },
    entryHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
    entryDate: { fontSize: 11, fontWeight: '600', flex: 1 },
    moodPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 },
    moodPillText: { fontSize: 10, fontWeight: '700' },
    editEntryBtn: { padding: 2 },
    entryNote: { fontSize: 13, lineHeight: 20 },

    showMoreBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 6, paddingTop: 12, marginTop: 4, borderTopWidth: StyleSheet.hairlineWidth,
    },
    showMoreText: { fontSize: 13, fontWeight: '600' },

    missingNotesBanner: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        marginTop: 12, padding: 10, borderRadius: 10, borderWidth: 1,
    },
    missingNotesText: { fontSize: 11, fontWeight: '500' },

    actions: { flexDirection: 'row', paddingHorizontal: 16, marginTop: 4 },
});
