import React, { useEffect, useRef } from 'react';
import {
    Animated,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_W } = Dimensions.get('window');

interface LevelUpModalProps {
    level: number;
    levelTitle: string;
    onClose: () => void;
}

export function LevelUpModal({ level, levelTitle, onClose }: LevelUpModalProps) {
    const opacity = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(0.6)).current;
    const badgeScale = useRef(new Animated.Value(0)).current;
    const rotate = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.spring(scale, { toValue: 1, useNativeDriver: true, bounciness: 12, speed: 8 }),
        ]).start(() => {
            Animated.sequence([
                Animated.spring(badgeScale, { toValue: 1.15, useNativeDriver: true, speed: 12, bounciness: 20 }),
                Animated.spring(badgeScale, { toValue: 1, useNativeDriver: true, speed: 8 }),
            ]).start();
        });

        // Gentle continuous rotation on the badge stars
        Animated.loop(
            Animated.timing(rotate, { toValue: 1, duration: 6000, useNativeDriver: true })
        ).start();
    }, []);

    const rotateInterp = rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

    return (
        <Animated.View style={[styles.overlay, { opacity }]}>
            <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
                <LinearGradient
                    colors={['#1C1040', '#2D1B6B', '#0A0E1A']}
                    style={StyleSheet.absoluteFillObject}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                />

                {/* Rotating star ring */}
                <Animated.View style={[styles.starRing, { transform: [{ rotate: rotateInterp }] }]}>
                    {Array.from({ length: 8 }).map((_, i) => (
                        <View
                            key={i}
                            style={[
                                styles.starDot,
                                {
                                    transform: [
                                        { rotate: `${i * 45}deg` },
                                        { translateX: 70 },
                                    ],
                                },
                            ]}
                        />
                    ))}
                </Animated.View>

                {/* Badge */}
                <Animated.View style={[styles.badge, { transform: [{ scale: badgeScale }] }]}>
                    <LinearGradient
                        colors={['#6C63FF', '#9B59B6', '#FF6584']}
                        style={StyleSheet.absoluteFillObject}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    />
                    <Text style={styles.badgeLevelLabel}>LV</Text>
                    <Text style={styles.badgeLevelNum}>{level}</Text>
                </Animated.View>

                <Text style={styles.congrats}>LEVEL UP! 🎉</Text>
                <Text style={styles.title}>{levelTitle}</Text>
                <Text style={styles.subtitle}>
                    You've reached a new milestone!{'\n'}Keep building those habits!
                </Text>

                <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
                    <LinearGradient
                        colors={['#6C63FF', '#9B59B6']}
                        style={StyleSheet.absoluteFillObject}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    />
                    <Ionicons name="rocket" size={18} color="#fff" />
                    <Text style={styles.closeBtnText}>Awesome!</Text>
                </TouchableOpacity>
            </Animated.View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.85)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
    },
    card: {
        width: SCREEN_W - 48,
        borderRadius: 28,
        padding: 32,
        alignItems: 'center',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(108,99,255,0.4)',
    },
    starRing: {
        position: 'absolute',
        width: 200,
        height: 200,
        alignItems: 'center',
        justifyContent: 'center',
    },
    starDot: {
        position: 'absolute',
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#6C63FF',
        opacity: 0.6,
    },
    badge: {
        width: 96,
        height: 96,
        borderRadius: 48,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        overflow: 'hidden',
        shadowColor: '#6C63FF',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.8,
        shadowRadius: 20,
        elevation: 20,
    },
    badgeLevelLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.7)',
        letterSpacing: 1,
    },
    badgeLevelNum: {
        fontSize: 38,
        fontWeight: '900',
        color: '#fff',
        lineHeight: 44,
    },
    congrats: {
        fontSize: 13,
        fontWeight: '700',
        color: '#FFE66D',
        letterSpacing: 2,
        marginBottom: 8,
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 12,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.6)',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 28,
    },
    closeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 16,
        overflow: 'hidden',
    },
    closeBtnText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
});
