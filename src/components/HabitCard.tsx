import React, { useCallback, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    PanResponder,
    Animated as RNAnimated,
    Modal,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Habit } from '../types';
import { useTheme } from '../hooks/useTheme';
import { useHaptics } from '../hooks/useHaptics';
import { useHabitStore } from '../store/habitStore';
import { useUserStore } from '../store/userStore';
import { StreakCounter } from './StreakCounter';
import { XPPopup } from './XPPopup';
import { TODAY } from '../utils/dateUtils';
import { isStreakAtRisk } from '../utils/streakUtils';
import { ACHIEVEMENTS } from '../constants/habits';

interface HabitCardProps {
    habit: Habit;
    onPress?: (habit: Habit) => void;
    onLongPress?: (habit: Habit) => void;
    onAchievementUnlocked?: (id: string) => void;
    onLevelUp?: (level: number) => void;
}

const SWIPE_THRESHOLD = 80;

export function HabitCard({ habit, onPress, onLongPress, onAchievementUnlocked, onLevelUp }: HabitCardProps) {
    const theme = useTheme();
    const haptics = useHaptics();
    const { markComplete, unmarkComplete, getActiveHabits, addNote } = useHabitStore();
    const addXP = useUserStore((s) => s.addXP);
    const profile = useUserStore((s) => s.profile);
    const checkAchievements = useUserStore((s) => s.checkAchievements);

    const today = TODAY();
    const isCompleted = habit.completedDates.includes(today);
    const atRisk = isStreakAtRisk(habit.completedDates);

    const translateX = useRef(new RNAnimated.Value(0)).current;
    const checkScale = useRef(new RNAnimated.Value(1)).current;

    const [showXP, setShowXP] = useState(false);
    const [noteModalVisible, setNoteModalVisible] = useState(false);
    const [noteText, setNoteText] = useState(habit.notes?.[today] ?? '');

    const handleComplete = useCallback(() => {
        if (isCompleted) {
            unmarkComplete(habit.id);
            haptics.light();
            return;
        }

        haptics.success();

        // Spring animation on checkbox
        RNAnimated.sequence([
            RNAnimated.spring(checkScale, { toValue: 1.4, useNativeDriver: true, speed: 40, bounciness: 16 }),
            RNAnimated.spring(checkScale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 8 }),
        ]).start();

        // Mark complete with current XP so leveledUp can be computed
        const result = markComplete(habit.id, profile.totalXP);
        const { newLevel, didLevelUp } = addXP(result.xpEarned);

        setShowXP(true);

        if (didLevelUp) {
            onLevelUp?.(newLevel);
        }

        // Check achievements
        const allHabits = getActiveHabits();
        const totalCompletions = allHabits.reduce((s, h) => s + h.completedDates.length, 0) + 1;
        const maxStreak = Math.max(...allHabits.map((h) => h.longestStreak), result.newStreak);
        const newlyUnlocked = checkAchievements(totalCompletions, maxStreak, allHabits.length);

        if (newlyUnlocked.length > 0) {
            onAchievementUnlocked?.(newlyUnlocked[0]);
        }
    }, [isCompleted, habit.id, profile.totalXP]);

    const handleLongPress = () => {
        if (!isCompleted) {
            onLongPress?.(habit);
            return;
        }
        // Long press on completed habit → add/edit note
        setNoteText(habit.notes?.[today] ?? '');
        setNoteModalVisible(true);
    };

    const saveNote = () => {
        if (noteText.trim()) {
            addNote(habit.id, today, noteText.trim());
        }
        setNoteModalVisible(false);
    };

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > 10 && Math.abs(gs.dy) < 20,
            onPanResponderMove: (_, gs) => {
                if (gs.dx > 0 && gs.dx < 130) {
                    translateX.setValue(gs.dx);
                }
            },
            onPanResponderRelease: (_, gs) => {
                if (gs.dx > SWIPE_THRESHOLD) {
                    RNAnimated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
                    handleComplete();
                } else {
                    RNAnimated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
                }
            },
        })
    ).current;

    const todayNote = habit.notes?.[today];

    return (
        <View style={styles.wrapper}>
            {/* Swipe hint under card */}
            <View style={[styles.swipeHint, { backgroundColor: theme.colors.success + '25' }]}>
                <Ionicons name="checkmark-circle" size={24} color={theme.colors.success} />
                <Text style={{ color: theme.colors.success, fontWeight: '600', marginLeft: 6, fontSize: 13 }}>Complete</Text>
            </View>

            {/* XP popup */}
            {showXP && (
                <XPPopup
                    xp={habit.xpReward}
                    color={habit.color}
                    onDone={() => setShowXP(false)}
                />
            )}

            <RNAnimated.View style={{ transform: [{ translateX }] }} {...panResponder.panHandlers}>
                <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => onPress?.(habit)}
                    onLongPress={handleLongPress}
                    delayLongPress={400}
                >
                    <View
                        style={[
                            styles.card,
                            {
                                backgroundColor: theme.colors.card,
                                borderColor: isCompleted ? habit.color + '60' : theme.colors.glassBorder,
                                opacity: isCompleted ? 0.75 : 1,
                            },
                        ]}
                    >
                        {/* Left color accent */}
                        <View style={[styles.accent, { backgroundColor: habit.color }]} />

                        {/* Icon */}
                        <View style={[styles.iconWrap, { backgroundColor: habit.color + '20' }]}>
                            <Ionicons name={habit.icon as any} size={22} color={habit.color} />
                        </View>

                        {/* Content */}
                        <View style={styles.content}>
                            <Text
                                style={[
                                    styles.title,
                                    {
                                        color: theme.colors.textPrimary,
                                        textDecorationLine: isCompleted ? 'line-through' : 'none',
                                    },
                                ]}
                                numberOfLines={1}
                            >
                                {habit.title}
                            </Text>
                            <View style={styles.meta}>
                                <StreakCounter streak={habit.streak} atRisk={atRisk} size="sm" />
                                <View style={[styles.xpBadge, { backgroundColor: theme.colors.primary + '25' }]}>
                                    <Text style={[styles.xpText, { color: theme.colors.primary }]}>+{habit.xpReward} XP</Text>
                                </View>
                                <View style={[styles.categoryPill, { backgroundColor: habit.color + '20' }]}>
                                    <Text style={[styles.categoryText, { color: habit.color }]}>{habit.category}</Text>
                                </View>
                            </View>
                            {/* Show note if exists */}
                            {todayNote ? (
                                <Text style={[styles.noteText, { color: theme.colors.textTertiary }]} numberOfLines={1}>
                                    💬 {todayNote}
                                </Text>
                            ) : null}
                        </View>

                        {/* Streak at risk shield */}
                        {atRisk && (
                            <View style={[styles.riskBadge, { backgroundColor: theme.colors.warning + '25' }]}>
                                <Ionicons name="shield-outline" size={14} color={theme.colors.warning} />
                            </View>
                        )}

                        {/* Checkbox */}
                        <TouchableOpacity
                            onPress={handleComplete}
                            onLongPress={handleLongPress}
                            delayLongPress={400}
                            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                        >
                            <RNAnimated.View
                                style={[
                                    styles.checkbox,
                                    {
                                        backgroundColor: isCompleted ? habit.color : 'transparent',
                                        borderColor: isCompleted ? habit.color : theme.colors.border,
                                        transform: [{ scale: checkScale }],
                                    },
                                ]}
                            >
                                {isCompleted && <Ionicons name="checkmark" size={14} color="#fff" />}
                            </RNAnimated.View>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </RNAnimated.View>

            {/* Note modal */}
            <Modal
                visible={noteModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setNoteModalVisible(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalOverlay}
                >
                    <View style={[styles.modalCard, { backgroundColor: theme.colors.card }]}>
                        <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>
                            Note for Today
                        </Text>
                        <TextInput
                            style={[styles.noteInput, { backgroundColor: theme.colors.surface, color: theme.colors.textPrimary, borderColor: theme.colors.border }]}
                            placeholder="How did it go? Add a quick note..."
                            placeholderTextColor={theme.colors.textTertiary}
                            value={noteText}
                            onChangeText={setNoteText}
                            multiline
                            maxLength={200}
                            autoFocus
                        />
                        <View style={styles.modalBtns}>
                            <TouchableOpacity
                                style={[styles.modalBtn, { borderColor: theme.colors.border }]}
                                onPress={() => setNoteModalVisible(false)}
                            >
                                <Text style={{ color: theme.colors.textSecondary, fontWeight: '600' }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalBtn, { backgroundColor: habit.color, borderColor: habit.color }]}
                                onPress={saveNote}
                            >
                                <Text style={{ color: '#fff', fontWeight: '700' }}>Save Note</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: { position: 'relative', marginVertical: 5 },
    swipeHint: {
        position: 'absolute',
        top: 0, left: 16, right: 16, bottom: 0,
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 20,
        borderRadius: 16,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        borderRadius: 16,
        borderWidth: 1,
        padding: 14,
        overflow: 'hidden',
    },
    accent: {
        position: 'absolute',
        left: 0, top: 0, bottom: 0,
        width: 4,
        borderTopLeftRadius: 16,
        borderBottomLeftRadius: 16,
    },
    iconWrap: {
        width: 44, height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
        marginRight: 12,
    },
    content: { flex: 1, minWidth: 0 },
    title: { fontSize: 15, fontWeight: '600', marginBottom: 5 },
    meta: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 5 },
    xpBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 },
    xpText: { fontSize: 10, fontWeight: '700' },
    categoryPill: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 },
    categoryText: { fontSize: 10, fontWeight: '600' },
    noteText: { fontSize: 10, marginTop: 4, fontStyle: 'italic' },
    riskBadge: { padding: 4, borderRadius: 8, marginRight: 6 },
    checkbox: {
        width: 26, height: 26,
        borderRadius: 8,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    modalCard: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
    },
    modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 14, textAlign: 'center' },
    noteInput: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 14,
        fontSize: 14,
        minHeight: 90,
        textAlignVertical: 'top',
        marginBottom: 16,
    },
    modalBtns: { flexDirection: 'row', gap: 10 },
    modalBtn: {
        flex: 1,
        paddingVertical: 13,
        borderRadius: 12,
        borderWidth: 1.5,
        alignItems: 'center',
    },
});
