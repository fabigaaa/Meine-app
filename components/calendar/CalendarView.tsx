import { useMemo } from 'react';
import { Calendar } from 'react-native-calendars';
import { addDays, parseISO, format, isAfter } from 'date-fns';
import { useCalendarStore } from '@/store/calendarStore';
import { MarkedDates } from '@/types/calendar';
import { Colors } from '@/constants/Colors';

interface CalendarViewProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
}

export function CalendarView({ selectedDate, onDateSelect }: CalendarViewProps) {
  const events = useCalendarStore((state) => state.events);

  const markedDates = useMemo((): MarkedDates => {
    const marks: MarkedDates = {};

    events.forEach((e) => {
      if (e.endDate && e.endDate > e.date) {
        // Mark every day in the multi-day range
        let current = parseISO(e.date);
        const end = parseISO(e.endDate);
        let safety = 0;
        while (!isAfter(current, end) && safety < 366) {
          safety++;
          const dateStr = format(current, 'yyyy-MM-dd');
          marks[dateStr] = { marked: true, dotColor: Colors.primary };
          current = addDays(current, 1);
        }
      } else {
        marks[e.date] = { marked: true, dotColor: Colors.primary };
      }
    });

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
