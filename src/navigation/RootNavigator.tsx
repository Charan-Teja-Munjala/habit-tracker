import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { useUserStore } from '../store/userStore';
import { useNotifications } from '../hooks/useNotifications';

import { HomeScreen } from '../screens/HomeScreen';
import { AnalyticsScreen } from '../screens/AnalyticsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { AchievementsScreen } from '../screens/AchievementsScreen';
import { AddHabitScreen } from '../screens/AddHabitScreen';
import { HabitDetailScreen } from '../screens/HabitDetailScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TAB_ICONS: Record<string, { outline: string; filled: string }> = {
    Home: { outline: 'home-outline', filled: 'home' },
    Analytics: { outline: 'bar-chart-outline', filled: 'bar-chart' },
    Achievements: { outline: 'trophy-outline', filled: 'trophy' },
    Profile: { outline: 'person-outline', filled: 'person' },
};

function CustomTabBar({ state, descriptors, navigation }: any) {
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const bottomPad = Math.max(insets.bottom, 8);
    return (
        <View style={[styles.tabBar, { backgroundColor: theme.colors.tabBar, borderTopColor: theme.colors.border, paddingBottom: bottomPad }]}>
            {state.routes.map((route: any, index: number) => {
                const isFocused = state.index === index;
                const { outline, filled } = TAB_ICONS[route.name] ?? { outline: 'ellipse-outline', filled: 'ellipse' };
                const onPress = () => {
                    const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                    if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
                };
                return (
                    <TouchableOpacity key={route.key} onPress={onPress} style={styles.tabItem} activeOpacity={0.7}>
                        {isFocused && (
                            <LinearGradient
                                colors={[theme.colors.primary + '25', 'transparent']}
                                style={styles.activeBackground}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 0, y: 1 }}
                            />
                        )}
                        <Ionicons
                            name={(isFocused ? filled : outline) as any}
                            size={22}
                            color={isFocused ? theme.colors.primary : theme.colors.tabBarInactive}
                        />
                        <Text style={[styles.tabLabel, { color: isFocused ? theme.colors.primary : theme.colors.tabBarInactive }]}>
                            {route.name}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

function MainTabs() {
    return (
        <Tab.Navigator tabBar={(props) => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Analytics" component={AnalyticsScreen} />
            <Tab.Screen name="Achievements" component={AchievementsScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
}

function MainStack() {
    const theme = useTheme();
    return (
        <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.background } }}>
            <Stack.Screen name="Tabs" component={MainTabs} />
            <Stack.Screen name="AddHabit" component={AddHabitScreen} options={{ presentation: 'modal' }} />
            <Stack.Screen name="HabitDetail" component={HabitDetailScreen as any} />
        </Stack.Navigator>
    );
}

function OnboardingStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Onboarding" component={OnboardingScreen as any} />
        </Stack.Navigator>
    );
}

/**
 * Top-level navigator. Rendered inside <NavigationContainer> in App.tsx.
 * Switches between Onboarding and Main app based on hasOnboarded state.
 */
export function RootNavigator() {
    const hasOnboarded = useUserStore((s) => s.hasOnboarded);
    // Initialize push notifications system & listeners (safely inside NavigationContainer)
    useNotifications();
    return hasOnboarded ? <MainStack /> : <OnboardingStack />;
}

const styles = StyleSheet.create({
    tabBar: { flexDirection: 'row', paddingTop: 10, borderTopWidth: 1 },
    tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 4, position: 'relative' },
    activeBackground: { position: 'absolute', top: 0, left: 4, right: 4, bottom: 0, borderRadius: 10 },
    tabLabel: { fontSize: 10, fontWeight: '600', marginTop: 3 },
});
