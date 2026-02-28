import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    TextInput,
    FlatList,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useUserStore } from '../store/userStore';
import { AnimatedButton } from '../components/AnimatedButton';
import { useHabitStore } from '../store/habitStore';

const { width } = Dimensions.get('window');

const SLIDES = [
    {
        id: '1',
        title: 'Build Powerful\nHabits',
        subtitle: 'Science-backed habit building for a better you. Just 2 minutes a day.',
        icon: 'rocket' as const,
        gradient: ['#6C63FF', '#9B59B6'] as [string, string],
    },
    {
        id: '2',
        title: 'Track & Grow\nEvery Day',
        subtitle: 'Visualize your progress with streaks, XP, and beautiful analytics.',
        icon: 'trending-up' as const,
        gradient: ['#4ECDC4', '#44CF6C'] as [string, string],
    },
    {
        id: '3',
        title: 'Level Up\nYour Life',
        subtitle: 'Earn XP, unlock achievements, and become the best version of yourself.',
        icon: 'trophy' as const,
        gradient: ['#FF6584', '#FF4757'] as [string, string],
    },
];

interface Props {
    navigation?: any;
}

export function OnboardingScreen({ navigation }: Props) {
    const theme = useTheme();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [name, setName] = useState('');
    const flatListRef = useRef<FlatList>(null);
    const initProfile = useUserStore((s) => s.initProfile);
    const addHabit = useHabitStore((s) => s.addHabit);

    const isLastSlide = currentIndex === SLIDES.length - 1;

    const goNext = () => {
        if (currentIndex < SLIDES.length - 1) {
            const next = currentIndex + 1;
            flatListRef.current?.scrollToIndex({ index: next, animated: true });
            setCurrentIndex(next);
        }
    };

    const handleStart = () => {
        if (!name.trim()) return;
        initProfile(name.trim());
        addHabit({
            title: 'Morning Meditation',
            description: 'Start your day with mindfulness',
            frequency: 'daily',
            xpReward: 20,
            color: '#6C63FF',
            icon: 'leaf-outline',
            category: 'Mindset',
        });
        // Setting hasOnboarded=true automatically re-renders RootNavigator to the main app
    };

    const renderSlide = ({ item }: { item: typeof SLIDES[0] }) => (
        <View style={[styles.slide, { width }]}>
            <View style={styles.illustrationWrap}>
                <LinearGradient
                    colors={item.gradient}
                    style={styles.illustrationCircle}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <Ionicons name={item.icon} size={72} color="rgba(255,255,255,0.95)" />
                </LinearGradient>
            </View>
            <Text style={[styles.slideTitle, { color: theme.colors.textPrimary }]}>
                {item.title}
            </Text>
            <Text style={[styles.slideSubtitle, { color: theme.colors.textSecondary }]}>
                {item.subtitle}
            </Text>
        </View>
    );

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <LinearGradient
                colors={[theme.colors.background, theme.colors.surface]}
                style={StyleSheet.absoluteFillObject}
            />

            <FlatList
                ref={flatListRef}
                data={SLIDES}
                renderItem={renderSlide}
                keyExtractor={(i) => i.id}
                horizontal
                pagingEnabled
                scrollEnabled={false}
                showsHorizontalScrollIndicator={false}
            />

            {/* Dots */}
            <View style={styles.dots}>
                {SLIDES.map((_, i) => (
                    <View
                        key={i}
                        style={[
                            styles.dot,
                            {
                                backgroundColor: i === currentIndex ? theme.colors.primary : theme.colors.border,
                                width: i === currentIndex ? 20 : 8,
                            },
                        ]}
                    />
                ))}
            </View>

            {/* Name input on last slide */}
            {isLastSlide && (
                <View style={styles.nameContainer}>
                    <Text style={[styles.nameLabel, { color: theme.colors.textSecondary }]}>
                        What should we call you?
                    </Text>
                    <TextInput
                        style={[
                            styles.nameInput,
                            {
                                backgroundColor: theme.colors.card,
                                color: theme.colors.textPrimary,
                                borderColor: theme.colors.border,
                            },
                        ]}
                        placeholder="Your name..."
                        placeholderTextColor={theme.colors.textTertiary}
                        value={name}
                        onChangeText={setName}
                        autoFocus
                    />
                </View>
            )}

            <View style={styles.footer}>
                {isLastSlide ? (
                    <AnimatedButton
                        title="Let's Begin 🚀"
                        onPress={handleStart}
                        disabled={!name.trim()}
                        gradient={['#6C63FF', '#9B59B6']}
                        style={styles.button}
                    />
                ) : (
                    <AnimatedButton
                        title="Continue"
                        onPress={goNext}
                        gradient={['#6C63FF', '#9B59B6']}
                        style={styles.button}
                    />
                )}
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    slide: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 32 },
    illustrationWrap: { marginBottom: 40 },
    illustrationCircle: {
        width: 180,
        height: 180,
        borderRadius: 90,
        alignItems: 'center',
        justifyContent: 'center',
    },
    slideTitle: {
        fontSize: 34,
        fontWeight: '800',
        textAlign: 'center',
        letterSpacing: -1,
        marginBottom: 16,
        lineHeight: 42,
    },
    slideSubtitle: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        fontWeight: '400',
    },
    dots: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 6,
        marginBottom: 20,
    },
    dot: { height: 8, borderRadius: 4 },
    nameContainer: { paddingHorizontal: 24, marginBottom: 16 },
    nameLabel: { fontSize: 13, fontWeight: '500', marginBottom: 8, marginLeft: 4 },
    nameInput: {
        borderWidth: 1,
        borderRadius: 14,
        padding: 14,
        fontSize: 16,
        fontWeight: '500',
    },
    footer: { paddingHorizontal: 24, paddingBottom: 40 },
    button: { width: '100%' },
});
