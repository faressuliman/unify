import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';

type LocalizedDateInputProps = {
  id: string;
  label: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  isRTL?: boolean;
  placeholder: string;
  labelClassName?: string;
};

type CalendarCell = {
  date: Date;
  inCurrentMonth: boolean;
};

const toInputDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const fromInputDate = (value: string): Date | null => {
  if (!value) return null;
  const parts = value.split('-').map(Number);
  if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) return null;
  return new Date(parts[0], parts[1] - 1, parts[2]);
};

const isSameDate = (a: Date, b: Date): boolean => {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
};

export default function LocalizedDateInput({
  id,
  label,
  value,
  onChange,
  isRTL = false,
  placeholder,
  labelClassName,
}: LocalizedDateInputProps) {
  const locale = isRTL ? 'ar-EG-u-nu-arab' : 'en-US';
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedDate = fromInputDate(value);
  const today = useMemo(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }, []);
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const [isOpen, setIsOpen] = useState(false);
  const [displayMonth, setDisplayMonth] = useState<Date>(() => {
    const baseDate = selectedDate ?? today;
    return new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
  });

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const selectedYear = selectedDate?.getFullYear();
  const selectedMonth = selectedDate?.getMonth();
  useEffect(() => {
    if (!selectedYear || selectedMonth === undefined) return;
    setDisplayMonth(new Date(selectedYear, selectedMonth, 1));
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    if (!selectedDate || selectedDate.getTime() <= today.getTime()) return;
    onChange(toInputDate(today));
  }, [onChange, selectedDate, today]);

  const monthOptions = useMemo(() => {
    return Array.from({ length: 12 }, (_, monthIndex) => {
      const monthDate = new Date(2024, monthIndex, 1);
      return {
        value: monthIndex,
        label: new Intl.DateTimeFormat(locale, { month: 'long' }).format(monthDate),
      };
    });
  }, [locale]);

  const yearOptions = useMemo(() => {
    const minYear = currentYear - 120;
    return Array.from({ length: currentYear - minYear + 1 }, (_, index) => currentYear - index);
  }, [currentYear]);

  const weekdayLabels = useMemo(() => {
    const baseSundayUtc = new Date(Date.UTC(2024, 0, 7));
    const formatter = new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' });

    return Array.from({ length: 7 }, (_, index) => {
      const day = new Date(baseSundayUtc);
      day.setUTCDate(baseSundayUtc.getUTCDate() + index);
      return formatter.format(day);
    });
  }, [locale]);

  const calendarCells = useMemo(() => {
    const year = displayMonth.getFullYear();
    const month = displayMonth.getMonth();
    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    const cells: CalendarCell[] = [];

    for (let i = firstWeekday - 1; i >= 0; i -= 1) {
      cells.push({
        date: new Date(year, month - 1, daysInPrevMonth - i),
        inCurrentMonth: false,
      });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push({
        date: new Date(year, month, day),
        inCurrentMonth: true,
      });
    }

    while (cells.length % 7 !== 0) {
      const lastDate = cells[cells.length - 1].date;
      cells.push({
        date: new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate() + 1),
        inCurrentMonth: false,
      });
    }

    return cells;
  }, [displayMonth]);

  const displayValue = useMemo(() => {
    if (!selectedDate) return placeholder;
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(selectedDate);
  }, [locale, placeholder, selectedDate]);

  const changeMonth = (delta: number) => {
    setDisplayMonth((prev) => {
      const candidate = new Date(prev.getFullYear(), prev.getMonth() + delta, 1);
      if (candidate.getFullYear() > currentYear) return prev;
      if (candidate.getFullYear() === currentYear && candidate.getMonth() > currentMonth) return prev;
      return candidate;
    });
  };

  const setDisplayYearMonth = (year: number, month: number) => {
    const candidateYear = Math.min(year, currentYear);
    const candidateMonth = candidateYear === currentYear ? Math.min(month, currentMonth) : month;
    setDisplayMonth(new Date(candidateYear, candidateMonth, 1));
  };

  const handleSelectDate = (date: Date) => {
    onChange(toInputDate(date));
    setIsOpen(false);
  };

  const handleSetToday = () => {
    handleSelectDate(today);
  };

  const handleClear = () => {
    onChange('');
    setIsOpen(false);
  };

  return (
    <div className="space-y-2 text-start" ref={containerRef}>
      <label htmlFor={id} className={labelClassName ?? 'text-sm font-medium leading-none text-tertiary block text-start'}>
        {label}
      </label>

      <div className="relative">
        <button
          id={id}
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="peer h-10 w-full rounded-md border border-gray-300 bg-gray-50/50 ps-3 pe-12 text-sm text-slate-700 focus:outline-none transition duration-300 flex items-center justify-start text-start cursor-pointer"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
        >
          <span className={selectedDate ? 'text-slate-700' : 'text-slate-600'}>{displayValue}</span>
        </button>

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={isRTL ? 'افتح التقويم' : 'Open calendar'}
          className={`absolute top-1/2 -translate-y-1/2 z-10 text-gray-500 hover:text-gray-600 transition-colors cursor-pointer ${isRTL ? 'left-3 right-auto' : 'right-3 left-auto'}`}
        >
          <CalendarDays className="h-5 w-5" />
        </button>

        <div className={`pointer-events-none absolute inset-0 rounded-md border-2 border-secondary transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`} />

        {isOpen && (
          <div className={`absolute z-30 mt-2 w-full min-w-[18rem] rounded-lg border border-gray-200 bg-white shadow-xl p-3 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="mb-3 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => changeMonth(-1)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-600 hover:bg-gray-100 cursor-pointer"
                aria-label={isRTL ? 'الشهر السابق' : 'Previous month'}
              >
                {isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </button>

              <div className="flex flex-1 items-center justify-center gap-2">
                <select
                  value={displayMonth.getMonth()}
                  onChange={(event) => setDisplayYearMonth(displayMonth.getFullYear(), Number(event.target.value))}
                  className="h-8 rounded-md border border-gray-200 bg-white px-2 text-xs text-slate-700 focus:outline-none cursor-pointer"
                >
                  {monthOptions.map((monthOption) => {
                    const isFutureMonth =
                      displayMonth.getFullYear() === currentYear && monthOption.value > currentMonth;

                    return (
                      <option key={monthOption.value} value={monthOption.value} disabled={isFutureMonth}>
                        {monthOption.label}
                      </option>
                    );
                  })}
                </select>

                <select
                  value={displayMonth.getFullYear()}
                  onChange={(event) => setDisplayYearMonth(Number(event.target.value), displayMonth.getMonth())}
                  className="h-8 rounded-md border border-gray-200 bg-white px-2 text-xs text-slate-700 focus:outline-none cursor-pointer"
                >
                  {yearOptions.map((yearOption) => (
                    <option key={yearOption} value={yearOption}>
                      {new Intl.NumberFormat(locale, { useGrouping: false }).format(yearOption)}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => changeMonth(1)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-600 hover:bg-gray-100 disabled:text-slate-300 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
                aria-label={isRTL ? 'الشهر التالي' : 'Next month'}
                disabled={
                  displayMonth.getFullYear() === currentYear && displayMonth.getMonth() >= currentMonth
                }
              >
                {isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
            </div>

            <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs text-slate-500">
              {weekdayLabels.map((weekday) => (
                <span key={weekday}>{weekday}</span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarCells.map(({ date, inCurrentMonth }) => {
                const isSelected = selectedDate ? isSameDate(selectedDate, date) : false;
                const isToday = isSameDate(today, date);
                const isFutureDate = date > today;

                return (
                  <button
                    key={`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`}
                    type="button"
                    onClick={() => handleSelectDate(date)}
                    disabled={isFutureDate}
                    className={`h-8 rounded-md text-sm transition-colors ${
                      isSelected
                        ? 'bg-secondary text-white'
                        : inCurrentMonth
                          ? 'text-slate-700 hover:bg-gray-100'
                          : 'text-slate-400 hover:bg-gray-50'
                    } ${isToday && !isSelected ? 'ring-1 ring-secondary/50' : ''} ${
                      isFutureDate ? 'cursor-not-allowed text-slate-300 hover:bg-transparent' : 'cursor-pointer'
                    }`}
                  >
                    {new Intl.DateTimeFormat(locale, { day: 'numeric' }).format(date)}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 flex items-center justify-between text-xs font-medium">
              <button
                type="button"
                onClick={handleClear}
                className="text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                {isRTL ? 'مسح' : 'Clear'}
              </button>

              <button
                type="button"
                onClick={handleSetToday}
                className="text-secondary hover:text-secondary/80 cursor-pointer"
              >
                {isRTL ? 'اليوم' : 'Today'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
