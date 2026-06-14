import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';

const DAYS = [
    { label: 'S', value: 0 },
    { label: 'M', value: 1 },
    { label: 'T', value: 2 },
    { label: 'W', value: 3 },
    { label: 'T', value: 4 },
    { label: 'F', value: 5 },
    { label: 'S', value: 6 },
];

interface DaySelectorProps {
    selectedDays: number[];
    onChange: (days: number[]) => void;
    accentColor?: string;
}

export function DaySelector({ selectedDays, onChange, accentColor }: DaySelectorProps) {
    const theme = useTheme();
    const color = accentColor ?? theme.colors.primary;

    const toggle = (day: number) => {
        if (selectedDays.includes(day)) {
            onChange(selectedDays.filter((d) => d !== day));
        } else {
            onChange([...selectedDays, day].sort((a, b) => a - b));
        }
    };

    return (
        <View style={styles.row}>
            {DAYS.map((d, idx) => {
                const active = selectedDays.includes(d.value);
                return (
                    <TouchableOpacity
                        key={`${d.value}-${idx}`}
                        onPress={() => toggle(d.value)}
                        style={[
                            styles.dayBtn,
                            {
                                backgroundColor: active ? color : theme.colors.card,
                                borderColor: active ? color : theme.colors.border,
                            },
                        ]}
                        activeOpacity={0.75}
                    >
                        <Text
                            style={[
                                styles.dayLabel,
                                { color: active ? '#fff' : theme.colors.textSecondary },
                            ]}
                        >
                            {d.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 6,
    },
    dayBtn: {
        flex: 1,
        aspectRatio: 1,
        borderRadius: 10,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: 42,
    },
    dayLabel: {
        fontSize: 13,
        fontWeight: '700',
    },
});
