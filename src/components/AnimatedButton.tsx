import React, { useCallback } from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ViewStyle,
    TextStyle,
    ActivityIndicator,
    Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../hooks/useTheme';
import { useHaptics } from '../hooks/useHaptics';

interface AnimatedButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    disabled?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
    gradient?: [string, string];
    icon?: React.ReactNode;
}

export function AnimatedButton({
    title,
    onPress,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    style,
    textStyle,
    gradient,
    icon,
}: AnimatedButtonProps) {
    const theme = useTheme();
    const haptics = useHaptics();
    const scale = React.useRef(new Animated.Value(1)).current;

    const handlePressIn = useCallback(() => {
        haptics.light();
        Animated.spring(scale, { toValue: 0.95, useNativeDriver: true, speed: 40, bounciness: 0 }).start();
    }, []);

    const handlePressOut = useCallback(() => {
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 6 }).start();
    }, []);

    const handlePress = useCallback(() => {
        if (disabled || loading) return;
        onPress();
    }, [disabled, loading, onPress]);

    const sizeStyles = {
        sm: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
        md: { paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14 },
        lg: { paddingHorizontal: 32, paddingVertical: 18, borderRadius: 16 },
    };

    const textSizes = {
        sm: theme.fontSize.sm,
        md: theme.fontSize.md,
        lg: theme.fontSize.lg,
    };

    const getVariantStyle = (): ViewStyle => {
        switch (variant) {
            case 'primary': return { backgroundColor: theme.colors.primary };
            case 'secondary': return { backgroundColor: theme.colors.card };
            case 'outline': return { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: theme.colors.primary };
            case 'ghost': return { backgroundColor: 'transparent' };
        }
    };

    const getTextColor = (): string => {
        switch (variant) {
            case 'primary': return '#FFFFFF';
            case 'outline':
            case 'ghost': return theme.colors.primary;
            default: return theme.colors.textPrimary;
        }
    };

    return (
        <Animated.View style={{ transform: [{ scale }], ...(disabled ? { opacity: 0.5 } : {}) }}>
            <TouchableOpacity
                style={[
                    styles.base,
                    sizeStyles[size] as ViewStyle,
                    getVariantStyle(),
                    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
                    style,
                ]}
                onPress={handlePress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={1}
                disabled={disabled || loading}
            >
                {gradient && variant === 'primary' && (
                    <LinearGradient
                        colors={gradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={StyleSheet.absoluteFillObject}
                    />
                )}
                {icon}
                {loading ? (
                    <ActivityIndicator color={getTextColor()} size="small" />
                ) : (
                    <Text style={[styles.text, { color: getTextColor(), fontSize: textSizes[size], marginLeft: icon ? 8 : 0 }, textStyle]}>
                        {title}
                    </Text>
                )}
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    base: { overflow: 'hidden' },
    text: { fontWeight: '600', letterSpacing: 0.3 },
});
