import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';

interface XPPopupProps {
    xp: number;
    color?: string;
    onDone?: () => void;
}

/**
 * Floating "+XP" label that rises and fades out.
 * Mount it, it self-animates and calls onDone when finished.
 */
export function XPPopup({ xp, color = '#FFE66D', onDone }: XPPopupProps) {
    const translateY = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(1)).current;
    const scale = useRef(new Animated.Value(0.6)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.spring(scale, {
                toValue: 1,
                useNativeDriver: true,
                speed: 40,
                bounciness: 18,
            }),
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: -60,
                    duration: 700,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 700,
                    delay: 200,
                    useNativeDriver: true,
                }),
            ]),
        ]).start(() => onDone?.());
    }, []);

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    opacity,
                    transform: [{ translateY }, { scale }],
                },
            ]}
            pointerEvents="none"
        >
            <Text style={[styles.text, { color }]}>+{xp} XP</Text>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: -8,
        right: 8,
        zIndex: 999,
        alignItems: 'center',
    },
    text: {
        fontSize: 15,
        fontWeight: '900',
        letterSpacing: 0.5,
        textShadowColor: 'rgba(0,0,0,0.4)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
});
