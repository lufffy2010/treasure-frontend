import React, { useMemo, useCallback, useState } from "react";
import { Card } from "@/components/ui/card";
import { UserData, formatDateKeyIST } from "@/lib/storage";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CalendarViewProps {
  userData: UserData;
  onDateClick: (date: Date) => void;
  selectedDate: Date | null;
}

const CalendarViewComponent = ({
  userData,
  onDateClick,
  selectedDate,
}: CalendarViewProps) => {
  // ---------- stable values ----------
  // compute "today in IST" once (stable)
  const todayIST = useMemo(() => {
    const now = new Date();
    const todayKey = formatDateKeyIST(now);
    const [y, m, d] = todayKey.split("-").map(Number);
    return new Date(y, m - 1, d);
  }, []);

  // month state (stable initial value)
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    // ensure we use the exact date object created above
    return new Date(todayIST.getFullYear(), todayIST.getMonth(), 1);
  });

  // ---------- helpers (stable via useCallback / useMemo) ----------
  const getDaysInMonth = useCallback((date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // empty cells before first day
    for (let i = 0; i < startingDayOfWeek; i++) days.push(null);

    // actual days
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));

    return days;
  }, []);

  // memoize days array for current month: only updates when currentMonth changes
  const daysInCurrentMonth = useMemo(() => getDaysInMonth(currentMonth), [currentMonth, getDaysInMonth]);

  // month(s) to show (currently only one)
  const getMonthsToShow = useCallback(() => [currentMonth], [currentMonth]);

  // stable formatter calls used inside getDayClassName
  const todayKey = useMemo(() => formatDateKeyIST(todayIST), [todayIST]);
  const formatDateKey = useCallback((d: Date) => formatDateKeyIST(d), []);

  // compute CSS class for a given date (stable reference)
  const getDayClassName = useCallback(
    (date: Date | null) => {
      if (!date) return "invisible";

      const dateKey = formatDateKey(date);
      const isToday = dateKey === todayKey;
      const isSelected = selectedDate && formatDateKey(selectedDate) === dateKey;
      const isStreak = userData.streaks.includes(dateKey);
      const todos = userData.todos[dateKey] || [];
      const allComplete = todos.length > 0 && todos.every((t) => t.done);
      const hasIncomplete = todos.length > 0 && todos.some((t) => !t.done);
      const autoStreakEnabled = userData.autoStreakOnComplete;

      let bgClass = "bg-card hover:bg-muted shadow-sm";

      // New color logic:
      // Orange: auto-streak enabled AND all tasks complete
      // Green: all tasks complete (but auto-streak not enabled or no streak)
      // Red: at least one task incomplete
      if (autoStreakEnabled && allComplete && isStreak) {
        bgClass = "bg-orange-500/80 hover:bg-orange-500/90 shadow-md";
      } else if (allComplete) {
        bgClass = "bg-green-500/80 hover:bg-green-500/90 shadow-md";
      } else if (hasIncomplete) {
        bgClass = "bg-red-500/80 hover:bg-red-500/90 shadow-md";
      } else if (isStreak) {
        bgClass = "bg-calendar-streak hover:bg-calendar-streak/80 shadow-md";
      }

      if (isToday) bgClass += " ring-2 ring-secondary ring-offset-2";
      if (isSelected) bgClass += " ring-2 ring-primary ring-offset-2 scale-105 shadow-glow";

      return `${bgClass} cursor-pointer transition-all duration-200 hover:scale-105 sm:hover:scale-110 rounded-lg sm:rounded-xl p-1 sm:p-2 text-center font-medium flex items-center justify-center min-h-[32px] sm:min-h-[40px]`;
    },
    // deps: depend on things that actually change rendering of day cells
    [userData, selectedDate, todayKey, formatDateKey]
  );

  // month/day labels (stable)
  const monthNames = useMemo(
    () => ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    []
  );
  const dayNames = useMemo(() => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], []);

  // navigation handlers (stable)
  const handlePrevMonth = useCallback(() => {
    setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1));
  }, []);

  // render the grid rows (memoized JSX) — re-computes only when daysInCurrentMonth or relevant deps change
  const monthGrid = useMemo(() => {
    return getMonthsToShow().map((monthDate, idx) => (
      <div key={idx} className="space-y-2 sm:space-y-3">
        <div className="text-center font-semibold text-sm sm:text-base text-foreground">
          {monthNames[monthDate.getMonth()]} {monthDate.getFullYear()}
        </div>

        <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
          {dayNames.map((day) => (
            <div key={day} className="text-[10px] sm:text-xs text-muted-foreground text-center font-medium p-0.5 sm:p-1">
              {day.slice(0, 1)}
            </div>
          ))}

          {daysInCurrentMonth.map((date, dayIdx) => (
            <div
              key={dayIdx}
              className={getDayClassName(date)}
              onClick={() => date && onDateClick(date)}
            >
              <span className="text-[10px] sm:text-xs md:text-sm">{date?.getDate()}</span>
            </div>
          ))}
        </div>
      </div>
    ));
    // include deps that could change the grid
  }, [daysInCurrentMonth, getMonthsToShow, monthNames, dayNames, getDayClassName, onDateClick]);

  return (
    <>
      <Card className="group p-3 sm:p-6 shadow-card hover:shadow-elevated transition-all duration-300 border-2">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
            <div className="w-1 h-6 sm:h-8 bg-primary rounded-full group-hover:h-10 transition-all"></div>
            Your Calendar
          </h2>
          <div className="flex gap-1 sm:gap-2">
            <Button onClick={handlePrevMonth} variant="outline" size="icon" className="h-8 w-8 sm:h-10 sm:w-10 hover:bg-primary/10 hover:border-primary/30">
              <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
            <Button onClick={handleNextMonth} variant="outline" size="icon" className="h-8 w-8 sm:h-10 sm:w-10 hover:bg-primary/10 hover:border-primary/30">
              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4">{monthGrid}</div>

        <div className="mt-4 sm:mt-6 grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-4 justify-center text-[10px] sm:text-sm">
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-green-500/80" />
            <span className="text-muted-foreground">All Complete</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-red-500/80" />
            <span className="text-muted-foreground">Incomplete</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-orange-500/80" />
            <span className="text-muted-foreground">Auto-Streak</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-card ring-2 ring-secondary" />
            <span className="text-muted-foreground">Today</span>
          </div>
        </div>
      </Card>
    </>
  );
};

// Memoize to prevent unnecessary re-renders
export const CalendarView = React.memo(CalendarViewComponent);

export default CalendarView;
