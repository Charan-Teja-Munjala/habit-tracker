import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../hooks/useTheme';
import { levelFromXP, xpProgress, xpToNextLevel, getLevelTitle } from '../utils/xpUtils';

interface XPBarProps {
    xp: number;
    compact?: boolean;
}

export function XPBar({ xp, compact = false }: XPBarProps) {
    const theme = useTheme();
    const level = levelFromXP(xp);
    const progress = xpProgress(xp);
    const toNext = xpToNextLevel(xp);
    const title = getLevelTitle(level);
    const barWidth = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(barWidth, {
            toValue: progress,
            duration: 1200,
            useNativeDriver: false, // width % needs layout animation
        }).start();
    }, [progress]);

    const widthInterpolated = barWidth.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    if (compact) {
        return (
            <View style={[styles.track, { backgroundColor: theme.colors.border, height: 6 }]}>
                <Animated.View style={[styles.fill, { width: widthInterpolated, overflow: 'hidden' }]}>
                    <LinearGradient
                        colors={theme.colors.gradientPrimary}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={StyleSheet.absoluteFillObject}
                    />
                </Animated.View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={[styles.levelBadge, { backgroundColor: theme.colors.primary }]}>
                    <Text style={styles.levelText}>Lv {level}</Text>
                </View>
                <View style={{ flex: 1, marginHorizontal: 12 }}>
                    <View style={styles.labelRow}>
                        <Text style={[styles.titleText, { color: theme.colors.textPrimary }]}>{title}</Text>
                        <Text style={[styles.xpLabel, { color: theme.colors.textSecondary }]}>{toNext} XP to next</Text>
                    </View>
                    <View style={[styles.track, { backgroundColor: theme.colors.border }]}>
                        <Animated.View style={[styles.fill, { width: widthInterpolated, overflow: 'hidden' }]}>
                            <LinearGradient
                                colors={theme.colors.gradientPrimary}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={StyleSheet.absoluteFillObject}
                            />
                        </Animated.View>
                    </View>
                </View>
                <Text style={[styles.xpTotal, { color: theme.colors.primary }]}>{xp} XP</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { width: '100%' },
    header: { flexDirection: 'row', alignItems: 'center' },
    labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    levelBadge: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    levelText: { color: '#fff', fontSize: 13, fontWeight: '700' },
    titleText: { fontSize: 14, fontWeight: '600' },
    xpLabel: { fontSize: 11, fontWeight: '500' },
    track: { height: 8, borderRadius: 99, overflow: 'hidden' },
    fill: { height: '100%', borderRadius: 99 },
    xpTotal: { fontSize: 13, fontWeight: '700', marginLeft: 8 },
});
