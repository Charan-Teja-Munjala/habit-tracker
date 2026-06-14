import React, { useEffect, useRef } from 'react';
import { Animated, View, Text, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_W } = Dimensions.get('window');

interface AchievementToastProps {
    title: string;
    description: string;
    icon: string;
    color: string;
    onDone?: () => void;
}

export function AchievementToast({
    title,
    description,
    icon,
    color,
    onDone,
}: AchievementToastProps) {
    const translateY = useRef(new Animated.Value(-100)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.parallel([
                Animated.spring(translateY, {
                    toValue: 0,
                    useNativeDriver: true,
                    bounciness: 10,
                    speed: 12,
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 250,
                    useNativeDriver: true,
                }),
            ]),
            Animated.delay(2500),
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: -100,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 400,
                    useNativeDriver: true,
                }),
            ]),
        ]).start(() => onDone?.());
    }, []);

    return (
        <Animated.View
            style={[
                styles.container,
                { opacity, transform: [{ translateY }], borderLeftColor: color },
            ]}
            pointerEvents="none"
        >
            <View style={[styles.iconWrap, { backgroundColor: color + '25' }]}>
                <Ionicons name={icon as any} size={22} color={color} />
            </View>
            <View style={styles.textWrap}>
                <Text style={styles.topLabel}>🏆 Achievement Unlocked!</Text>
                <Text style={styles.title} numberOfLines={1}>{title}</Text>
                <Text style={styles.desc} numberOfLines={1}>{description}</Text>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 54,
        left: 16,
        right: 16,
        zIndex: 9998,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1C2235',
        borderRadius: 16,
        borderLeftWidth: 4,
        padding: 14,
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 12,
    },
    iconWrap: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    textWrap: { flex: 1 },
    topLabel: { fontSize: 10, fontWeight: '600', color: '#FFE66D', letterSpacing: 0.5, marginBottom: 2 },
    title: { fontSize: 14, fontWeight: '700', color: '#F0F4FF' },
    desc: { fontSize: 11, color: '#8892A8', marginTop: 1 },
});
