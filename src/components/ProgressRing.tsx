import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { useTheme } from '../hooks/useTheme';

// AnimatedCircle using RN's built-in animation (no Reanimated needed)
interface ProgressRingProps {
    progress: number; // 0-1
    size?: number;
    strokeWidth?: number;
    label?: string;
    sublabel?: string;
    gradientColors?: [string, string];
}

export function ProgressRing({
    progress,
    size = 120,
    strokeWidth = 10,
    label,
    sublabel,
    gradientColors,
}: ProgressRingProps) {
    const theme = useTheme();
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const animatedAngle = useRef(new Animated.Value(0)).current;
    const gradId = 'pg';
    const colors: [string, string] = gradientColors ?? [theme.colors.primary, theme.colors.primaryLight];

    useEffect(() => {
        Animated.timing(animatedAngle, {
            toValue: progress,
            duration: 1200,
            useNativeDriver: false,
        }).start();
    }, [progress]);

    // We will render SVG statically at the current progress value (no animated SVG props needed)
    // The label changes live; SVG drawn at target progress after a short delay via state
    const [displayProgress, setDisplayProgress] = React.useState(0);
    useEffect(() => {
        const timeout = setTimeout(() => setDisplayProgress(progress), 50);
        return () => clearTimeout(timeout);
    }, [progress]);

    const strokeDashoffset = circumference * (1 - displayProgress);

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            <Svg width={size} height={size}>
                <Defs>
                    <SvgGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
                        <Stop offset="0%" stopColor={colors[0]} />
                        <Stop offset="100%" stopColor={colors[1]} />
                    </SvgGradient>
                </Defs>
                {/* Track */}
                <Circle
                    cx={size / 2} cy={size / 2} r={radius}
                    stroke={theme.colors.border}
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                {/* Progress */}
                <Circle
                    cx={size / 2} cy={size / 2} r={radius}
                    stroke={`url(#${gradId})`}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                />
            </Svg>
            <View style={styles.center}>
                {label && <Text style={[styles.label, { color: theme.colors.textPrimary }]}>{label}</Text>}
                {sublabel && <Text style={[styles.sublabel, { color: theme.colors.textSecondary }]}>{sublabel}</Text>}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { alignItems: 'center', justifyContent: 'center' },
    center: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
    label: { fontSize: 20, fontWeight: '700' },
    sublabel: { fontSize: 11, fontWeight: '500', marginTop: 2 },
});
