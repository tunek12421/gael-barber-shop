import React, { useMemo, useCallback } from 'react';
import { Clock } from 'lucide-react';
import { getDeviceType, getScreenCategory } from '../utils/deviceDetection';

const TimeSlotGrid = ({ 
  selectedTime, 
  onTimeSelect, 
  availableSlots = [], 
  busySlots = [], 
  selectedDate,
  className = '' 
}) => {
  const deviceInfo = useMemo(() => {
    const type = getDeviceType();
    return {
      isMobile: type.isMobile,
      isTablet: type.isTablet,
      isDesktop: type.isDesktop,
      screenCategory: getScreenCategory()
    };
  }, []);

  // Generate time slots with status
  const timeSlots = useMemo(() => {
    const slots = [];
    const startHour = 9;
    const endHour = 20;
    const interval = 30; // minutes

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        // Check if slot is available
        const isAvailable = availableSlots.length === 0 || availableSlots.includes(timeString);
        const isBusy = busySlots.includes(timeString);
        const isSelected = selectedTime === timeString;
        
        // Check if it's a popular time
        const isPopular = [12, 13, 14, 17, 18, 19].includes(hour);
        
        // Check if it's during lunch break
        const isLunchBreak = hour >= 13 && hour < 14;
        
        slots.push({
          time: timeString,
          display: timeString,
          hour,
          minute,
          isAvailable: isAvailable && !isBusy && !isLunchBreak,
          isBusy,
          isSelected,
          isPopular,
          isLunchBreak,
          period: hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'
        });
      }
    }

    return slots;
  }, [availableSlots, busySlots, selectedTime]);

  // Group slots by time period
  const groupedSlots = useMemo(() => {
    const groups = {
      morning: { label: 'Mañana', slots: [] },
      afternoon: { label: 'Tarde', slots: [] },
      evening: { label: 'Noche', slots: [] }
    };

    timeSlots.forEach(slot => {
      groups[slot.period].slots.push(slot);
    });

    return groups;
  }, [timeSlots]);

  // Calculate grid columns based on device
  const gridColumns = useMemo(() => {
    if (deviceInfo.isMobile) {
      return 2; // 2 columns on mobile for better touch targets
    } else if (deviceInfo.isTablet) {
      return 3; // 3 columns on tablet
    } else {
      return 4; // 4 columns on desktop
    }
  }, [deviceInfo]);

  // Handle time selection
  const handleTimeSelect = useCallback((slot) => {
    if (!slot.isAvailable) return;
    onTimeSelect(slot.time);
  }, [onTimeSelect]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e, slot) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleTimeSelect(slot);
    }
  }, [handleTimeSelect]);

  // Get slot status text for screen readers
  const getSlotAriaLabel = useCallback((slot) => {
    let label = `${slot.display}`;
    if (slot.isSelected) label += ', seleccionado';
    if (slot.isBusy) label += ', ocupado';
    if (slot.isLunchBreak) label += ', hora de almuerzo';
    if (slot.isPopular) label += ', hora popular';
    return label;
  }, []);

  // Show date info if selected
  const selectedDateDisplay = useMemo(() => {
    if (!selectedDate) return '';
    
    const date = new Date(selectedDate);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  }, [selectedDate]);

  return (
    <div className={`time-slot-grid ${className}`}>
      {/* Header */}
      <div className="time-slot-grid__header">
        <div className="time-slot-grid__title">
          <Clock className="time-slot-grid__icon" />
          <div>
            <h3 className="time-slot-grid__heading">Horarios Disponibles</h3>
            {selectedDateDisplay && (
              <p className="time-slot-grid__date">{selectedDateDisplay}</p>
            )}
          </div>
        </div>
        
        {/* Legend for desktop */}
        {deviceInfo.isDesktop && (
          <div className="time-slot-grid__legend">
            <div className="time-slot-grid__legend-item">
              <div className="time-slot-grid__legend-color time-slot-grid__legend-color--available"></div>
              <span>Disponible</span>
            </div>
            <div className="time-slot-grid__legend-item">
              <div className="time-slot-grid__legend-color time-slot-grid__legend-color--popular"></div>
              <span>Popular</span>
            </div>
            <div className="time-slot-grid__legend-item">
              <div className="time-slot-grid__legend-color time-slot-grid__legend-color--busy"></div>
              <span>Ocupado</span>
            </div>
          </div>
        )}
      </div>

      {/* Time Slots Grid */}
      <div className="time-slot-grid__content">
        {Object.entries(groupedSlots).map(([period, group]) => (
          <div key={period} className="time-slot-grid__group">
            <h4 className="time-slot-grid__group-title">{group.label}</h4>
            <div 
              className="time-slot-grid__slots"
              style={{
                gridTemplateColumns: `repeat(${gridColumns}, 1fr)`
              }}
            >
              {group.slots.map((slot) => (
                <button
                  key={slot.time}
                  onClick={() => handleTimeSelect(slot)}
                  onKeyDown={(e) => handleKeyDown(e, slot)}
                  disabled={!slot.isAvailable}
                  className={`time-slot-grid__slot ${
                    slot.isSelected ? 'time-slot-grid__slot--selected' : ''
                  } ${
                    slot.isBusy ? 'time-slot-grid__slot--busy' : ''
                  } ${
                    slot.isLunchBreak ? 'time-slot-grid__slot--lunch' : ''
                  } ${
                    slot.isPopular && slot.isAvailable ? 'time-slot-grid__slot--popular' : ''
                  } ${
                    !slot.isAvailable ? 'time-slot-grid__slot--disabled' : ''
                  }`}
                  aria-label={getSlotAriaLabel(slot)}
                  tabIndex={slot.isAvailable ? 0 : -1}
                >
                  <span className="time-slot-grid__slot-time">
                    {slot.display}
                  </span>
                  
                  {/* Status indicators */}
                  {slot.isPopular && slot.isAvailable && (
                    <span className="time-slot-grid__slot-badge time-slot-grid__slot-badge--popular">
                      Popular
                    </span>
                  )}
                  
                  {slot.isBusy && (
                    <span className="time-slot-grid__slot-badge time-slot-grid__slot-badge--busy">
                      Ocupado
                    </span>
                  )}
                  
                  {slot.isLunchBreak && (
                    <span className="time-slot-grid__slot-badge time-slot-grid__slot-badge--lunch">
                      Almuerzo
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Time Selection for Mobile */}
      {deviceInfo.isMobile && (
        <div className="time-slot-grid__quick-times">
          <h4 className="time-slot-grid__quick-title">Horarios Populares</h4>
          <div className="time-slot-grid__quick-slots">
            {['10:00', '14:00', '16:00', '18:00'].map(time => {
              const slot = timeSlots.find(s => s.time === time);
              if (!slot || !slot.isAvailable) return null;
              
              return (
                <button
                  key={time}
                  onClick={() => handleTimeSelect(slot)}
                  className={`time-slot-grid__quick-slot ${
                    slot.isSelected ? 'time-slot-grid__quick-slot--selected' : ''
                  }`}
                >
                  {time}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* No available slots message */}
      {timeSlots.filter(slot => slot.isAvailable).length === 0 && (
        <div className="time-slot-grid__empty">
          <div className="time-slot-grid__empty-content">
            <Clock className="time-slot-grid__empty-icon" />
            <h4 className="time-slot-grid__empty-title">
              No hay horarios disponibles
            </h4>
            <p className="time-slot-grid__empty-text">
              Por favor selecciona otra fecha o contacta directamente para consultar disponibilidad.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeSlotGrid;