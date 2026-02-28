import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: keyof typeof Ionicons.glyphMap;
    iconColor?: string;
    subtitle?: string;
    style?: ViewStyle;
}

export function StatsCard({ title, value, icon, iconColor, subtitle, style }: StatsCardProps) {
    const theme = useTheme();
    const color = iconColor ?? theme.colors.primary;

    return (
        <View
            style={[
                styles.card,
                {
                    backgroundColor: theme.colors.card,
                    borderColor: theme.colors.glassBorder,
                },
                style,
            ]}
        >
            <View style={[styles.iconWrap, { backgroundColor: color + '20' }]}>
                <Ionicons name={icon} size={20} color={color} />
            </View>
            <Text
                style={[styles.value, { color: theme.colors.textPrimary }]}
                numberOfLines={1}
            >
                {value}
            </Text>
            <Text style={[styles.title, { color: theme.colors.textSecondary }]}>{title}</Text>
            {subtitle ? (
                <Text style={[styles.subtitle, { color: color }]}>{subtitle}</Text>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flex: 1,
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        alignItems: 'flex-start',
        minWidth: 0,
    },
    iconWrap: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    value: { fontSize: 22, fontWeight: '700', marginBottom: 2 },
    title: { fontSize: 12, fontWeight: '500' },
    subtitle: { fontSize: 11, fontWeight: '600', marginTop: 4 },
});
