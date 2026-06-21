import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Animated,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../hooks/useTheme';
import { formatDate } from '../utils/dateUtils';

export const MOODS = [
    { emoji: '😔', label: 'Rough', color: '#EF4444' },
    { emoji: '😐', label: 'Okay', color: '#F59E0B' },
    { emoji: '😊', label: 'Good', color: '#10B981' },
    { emoji: '😄', label: 'Great', color: '#6366F1' },
    { emoji: '🔥', label: 'Amazing', color: '#F97316' },
];

const PROMPTS = [
    'What did you do today?',
    'How did it go?',
    'What did you learn?',
    'Any challenges you faced?',
    'What are you proud of?',
];

interface NoteJournalModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (note: string, mood: string) => void;
    habitTitle: string;
    habitColor: string;
    habitIcon: string;
    date: string;
    existingNote?: string;
    existingMood?: string;
}

export function NoteJournalModal({
    visible,
    onClose,
    onSave,
    habitTitle,
    habitColor,
    habitIcon,
    date,
    existingNote = '',
    existingMood = '',
}: NoteJournalModalProps) {
    const theme = useTheme();
    const [noteText, setNoteText] = useState(existingNote);
    const [selectedMood, setSelectedMood] = useState(existingMood);
    const slideAnim = useRef(new Animated.Value(400)).current;
    const backdropOpacity = useRef(new Animated.Value(0)).current;

    const promptIndex = useRef(Math.floor(Math.random() * PROMPTS.length)).current;

    useEffect(() => {
        if (visible) {
            setNoteText(existingNote);
            setSelectedMood(existingMood);
            Animated.parallel([
                Animated.spring(slideAnim, {
                    toValue: 0,
                    useNativeDriver: true,
                    tension: 65,
                    friction: 11,
                }),
                Animated.timing(backdropOpacity, {
                    toValue: 1,
                    duration: 250,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: 400,
                    duration: 220,
                    useNativeDriver: true,
                }),
                Animated.timing(backdropOpacity, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible, existingNote, existingMood]);

    const handleSave = () => {
        onSave(noteText.trim(), selectedMood);
        onClose();
    };

    const handleClose = () => {
        onClose();
    };

    const selectedMoodData = MOODS.find((m) => m.emoji === selectedMood);
    const charCount = noteText.length;
    const MAX_CHARS = 300;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={handleClose}
            statusBarTranslucent
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.flex}
            >
                <Animated.View
                    style={[styles.backdrop, { opacity: backdropOpacity }]}
                >
                    <TouchableOpacity style={styles.flex} onPress={handleClose} activeOpacity={1} />
                </Animated.View>

                <Animated.View
                    style={[
                        styles.sheet,
                        {
                            backgroundColor: theme.colors.card,
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    {/* Handle bar */}
                    <View style={styles.handleWrap}>
                        <View style={[styles.handle, { backgroundColor: theme.colors.border }]} />
                    </View>

                    {/* Header */}
                    <View style={styles.header}>
                        <View style={[styles.habitIconWrap, { backgroundColor: habitColor + '20' }]}>
                            <Ionicons name={habitIcon as any} size={20} color={habitColor} />
                        </View>
                        <View style={styles.headerText}>
                            <Text style={[styles.habitName, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                                {habitTitle}
                            </Text>
                            <Text style={[styles.dateLabel, { color: theme.colors.textTertiary }]}>
                                {formatDate(date)} · Journal Entry
                            </Text>
                        </View>
                        <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                            <Ionicons name="close" size={20} color={theme.colors.textTertiary} />
                        </TouchableOpacity>
                    </View>

                    {/* Mood picker */}
                    <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>
                        How did it feel?
                    </Text>
                    <View style={styles.moodRow}>
                        {MOODS.map((mood) => {
                            const isSelected = selectedMood === mood.emoji;
                            return (
                                <TouchableOpacity
                                    key={mood.emoji}
                                    onPress={() => setSelectedMood(isSelected ? '' : mood.emoji)}
                                    style={[
                                        styles.moodBtn,
                                        {
                                            backgroundColor: isSelected ? mood.color + '20' : theme.colors.surface,
                                            borderColor: isSelected ? mood.color : theme.colors.border,
                                            borderWidth: isSelected ? 2 : 1,
                                        },
                                    ]}
                                    activeOpacity={0.75}
                                >
                                    <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                                    <Text
                                        style={[
                                            styles.moodLabel,
                                            { color: isSelected ? mood.color : theme.colors.textTertiary },
                                        ]}
                                    >
                                        {mood.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Note input */}
                    <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>
                        What happened?
                    </Text>
                    <View
                        style={[
                            styles.inputWrap,
                            {
                                backgroundColor: theme.colors.surface,
                                borderColor: noteText.length > 0 ? habitColor + '60' : theme.colors.border,
                            },
                        ]}
                    >
                        <TextInput
                            style={[styles.textInput, { color: theme.colors.textPrimary }]}
                            placeholder={PROMPTS[promptIndex]}
                            placeholderTextColor={theme.colors.textTertiary}
                            value={noteText}
                            onChangeText={(t) => setNoteText(t.slice(0, MAX_CHARS))}
                            multiline
                            textAlignVertical="top"
                            autoFocus={false}
                        />
                        <Text
                            style={[
                                styles.charCount,
                                {
                                    color: charCount > MAX_CHARS * 0.85
                                        ? theme.colors.warning
                                        : theme.colors.textTertiary,
                                },
                            ]}
                        >
                            {charCount}/{MAX_CHARS}
                        </Text>
                    </View>

                    {/* Save button */}
                    <TouchableOpacity
                        onPress={handleSave}
                        activeOpacity={0.85}
                        style={[styles.saveBtn, { overflow: 'hidden' }]}
                    >
                        <LinearGradient
                            colors={[habitColor, habitColor + 'BB']}
                            style={StyleSheet.absoluteFillObject}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        />
                        <Ionicons name="journal-outline" size={18} color="#fff" />
                        <Text style={styles.saveBtnText}>
                            {noteText.trim() || selectedMood ? 'Save Journal Entry' : 'Skip & Close'}
                        </Text>
                    </TouchableOpacity>

                    {/* Selected mood summary */}
                    {selectedMoodData && (
                        <Text style={[styles.moodSummary, { color: selectedMoodData.color }]}>
                            {selectedMoodData.emoji} Feeling {selectedMoodData.label.toLowerCase()} today
                        </Text>
                    )}

                    <View style={{ height: Platform.OS === 'ios' ? 24 : 12 }} />
                </Animated.View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.55)',
    },
    sheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 20,
    },
    handleWrap: { alignItems: 'center', paddingTop: 12, paddingBottom: 4 },
    handle: { width: 36, height: 4, borderRadius: 2 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        gap: 12,
    },
    habitIconWrap: {
        width: 40, height: 40, borderRadius: 12,
        alignItems: 'center', justifyContent: 'center',
    },
    headerText: { flex: 1 },
    habitName: { fontSize: 15, fontWeight: '700' },
    dateLabel: { fontSize: 11, fontWeight: '500', marginTop: 2 },
    closeBtn: { padding: 4 },

    sectionLabel: { fontSize: 12, fontWeight: '600', letterSpacing: 0.5, marginBottom: 10, marginTop: 4 },

    moodRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16,
    },
    moodBtn: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 10,
        borderRadius: 14,
        gap: 4,
    },
    moodEmoji: { fontSize: 22 },
    moodLabel: { fontSize: 9, fontWeight: '700' },

    inputWrap: {
        borderRadius: 16,
        borderWidth: 1.5,
        padding: 14,
        marginBottom: 16,
    },
    textInput: {
        fontSize: 14,
        lineHeight: 22,
        minHeight: 90,
    },
    charCount: {
        fontSize: 10,
        fontWeight: '600',
        textAlign: 'right',
        marginTop: 6,
    },

    saveBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 16,
        borderRadius: 16,
        marginBottom: 8,
    },
    saveBtnText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#fff',
    },
    moodSummary: {
        textAlign: 'center',
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 4,
    },
});
