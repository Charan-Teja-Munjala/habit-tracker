import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';

interface StreakCounterProps {
    streak: number;
    atRisk?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export function StreakCounter({ streak, atRisk = false, size = 'md' }: StreakCounterProps) {
    const theme = useTheme();
    const scale = useRef(new Animated.Value(1)).current;
    const opacity = useRef(new Animated.Value(1)).current;
    const pulseAnim = useRef<Animated.CompositeAnimation | null>(null);

    const sizes = { sm: 18, md: 24, lg: 32 };
    const textSizes = { sm: 13, md: 16, lg: 22 };

    useEffect(() => {
        if (atRisk) {
            pulseAnim.current = Animated.loop(
                Animated.sequence([
                    Animated.timing(opacity, { toValue: 0.3, duration: 700, useNativeDriver: true }),
                    Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
                ])
            );
            pulseAnim.current.start();
        } else {
            pulseAnim.current?.stop();
            opacity.setValue(1);
        }
        return () => pulseAnim.current?.stop();
    }, [atRisk]);

    useEffect(() => {
        if (streak > 0) {
            Animated.sequence([
                Animated.spring(scale, { toValue: 1.3, useNativeDriver: true, speed: 40, bounciness: 16 }),
                Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 8 }),
            ]).start();
        }
    }, [streak]);

    const flameColor = atRisk
        ? theme.colors.warning
        : streak >= 7
            ? theme.colors.secondary
            : '#FF8C42';

    return (
        <View style={styles.container}>
            <Animated.View style={{ transform: [{ scale }], opacity }}>
                <Ionicons name="flame" size={sizes[size]} color={flameColor} />
            </Animated.View>
            <Text style={[styles.count, { color: theme.colors.textPrimary, fontSize: textSizes[size] }]}>
                {streak}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flexDirection: 'row', alignItems: 'center' },
    count: { fontWeight: '700', marginLeft: 3 },
});
