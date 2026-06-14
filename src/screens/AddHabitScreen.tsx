import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../hooks/useTheme';
import { useHabitStore } from '../store/habitStore';
import { AnimatedButton } from '../components/AnimatedButton';
import { DaySelector } from '../components/DaySelector';
import { CATEGORIES, HABIT_COLORS, HABIT_ICONS } from '../constants/habits';
import { Category, Frequency } from '../types';
import { useHaptics } from '../hooks/useHaptics';

interface Props {
    navigation: any;
    route?: { params?: { habitId?: string } };
}

const XP_PRESETS = [10, 20, 30, 50, 75, 100];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

function formatHour(h: number) {
    const suffix = h < 12 ? 'AM' : 'PM';
    const display = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${display}:00 ${suffix}`;
}

export function AddHabitScreen({ navigation, route }: Props) {
    const theme = useTheme();
    const haptics = useHaptics();
    const { addHabit, editHabit, getHabitById } = useHabitStore();

    const editingId = route?.params?.habitId;
    const existing = editingId ? getHabitById(editingId) : undefined;

    const [title, setTitle] = useState(existing?.title || '');
    const [description, setDescription] = useState(existing?.description || '');
    const [category, setCategory] = useState<Category>(existing?.category || 'Health');
    const [selectedIcon, setSelectedIcon] = useState(existing?.icon || HABIT_ICONS[0]);
    const [selectedColor, setSelectedColor] = useState(existing?.color || HABIT_COLORS[0]);
    const [frequency, setFrequency] = useState<Frequency>(existing?.frequency || 'daily');
    const [customDays, setCustomDays] = useState<number[]>(existing?.customDays ?? [1, 2, 3, 4, 5]);
    const [xpReward, setXpReward] = useState(existing?.xpReward ?? 20);
    const [reminderEnabled, setReminderEnabled] = useState(existing?.reminderTime != null);
    const [reminderHour, setReminderHour] = useState(existing?.reminderTime?.hour ?? 8);
    const [showHourPicker, setShowHourPicker] = useState(false);

    const handleSave = () => {
        if (!title.trim()) return;
        const data = {
            title: title.trim(),
            description: description.trim(),
            category,
            icon: selectedIcon,
            color: selectedColor,
            frequency,
            customDays: frequency !== 'daily' ? customDays : undefined,
            xpReward,
            reminderTime: reminderEnabled ? { hour: reminderHour, minute: 0 } : null,
        };

        if (editingId) {
            editHabit(editingId, data);
        } else {
            addHabit(data);
        }
        haptics.success();
        navigation.goBack();
    };

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
                    {editingId ? 'Edit Habit' : 'New Habit'}
                </Text>
                <TouchableOpacity onPress={handleSave} disabled={!title.trim()}>
                    <Text style={[styles.saveBtn, { color: title.trim() ? theme.colors.primary : theme.colors.textTertiary }]}>Save</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                {/* Icon preview */}
                <View style={styles.previewWrap}>
                    <View style={[styles.previewIcon, { backgroundColor: selectedColor + '25', borderColor: selectedColor + '60', borderWidth: 2 }]}>
                        <Ionicons name={selectedIcon as any} size={44} color={selectedColor} />
                    </View>
                    <Text style={[styles.previewTitle, { color: theme.colors.textSecondary }]}>
                        {title || 'My Habit'}
                    </Text>
                </View>

                {/* Title */}
                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Habit Name *</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.textPrimary, borderColor: theme.colors.border }]}
                    placeholder="e.g. Morning Meditation"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={title}
                    onChangeText={setTitle}
                />

                {/* Description */}
                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Description</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.textPrimary, borderColor: theme.colors.border, height: 70 }]}
                    placeholder="Optional details..."
                    placeholderTextColor={theme.colors.textTertiary}
                    value={description}
                    onChangeText={setDescription}
                    multiline
                />

                {/* Category */}
                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
                    {CATEGORIES.map((cat) => (
                        <TouchableOpacity
                            key={cat.id}
                            onPress={() => setCategory(cat.id)}
                            style={[
                                styles.chip,
                                {
                                    backgroundColor: category === cat.id ? cat.color + '30' : theme.colors.card,
                                    borderColor: category === cat.id ? cat.color : theme.colors.border,
                                },
                            ]}
                        >
                            <Ionicons name={cat.icon as any} size={14} color={cat.color} />
                            <Text style={[styles.chipText, { color: category === cat.id ? cat.color : theme.colors.textSecondary }]}>
                                {cat.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Frequency */}
                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Frequency</Text>
                <View style={styles.freqRow}>
                    {(['daily', 'weekly', 'custom'] as Frequency[]).map((f) => (
                        <TouchableOpacity
                            key={f}
                            onPress={() => setFrequency(f)}
                            style={[
                                styles.freqBtn,
                                {
                                    backgroundColor: frequency === f ? theme.colors.primary : theme.colors.card,
                                    borderColor: frequency === f ? theme.colors.primary : theme.colors.border,
                                    flex: 1,
                                    marginHorizontal: 4,
                                },
                            ]}
                        >
                            <Text style={[styles.freqText, { color: frequency === f ? '#fff' : theme.colors.textSecondary }]}>
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Custom / Weekly day selector */}
                {(frequency === 'custom' || frequency === 'weekly') && (
                    <View style={[styles.daySelectorWrap, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                        <Text style={[styles.daySelectorLabel, { color: theme.colors.textSecondary }]}>
                            {frequency === 'weekly' ? 'Pick the day(s) of the week' : 'Choose your custom days'}
                        </Text>
                        <DaySelector
                            selectedDays={customDays}
                            onChange={setCustomDays}
                            accentColor={selectedColor}
                        />
                    </View>
                )}

                {/* Color picker */}
                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Color</Text>
                <View style={styles.colorGrid}>
                    {HABIT_COLORS.map((c) => (
                        <TouchableOpacity
                            key={c}
                            onPress={() => setSelectedColor(c)}
                            style={[
                                styles.colorSwatch,
                                { backgroundColor: c },
                                selectedColor === c && styles.colorSelected,
                            ]}
                        >
                            {selectedColor === c && <Ionicons name="checkmark" size={14} color="#fff" />}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Icon picker */}
                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Icon</Text>
                <View style={styles.iconGrid}>
                    {HABIT_ICONS.map((ic) => (
                        <TouchableOpacity
                            key={ic}
                            onPress={() => setSelectedIcon(ic)}
                            style={[
                                styles.iconBtn,
                                {
                                    backgroundColor: selectedIcon === ic ? selectedColor + '30' : theme.colors.card,
                                    borderColor: selectedIcon === ic ? selectedColor : theme.colors.border,
                                },
                            ]}
                        >
                            <Ionicons name={ic as any} size={20} color={selectedIcon === ic ? selectedColor : theme.colors.textTertiary} />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* XP Reward */}
                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>XP Reward</Text>
                <View style={styles.xpRow}>
                    {XP_PRESETS.map((xp) => (
                        <TouchableOpacity
                            key={xp}
                            onPress={() => setXpReward(xp)}
                            style={[
                                styles.xpPreset,
                                {
                                    backgroundColor: xpReward === xp ? theme.colors.warning + '25' : theme.colors.card,
                                    borderColor: xpReward === xp ? theme.colors.warning : theme.colors.border,
                                },
                            ]}
                        >
                            <Text style={[styles.xpPresetText, { color: xpReward === xp ? theme.colors.warning : theme.colors.textSecondary }]}>
                                +{xp}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <Text style={[styles.xpHint, { color: theme.colors.textTertiary }]}>
                    Current: +{xpReward} XP per completion
                </Text>

                {/* Per-habit Reminder */}
                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Reminder</Text>
                <View style={[styles.reminderCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                    <View style={styles.reminderRow}>
                        <View style={styles.reminderLeft}>
                            <Ionicons name="alarm-outline" size={20} color={theme.colors.primary} />
                            <View>
                                <Text style={[styles.reminderTitle, { color: theme.colors.textPrimary }]}>Daily Reminder</Text>
                                {reminderEnabled && (
                                    <Text style={[styles.reminderSub, { color: theme.colors.textSecondary }]}>
                                        at {formatHour(reminderHour)}
                                    </Text>
                                )}
                            </View>
                        </View>
                        <Switch
                            value={reminderEnabled}
                            onValueChange={setReminderEnabled}
                            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                            thumbColor="#fff"
                        />
                    </View>
                    {reminderEnabled && (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={{ marginTop: 12 }}
                        >
                            {HOURS.map((h) => (
                                <TouchableOpacity
                                    key={h}
                                    onPress={() => setReminderHour(h)}
                                    style={[
                                        styles.hourBtn,
                                        {
                                            backgroundColor: reminderHour === h ? theme.colors.primary : theme.colors.surface,
                                            borderColor: reminderHour === h ? theme.colors.primary : theme.colors.border,
                                        },
                                    ]}
                                >
                                    <Text style={[styles.hourBtnText, { color: reminderHour === h ? '#fff' : theme.colors.textSecondary }]}>
                                        {formatHour(h)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}
                </View>

                <View style={{ height: 20 }} />
                <AnimatedButton
                    title={editingId ? 'Save Changes' : 'Create Habit ✨'}
                    onPress={handleSave}
                    disabled={!title.trim()}
                    gradient={[selectedColor, selectedColor + 'BB']}
                    size="lg"
                />
                <View style={{ height: 40 }} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: 54, paddingBottom: 14, paddingHorizontal: 20, borderBottomWidth: 1,
    },
    headerTitle: { fontSize: 17, fontWeight: '700' },
    saveBtn: { fontSize: 16, fontWeight: '600' },
    content: { padding: 20 },
    previewWrap: { alignItems: 'center', marginBottom: 28 },
    previewIcon: {
        width: 88, height: 88, borderRadius: 26,
        alignItems: 'center', justifyContent: 'center', marginBottom: 10,
    },
    previewTitle: { fontSize: 16, fontWeight: '600' },
    label: { fontSize: 12, fontWeight: '600', letterSpacing: 0.5, marginBottom: 8, marginTop: 18, textTransform: 'uppercase' },
    input: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 15, fontWeight: '500' },
    chipRow: { marginBottom: 4 },
    chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 99, borderWidth: 1.5, marginRight: 8 },
    chipText: { fontSize: 13, fontWeight: '600' },
    freqRow: { flexDirection: 'row', marginHorizontal: -4 },
    freqBtn: { paddingVertical: 10, borderRadius: 12, borderWidth: 1.5, alignItems: 'center' },
    freqText: { fontSize: 13, fontWeight: '600' },
    daySelectorWrap: { marginTop: 12, padding: 14, borderRadius: 14, borderWidth: 1 },
    daySelectorLabel: { fontSize: 12, fontWeight: '500', marginBottom: 10 },
    colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 4 },
    colorSwatch: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    colorSelected: { borderWidth: 3, borderColor: '#fff' },
    iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    iconBtn: { width: 44, height: 44, borderRadius: 12, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
    xpRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    xpPreset: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 12, borderWidth: 1.5 },
    xpPresetText: { fontSize: 14, fontWeight: '700' },
    xpHint: { fontSize: 12, marginTop: 8 },
    reminderCard: { borderRadius: 14, borderWidth: 1, padding: 14 },
    reminderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    reminderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    reminderTitle: { fontSize: 15, fontWeight: '500' },
    reminderSub: { fontSize: 12, marginTop: 1 },
    hourBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5, marginRight: 8 },
    hourBtnText: { fontSize: 12, fontWeight: '600' },
});
