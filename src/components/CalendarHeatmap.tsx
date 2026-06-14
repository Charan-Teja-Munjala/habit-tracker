import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { getLastNDates } from '../utils/dateUtils';

const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

interface CalendarHeatmapProps {
    completedDates: string[];
    accentColor: string;
    weeks?: number;
    onDayPress?: (date: string, completed: boolean) => void;
}

export function CalendarHeatmap({
    completedDates,
    accentColor,
    weeks = 12,
    onDayPress,
}: CalendarHeatmapProps) {
    const theme = useTheme();
    const days = getLastNDates(weeks * 7);
    const dateSet = new Set(completedDates);

    // Group into columns of 7 (Sunday → Saturday)
    const columns: string[][] = [];
    for (let i = 0; i < days.length; i += 7) {
        columns.push(days.slice(i, i + 7));
    }

    // Month labels: show label when the month changes across columns
    const monthLabels: (string | null)[] = columns.map((week) => {
        const firstDay = week[0];
        if (!firstDay) return null;
        const d = new Date(firstDay);
        // Show label only on the 1st week of each month
        if (d.getDate() <= 7) {
            return d.toLocaleString('default', { month: 'short' });
        }
        return null;
    });

    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View>
                {/* Month labels row */}
                <View style={styles.monthRow}>
                    {columns.map((_, wi) => (
                        <View key={`month-${wi}`} style={styles.monthCell}>
                            {monthLabels[wi] ? (
                                <Text style={[styles.monthLabel, { color: theme.colors.textTertiary }]}>
                                    {monthLabels[wi]}
                                </Text>
                            ) : null}
                        </View>
                    ))}
                </View>

                <View style={styles.gridRow}>
                    {/* Day-of-week labels */}
                    <View style={styles.dayLetters}>
                        {DAY_LETTERS.map((l, i) => (
                            <Text key={i} style={[styles.dayLetter, { color: theme.colors.textTertiary }]}>
                                {i % 2 === 1 ? l : ''}
                            </Text>
                        ))}
                    </View>

                    {/* Grid */}
                    <View style={styles.grid}>
                        {columns.map((week, wi) => (
                            <View key={wi} style={styles.column}>
                                {week.map((date, di) => {
                                    const completed = dateSet.has(date);
                                    return (
                                        <TouchableOpacity
                                            key={date}
                                            activeOpacity={0.7}
                                            onPress={() => onDayPress?.(date, completed)}
                                            style={[
                                                styles.cell,
                                                {
                                                    backgroundColor: completed
                                                        ? accentColor
                                                        : theme.colors.border,
                                                    opacity: completed ? 1 : 0.35,
                                                },
                                            ]}
                                        />
                                    );
                                })}
                            </View>
                        ))}
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    monthRow: { flexDirection: 'row', marginLeft: 22, marginBottom: 2 },
    monthCell: { width: 14, marginRight: 3 },
    monthLabel: { fontSize: 9, fontWeight: '600' },
    gridRow: { flexDirection: 'row', paddingVertical: 4 },
    dayLetters: { flexDirection: 'column', marginRight: 4 },
    dayLetter: { height: 14, fontSize: 9, fontWeight: '600', lineHeight: 14 },
    grid: { flexDirection: 'row' },
    column: { flexDirection: 'column', marginRight: 3 },
    cell: {
        width: 11,
        height: 11,
        borderRadius: 3,
        marginBottom: 3,
    },
});
