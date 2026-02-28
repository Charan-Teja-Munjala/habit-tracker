import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { getLastNDates, formatMonthDay, formatDayLabel } from '../utils/dateUtils';

interface CalendarHeatmapProps {
    completedDates: string[];
    accentColor: string;
    weeks?: number;
}

export function CalendarHeatmap({
    completedDates,
    accentColor,
    weeks = 12,
}: CalendarHeatmapProps) {
    const theme = useTheme();
    const days = getLastNDates(weeks * 7);
    const dateSet = new Set(completedDates);

    // Group into columns of 7 (Sunday → Saturday)
    const columns: string[][] = [];
    for (let i = 0; i < days.length; i += 7) {
        columns.push(days.slice(i, i + 7));
    }

    const getCellColor = (date: string) => {
        if (!dateSet.has(date)) return theme.colors.border;
        return accentColor;
    };

    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.grid}>
                {columns.map((week, wi) => (
                    <View key={wi} style={styles.column}>
                        {week.map((date, di) => (
                            <View
                                key={date}
                                style={[
                                    styles.cell,
                                    {
                                        backgroundColor: getCellColor(date),
                                        opacity: dateSet.has(date) ? 1 : 0.3,
                                    },
                                ]}
                            />
                        ))}
                    </View>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    grid: { flexDirection: 'row', paddingVertical: 4 },
    column: { flexDirection: 'column', marginRight: 3 },
    cell: {
        width: 11,
        height: 11,
        borderRadius: 3,
        marginBottom: 3,
    },
});
