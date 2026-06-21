import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../hooks/useTheme';
import { useHabitStore } from '../store/habitStore';
import { NoteJournalModal, MOODS } from '../components/NoteJournalModal';
import { formatDate } from '../utils/dateUtils';

interface Props {
    navigation: any;
}

interface JournalEntry {
    date: string;
    habitId: string;
    habitTitle: string;
    habitColor: string;
    habitIcon: string;
    note: string;
    mood?: string;
}

export function JournalScreen({ navigation }: Props) {
    const theme = useTheme();
    const { habits, addNote } = useHabitStore();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
    const [journalModalVisible, setJournalModalVisible] = useState(false);
    const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);

    // Flatten all journal entries across all habits
    const allEntries: JournalEntry[] = useMemo(() => {
        const entries: JournalEntry[] = [];
        habits.forEach((habit) => {
            Object.entries(habit.notes ?? {}).forEach(([date, note]) => {
                entries.push({
                    date,
                    habitId: habit.id,
                    habitTitle: habit.title,
                    habitColor: habit.color,
                    habitIcon: habit.icon,
                    note,
                    mood: habit.moods?.[date],
                });
            });
        });
        // Sort newest first
        return entries.sort((a, b) => b.date.localeCompare(a.date));
    }, [habits]);

    // Filter by search + habit filter
    const filteredEntries = useMemo(() => {
        return allEntries.filter((e) => {
            const matchHabit = !selectedHabitId || e.habitId === selectedHabitId;
            const matchSearch =
                !searchQuery ||
                e.note.toLowerCase().includes(searchQuery.toLowerCase()) ||
                e.habitTitle.toLowerCase().includes(searchQuery.toLowerCase());
            return matchHabit && matchSearch;
        });
    }, [allEntries, selectedHabitId, searchQuery]);

    // Group by date
    const groupedByDate = useMemo(() => {
        const groups: Record<string, JournalEntry[]> = {};
        filteredEntries.forEach((entry) => {
            if (!groups[entry.date]) groups[entry.date] = [];
            groups[entry.date].push(entry);
        });
        return groups;
    }, [filteredEntries]);

    const dateKeys = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a));

    // Unique habits that have at least one note
    const habitsWithNotes = habits.filter((h) => Object.keys(h.notes ?? {}).length > 0);

    const openEdit = (entry: JournalEntry) => {
        setEditingEntry(entry);
        setJournalModalVisible(true);
    };

    const handleSaveNote = (note: string, mood: string) => {
        if (!editingEntry) return;
        addNote(editingEntry.habitId, editingEntry.date, note, mood);
    };

    const totalEntries = allEntries.length;
    const moodCounts = allEntries.reduce<Record<string, number>>((acc, e) => {
        if (e.mood) acc[e.mood] = (acc[e.mood] ?? 0) + 1;
        return acc;
    }, {});
    const topMood = Object.entries(moodCounts).sort(([, a], [, b]) => b - a)[0]?.[0];
    const topMoodData = topMood ? MOODS.find((m) => m.emoji === topMood) : null;

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.headerRow}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={22} color={theme.colors.textPrimary} />
                    </TouchableOpacity>
                    <View>
                        <Text style={[styles.pageTitle, { color: theme.colors.textPrimary }]}>📖 Journal</Text>
                        <Text style={[styles.pageSubtitle, { color: theme.colors.textSecondary }]}>
                            {totalEntries} entr{totalEntries !== 1 ? 'ies' : 'y'} across {habitsWithNotes.length} habit{habitsWithNotes.length !== 1 ? 's' : ''}
                        </Text>
                    </View>
                </View>

                {/* Stats row */}
                {totalEntries > 0 && (
                    <View style={[styles.statsCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                        <LinearGradient
                            colors={['#6366F120', '#8B5CF620']}
                            style={StyleSheet.absoluteFillObject}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        />
                        <View style={styles.statsInner}>
                            <View style={styles.statItem}>
                                <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>{totalEntries}</Text>
                                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Total Entries</Text>
                            </View>
                            <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
                            <View style={styles.statItem}>
                                <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>{habitsWithNotes.length}</Text>
                                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Habits Journaled</Text>
                            </View>
                            {topMoodData && (
                                <>
                                    <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
                                    <View style={styles.statItem}>
                                        <Text style={{ fontSize: 24 }}>{topMoodData.emoji}</Text>
                                        <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Top Mood</Text>
                                    </View>
                                </>
                            )}
                        </View>
                    </View>
                )}

                {/* Search bar */}
                <View style={[styles.searchBar, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                    <Ionicons name="search-outline" size={16} color={theme.colors.textTertiary} />
                    <TextInput
                        style={[styles.searchInput, { color: theme.colors.textPrimary }]}
                        placeholder="Search journal entries..."
                        placeholderTextColor={theme.colors.textTertiary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={16} color={theme.colors.textTertiary} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Habit filter chips */}
                {habitsWithNotes.length > 1 && (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.filterScroll}
                        contentContainerStyle={styles.filterContent}
                    >
                        <TouchableOpacity
                            onPress={() => setSelectedHabitId(null)}
                            style={[
                                styles.filterPill,
                                {
                                    backgroundColor: !selectedHabitId ? theme.colors.primary : theme.colors.card,
                                    borderColor: !selectedHabitId ? theme.colors.primary : theme.colors.border,
                                },
                            ]}
                        >
                            <Text style={[styles.filterPillText, { color: !selectedHabitId ? '#fff' : theme.colors.textSecondary }]}>
                                All
                            </Text>
                        </TouchableOpacity>
                        {habitsWithNotes.map((h) => {
                            const active = selectedHabitId === h.id;
                            return (
                                <TouchableOpacity
                                    key={h.id}
                                    onPress={() => setSelectedHabitId(active ? null : h.id)}
                                    style={[
                                        styles.filterPill,
                                        {
                                            backgroundColor: active ? h.color + '25' : theme.colors.card,
                                            borderColor: active ? h.color : theme.colors.border,
                                        },
                                    ]}
                                >
                                    <Ionicons name={h.icon as any} size={11} color={active ? h.color : theme.colors.textSecondary} />
                                    <Text style={[styles.filterPillText, { color: active ? h.color : theme.colors.textSecondary }]}>
                                        {h.title}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                )}

                {/* Journal entries grouped by date */}
                {dateKeys.length === 0 ? (
                    <View style={styles.emptyState}>
                        <View style={[styles.emptyIcon, { backgroundColor: theme.colors.primary + '15' }]}>
                            <Text style={{ fontSize: 40 }}>📖</Text>
                        </View>
                        <Text style={[styles.emptyTitle, { color: theme.colors.textPrimary }]}>
                            {allEntries.length === 0 ? 'No journal entries yet' : 'No matching entries'}
                        </Text>
                        <Text style={[styles.emptySub, { color: theme.colors.textSecondary }]}>
                            {allEntries.length === 0
                                ? 'Complete a habit and long-press to add your first journal entry'
                                : 'Try a different search or filter'}
                        </Text>
                    </View>
                ) : (
                    dateKeys.map((date) => (
                        <View key={date} style={styles.dateGroup}>
                            {/* Date header */}
                            <View style={styles.dateHeader}>
                                <View style={[styles.dateLine, { backgroundColor: theme.colors.border }]} />
                                <View style={[styles.datePill, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                                    <Ionicons name="calendar-outline" size={11} color={theme.colors.textTertiary} />
                                    <Text style={[styles.dateText, { color: theme.colors.textSecondary }]}>
                                        {formatDate(date)}
                                    </Text>
                                </View>
                                <View style={[styles.dateLine, { backgroundColor: theme.colors.border }]} />
                            </View>

                            {/* Entries for this date */}
                            {groupedByDate[date].map((entry) => {
                                const moodData = entry.mood ? MOODS.find((m) => m.emoji === entry.mood) : null;
                                return (
                                    <TouchableOpacity
                                        key={entry.habitId}
                                        onPress={() => openEdit(entry)}
                                        activeOpacity={0.8}
                                        style={[
                                            styles.entryCard,
                                            {
                                                backgroundColor: theme.colors.card,
                                                borderColor: theme.colors.border,
                                            },
                                        ]}
                                    >
                                        {/* Colored left accent */}
                                        <View style={[styles.entryAccent, { backgroundColor: entry.habitColor }]} />

                                        {/* Habit icon */}
                                        <View style={[styles.entryIconWrap, { backgroundColor: entry.habitColor + '20' }]}>
                                            <Ionicons name={entry.habitIcon as any} size={18} color={entry.habitColor} />
                                        </View>

                                        {/* Content */}
                                        <View style={styles.entryBody}>
                                            <View style={styles.entryTop}>
                                                <Text style={[styles.entryHabitName, { color: theme.colors.textSecondary }]}>
                                                    {entry.habitTitle}
                                                </Text>
                                                {moodData && (
                                                    <View style={[styles.moodBadge, { backgroundColor: moodData.color + '20' }]}>
                                                        <Text style={styles.moodBadgeText}>{moodData.emoji}</Text>
                                                        <Text style={[styles.moodBadgeLabel, { color: moodData.color }]}>
                                                            {moodData.label}
                                                        </Text>
                                                    </View>
                                                )}
                                            </View>
                                            <Text style={[styles.entryNoteText, { color: theme.colors.textPrimary }]}>
                                                {entry.note}
                                            </Text>
                                        </View>

                                        {/* Edit icon */}
                                        <Ionicons name="pencil-outline" size={14} color={theme.colors.textTertiary} style={styles.editIcon} />
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    ))
                )}

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Edit modal */}
            {editingEntry && (
                <NoteJournalModal
                    visible={journalModalVisible}
                    onClose={() => {
                        setJournalModalVisible(false);
                        setEditingEntry(null);
                    }}
                    onSave={handleSaveNote}
                    habitTitle={editingEntry.habitTitle}
                    habitColor={editingEntry.habitColor}
                    habitIcon={editingEntry.habitIcon}
                    date={editingEntry.date}
                    existingNote={editingEntry.note}
                    existingMood={editingEntry.mood ?? ''}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },

    headerRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingTop: 52, paddingHorizontal: 20, paddingBottom: 16 },
    backBtn: { padding: 4 },
    pageTitle: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
    pageSubtitle: { fontSize: 12, fontWeight: '500', marginTop: 2 },

    statsCard: {
        marginHorizontal: 16,
        marginBottom: 12,
        borderRadius: 16,
        borderWidth: 1,
        padding: 16,
        overflow: 'hidden',
    },
    statsInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
    statItem: { alignItems: 'center', flex: 1 },
    statValue: { fontSize: 22, fontWeight: '800' },
    statLabel: { fontSize: 11, fontWeight: '500', marginTop: 2, textAlign: 'center' },
    statDivider: { width: 1, height: 40 },

    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginHorizontal: 16,
        marginBottom: 10,
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
    searchInput: { flex: 1, fontSize: 14, fontWeight: '500' },

    filterScroll: { marginBottom: 12 },
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

    emptyState: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 24 },
    emptyIcon: { width: 88, height: 88, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
    emptySub: { fontSize: 14, textAlign: 'center', lineHeight: 22 },

    dateGroup: { marginBottom: 4 },
    dateHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginVertical: 12, gap: 10 },
    dateLine: { flex: 1, height: 1 },
    datePill: {
        flexDirection: 'row', alignItems: 'center', gap: 5,
        paddingHorizontal: 10, paddingVertical: 5, borderRadius: 99, borderWidth: 1,
    },
    dateText: { fontSize: 11, fontWeight: '600' },

    entryCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginHorizontal: 16,
        marginBottom: 8,
        borderRadius: 16,
        borderWidth: 1,
        padding: 14,
        overflow: 'hidden',
    },
    entryAccent: {
        position: 'absolute',
        left: 0, top: 0, bottom: 0,
        width: 4,
        borderTopLeftRadius: 16,
        borderBottomLeftRadius: 16,
    },
    entryIconWrap: {
        width: 38, height: 38,
        borderRadius: 11,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
        marginRight: 12,
        flexShrink: 0,
    },
    entryBody: { flex: 1, minWidth: 0 },
    entryTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
    entryHabitName: { fontSize: 11, fontWeight: '600', flex: 1 },
    moodBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 99 },
    moodBadgeText: { fontSize: 11 },
    moodBadgeLabel: { fontSize: 9, fontWeight: '700' },
    entryNoteText: { fontSize: 13, lineHeight: 20 },
    editIcon: { marginLeft: 8, marginTop: 2 },
});
