import React, { useCallback, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    PanResponder,
    Animated as RNAnimated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Habit } from '../types';
import { useTheme } from '../hooks/useTheme';
import { useHaptics } from '../hooks/useHaptics';
import { useHabitStore } from '../store/habitStore';
import { useUserStore } from '../store/userStore';
import { StreakCounter } from './StreakCounter';
import { TODAY } from '../utils/dateUtils';
import { isStreakAtRisk } from '../utils/streakUtils';

interface HabitCardProps {
    habit: Habit;
    onPress?: (habit: Habit) => void;
    onLongPress?: (habit: Habit) => void;
}

const SWIPE_THRESHOLD = 80;

export function HabitCard({ habit, onPress, onLongPress }: HabitCardProps) {
    const theme = useTheme();
    const haptics = useHaptics();
    const { markComplete, unmarkComplete } = useHabitStore();
    const addXP = useUserStore((s) => s.addXP);

    const isCompleted = habit.completedDates.includes(TODAY());
    const atRisk = isStreakAtRisk(habit.completedDates);

    const translateX = useRef(new RNAnimated.Value(0)).current;
    const checkScale = useRef(new RNAnimated.Value(1)).current;

    const handleComplete = useCallback(() => {
        if (isCompleted) {
            unmarkComplete(habit.id);
            haptics.light();
            return;
        }
        haptics.success();
        RNAnimated.sequence([
            RNAnimated.spring(checkScale, { toValue: 1.4, useNativeDriver: true, speed: 40, bounciness: 16 }),
            RNAnimated.spring(checkScale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 8 }),
        ]).start();
        const result = markComplete(habit.id);
        addXP(result.xpEarned);
    }, [isCompleted, habit.id]);

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > 10 && Math.abs(gs.dy) < 20,
            onPanResponderMove: (_, gs) => {
                if (gs.dx > 0 && gs.dx < 130) {
                    translateX.setValue(gs.dx);
                }
            },
            onPanResponderRelease: (_, gs) => {
                if (gs.dx > SWIPE_THRESHOLD && !isCompleted) {
                    RNAnimated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
                    handleComplete();
                } else {
                    RNAnimated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
                }
            },
        })
    ).current;

    return (
        <View style={styles.wrapper}>
            {/* Swipe hint under card */}
            <View style={[styles.swipeHint, { backgroundColor: theme.colors.success + '25' }]}>
                <Ionicons name="checkmark-circle" size={24} color={theme.colors.success} />
                <Text style={{ color: theme.colors.success, fontWeight: '600', marginLeft: 6, fontSize: 13 }}>Complete</Text>
            </View>

            <RNAnimated.View style={{ transform: [{ translateX }] }} {...panResponder.panHandlers}>
                <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => onPress?.(habit)}
                    onLongPress={() => onLongPress?.(habit)}
                >
                    <View
                        style={[
                            styles.card,
                            {
                                backgroundColor: theme.colors.card,
                                borderColor: isCompleted ? habit.color + '60' : theme.colors.glassBorder,
                                opacity: isCompleted ? 0.72 : 1,
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
                        </View>

                        {/* Checkbox */}
                        <TouchableOpacity
                            onPress={handleComplete}
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
    title: { fontSize: 15, fontWeight: '600', marginBottom: 6 },
    meta: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
    xpBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 },
    xpText: { fontSize: 10, fontWeight: '700' },
    categoryPill: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 },
    categoryText: { fontSize: 10, fontWeight: '600' },
    checkbox: {
        width: 26, height: 26,
        borderRadius: 8,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
    },
});
