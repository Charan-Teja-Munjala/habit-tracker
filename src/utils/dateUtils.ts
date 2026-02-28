import { format, isToday, parseISO, differenceInCalendarDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';

export const TODAY = (): string => format(new Date(), 'yyyy-MM-dd');

export const formatDate = (dateStr: string): string =>
    format(parseISO(dateStr), 'MMM d, yyyy');

export const formatShort = (dateStr: string): string =>
    format(parseISO(dateStr), 'MMM d');

export const isTodayDate = (dateStr: string): boolean =>
    isToday(parseISO(dateStr));

export const getDaysBetween = (a: string, b: string): number =>
    Math.abs(differenceInCalendarDays(parseISO(a), parseISO(b)));

export const getWeekDates = (): string[] => {
    const now = new Date();
    const start = startOfWeek(now, { weekStartsOn: 1 });
    const end = endOfWeek(now, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end }).map(d => format(d, 'yyyy-MM-dd'));
};

export const getLastNDates = (n: number): string[] => {
    const dates: string[] = [];
    for (let i = n - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dates.push(format(d, 'yyyy-MM-dd'));
    }
    return dates;
};

export const formatDayLabel = (dateStr: string): string =>
    format(parseISO(dateStr), 'EEE');

export const formatMonthDay = (dateStr: string): string =>
    format(parseISO(dateStr), 'd');
