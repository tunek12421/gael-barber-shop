import React, { useState, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getDeviceType, hasPointerFine } from '../utils/deviceDetection';

const TouchCalendar = ({ selectedDate, onDateSelect, minDate, maxDate, className = '' }) => {
  const [currentMonth, setCurrentMonth] = useState(() => {
    return selectedDate ? new Date(selectedDate) : new Date();
  });

  const deviceInfo = useMemo(() => {
    const type = getDeviceType();
    return {
      isMobile: type.isMobile,
      isTablet: type.isTablet,
      hasPointerFine: hasPointerFine()
    };
  }, []);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();
    
    const days = [];
    
    // Previous month's trailing days
    const prevMonth = new Date(year, month - 1, 0);
    const daysFromPrevMonth = firstDayOfWeek;
    for (let i = daysFromPrevMonth; i > 0; i--) {
      const day = prevMonth.getDate() - i + 1;
      days.push({
        day,
        date: new Date(year, month - 1, day),
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        isDisabled: true
      });
    }
    
    // Current month days
    const today = new Date();
    const todayStr = today.toDateString();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toDateString();
      
      // Check if date is disabled
      let isDisabled = false;
      if (minDate && date < new Date(minDate)) isDisabled = true;
      if (maxDate && date > new Date(maxDate)) isDisabled = true;
      
      days.push({
        day,
        date,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        isSelected: selectedDate === date.toISOString().split('T')[0],
        isDisabled
      });
    }
    
    // Next month's leading days
    const totalCells = 42; // 6 weeks * 7 days
    const remainingCells = totalCells - days.length;
    for (let day = 1; day <= remainingCells; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        day,
        date,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        isDisabled: true
      });
    }
    
    return days;
  }, [currentMonth, selectedDate, minDate, maxDate]);

  // Navigation handlers
  const goToPrevMonth = useCallback(() => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1));
  }, []);

  const goToNextMonth = useCallback(() => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1));
  }, []);

  const goToToday = useCallback(() => {
    const today = new Date();
    setCurrentMonth(today);
    const todayStr = today.toISOString().split('T')[0];
    if (!minDate || new Date(todayStr) >= new Date(minDate)) {
      onDateSelect(todayStr);
    }
  }, [minDate, onDateSelect]);

  // Date selection handler
  const handleDateClick = useCallback((dayInfo) => {
    if (dayInfo.isDisabled || !dayInfo.isCurrentMonth) return;
    
    const dateStr = dayInfo.date.toISOString().split('T')[0];
    onDateSelect(dateStr);
  }, [onDateSelect]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e, dayInfo) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleDateClick(dayInfo);
    }
  }, [handleDateClick]);

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  
  // Touch-friendly day names for mobile
  const dayNamesShort = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
  const displayDayNames = deviceInfo.isMobile ? dayNamesShort : dayNames;

  return (
    <div className={`touch-calendar ${className}`}>
      {/* Calendar Header */}
      <div className="touch-calendar__header">
        <button
          onClick={goToPrevMonth}
          className="touch-calendar__nav touch-calendar__nav--prev"
          aria-label="Mes anterior"
        >
          <ChevronLeft className="touch-calendar__nav-icon" />
        </button>
        
        <div className="touch-calendar__title">
          <h3 className="touch-calendar__month">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
          <button
            onClick={goToToday}
            className="touch-calendar__today-btn"
          >
            Hoy
          </button>
        </div>
        
        <button
          onClick={goToNextMonth}
          className="touch-calendar__nav touch-calendar__nav--next"
          aria-label="Mes siguiente"
        >
          <ChevronRight className="touch-calendar__nav-icon" />
        </button>
      </div>

      {/* Day Names Header */}
      <div className="touch-calendar__day-names">
        {displayDayNames.map((name, index) => (
          <div key={index} className="touch-calendar__day-name">
            {name}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="touch-calendar__grid">
        {calendarDays.map((dayInfo, index) => (
          <button
            key={index}
            onClick={() => handleDateClick(dayInfo)}
            onKeyDown={(e) => handleKeyDown(e, dayInfo)}
            disabled={dayInfo.isDisabled}
            className={`touch-calendar__day ${
              dayInfo.isCurrentMonth ? 'touch-calendar__day--current' : 'touch-calendar__day--other'
            } ${
              dayInfo.isToday ? 'touch-calendar__day--today' : ''
            } ${
              dayInfo.isSelected ? 'touch-calendar__day--selected' : ''
            } ${
              dayInfo.isDisabled ? 'touch-calendar__day--disabled' : ''
            }`}
            aria-label={`${dayInfo.day} de ${monthNames[dayInfo.date.getMonth()]} ${dayInfo.date.getFullYear()}`}
            tabIndex={dayInfo.isDisabled ? -1 : 0}
          >
            <span className="touch-calendar__day-number">
              {dayInfo.day}
            </span>
            {dayInfo.isToday && (
              <span className="touch-calendar__day-indicator" aria-hidden="true" />
            )}
          </button>
        ))}
      </div>

      {/* Quick Date Actions for Mobile */}
      {deviceInfo.isMobile && (
        <div className="touch-calendar__quick-actions">
          <button
            onClick={goToToday}
            className="touch-calendar__quick-btn"
          >
            Hoy
          </button>
          <button
            onClick={() => {
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              const tomorrowStr = tomorrow.toISOString().split('T')[0];
              if (!minDate || new Date(tomorrowStr) >= new Date(minDate)) {
                onDateSelect(tomorrowStr);
              }
            }}
            className="touch-calendar__quick-btn"
          >
            Mañana
          </button>
          <button
            onClick={() => {
              const nextWeek = new Date();
              nextWeek.setDate(nextWeek.getDate() + 7);
              const nextWeekStr = nextWeek.toISOString().split('T')[0];
              if (!minDate || new Date(nextWeekStr) >= new Date(minDate)) {
                onDateSelect(nextWeekStr);
              }
            }}
            className="touch-calendar__quick-btn"
          >
            Próxima Semana
          </button>
        </div>
      )}
    </div>
  );
};

export default TouchCalendar;