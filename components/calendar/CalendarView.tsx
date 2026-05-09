import { useMemo } from 'react';
import { Calendar } from 'react-native-calendars';
import { addDays, parseISO, format, isAfter } from 'date-fns';
import { useCalendarStore } from '@/store/calendarStore';
import { MarkedDates } from '@/types/calendar';
import { Colors } from '@/constants/Colors';
import { getHolidayMap } from '@/utils/austrianHolidays';

interface CalendarViewProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
}

export function CalendarView({ selectedDate, onDateSelect }: CalendarViewProps) {
  const events = useCalendarStore((state) => state.events);

  const markedDates = useMemo((): MarkedDates => {
    const marks: MarkedDates = {};

    // Feiertage für aktuelles und benachbartes Jahr vorberechnen
    const currentYear = parseInt(selectedDate.slice(0, 4), 10);
    const holidays = getHolidayMap([currentYear - 1, currentYear, currentYear + 1]);

    // Feiertage einzeichnen
    for (const [date, holiday] of Object.entries(holidays)) {
      marks[date] = {
        marked: true,
        dotColor: holiday.isPublic ? '#EF4444' : '#F97316',
      };
    }

    // Nutzer-Ereignisse (überschreiben ggf. Feiertagspunkte mit mehreren Dots)
    events.forEach((e) => {
      if (e.endDate && e.endDate > e.date) {
        let current = parseISO(e.date);
        const end = parseISO(e.endDate);
        let safety = 0;
        while (!isAfter(current, end) && safety < 366) {
          safety++;
          const dateStr = format(current, 'yyyy-MM-dd');
          const existing = marks[dateStr];
          marks[dateStr] = {
            ...existing,
            marked: true,
            // Mehrere Dots: Feiertag + Ereignis
            dots: [
              ...(existing?.dots ?? (existing?.dotColor ? [{ color: existing.dotColor }] : [])),
              { color: Colors.primary },
            ],
            dotColor: undefined,
          };
          current = addDays(current, 1);
        }
      } else {
        const existing = marks[e.date];
        marks[e.date] = {
          ...existing,
          marked: true,
          dots: [
            ...(existing?.dots ?? (existing?.dotColor ? [{ color: existing.dotColor }] : [])),
            { color: Colors.primary },
          ],
          dotColor: undefined,
        };
      }
    });

    // Gewähltes Datum
    marks[selectedDate] = {
      ...marks[selectedDate],
      selected: true,
      selectedColor: Colors.primary,
    };

    return marks;
  }, [events, selectedDate]);

  return (
    <Calendar
      current={selectedDate}
      markedDates={markedDates}
      markingType="multi-dot"
      onDayPress={(day) => onDateSelect(day.dateString)}
      firstDay={1}
      theme={{
        todayTextColor: Colors.primary,
        selectedDayBackgroundColor: Colors.primary,
        dotColor: Colors.primary,
        arrowColor: Colors.primary,
        textSectionTitleColor: Colors.text.secondary,
        dayTextColor: Colors.text.primary,
        monthTextColor: Colors.text.primary,
        textDayFontWeight: '400',
        textMonthFontWeight: '600',
        textDayHeaderFontWeight: '500',
        backgroundColor: Colors.background.primary,
        calendarBackground: Colors.background.primary,
      }}
    />
  );
}
