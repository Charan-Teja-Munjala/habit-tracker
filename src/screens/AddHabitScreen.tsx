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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../hooks/useTheme';
import { useHabitStore } from '../store/habitStore';
import { AnimatedButton } from '../components/AnimatedButton';
import { CATEGORIES, HABIT_COLORS, HABIT_ICONS } from '../constants/habits';
import { Category, Frequency } from '../types';
import { useHaptics } from '../hooks/useHaptics';

interface Props {
    navigation: any;
    route?: { params?: { habitId?: string } };
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
    const [xpReward, setXpReward] = useState(String(existing?.xpReward || 20));

    const handleSave = () => {
        if (!title.trim()) return;
        if (editingId) {
            editHabit(editingId, { title, description, category, icon: selectedIcon, color: selectedColor, frequency, xpReward: parseInt(xpReward) || 20 });
        } else {
            addHabit({ title, description, category, icon: selectedIcon, color: selectedColor, frequency, xpReward: parseInt(xpReward) || 20 });
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
                <TouchableOpacity onPress={handleSave}>
                    <Text style={[styles.saveBtn, { color: theme.colors.primary }]}>Save</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                {/* Icon preview */}
                <View style={styles.previewWrap}>
                    <View style={[styles.previewIcon, { backgroundColor: selectedColor + '25' }]}>
                        <Ionicons name={selectedIcon as any} size={40} color={selectedColor} />
                    </View>
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

                {/* XP */}
                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>XP Reward</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.textPrimary, borderColor: theme.colors.border }]}
                    value={xpReward}
                    onChangeText={setXpReward}
                    keyboardType="numeric"
                    maxLength={3}
                />

                <View style={{ height: 20 }} />
                <AnimatedButton
                    title={editingId ? 'Save Changes' : 'Create Habit ✨'}
                    onPress={handleSave}
                    disabled={!title.trim()}
                    gradient={['#6C63FF', '#9B59B6']}
                    size="lg"
                />
                <View style={{ height: 40 }} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 54, paddingBottom: 14, paddingHorizontal: 20, borderBottomWidth: 1 },
    headerTitle: { fontSize: 17, fontWeight: '700' },
    saveBtn: { fontSize: 16, fontWeight: '600' },
    content: { padding: 20 },
    previewWrap: { alignItems: 'center', marginBottom: 28 },
    previewIcon: { width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
    label: { fontSize: 12, fontWeight: '600', letterSpacing: 0.5, marginBottom: 8, marginTop: 18, textTransform: 'uppercase' },
    input: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 15, fontWeight: '500' },
    chipRow: { marginBottom: 4 },
    chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 99, borderWidth: 1.5, marginRight: 8 },
    chipText: { fontSize: 13, fontWeight: '600' },
    freqRow: { flexDirection: 'row', marginHorizontal: -4 },
    freqBtn: { paddingVertical: 10, borderRadius: 12, borderWidth: 1.5, alignItems: 'center' },
    freqText: { fontSize: 13, fontWeight: '600' },
    colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 4 },
    colorSwatch: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    colorSelected: { borderWidth: 3, borderColor: '#fff' },
    iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    iconBtn: { width: 44, height: 44, borderRadius: 12, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
});
