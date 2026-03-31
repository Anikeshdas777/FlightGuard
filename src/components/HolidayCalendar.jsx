// This file shows the holiday calendar used in prediction views.
import React, { useState } from 'react';
import { INDIAN_HOLIDAYS } from '../utils/predictionEngine';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// This function returns the number of days in a month.
function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}

// This function returns the starting weekday of a month.
function getFirstDayOfMonth(year, month) {
    return new Date(year, month, 1).getDay();
}

// This component renders the calendar month view.
function CalendarMonth({ year, month, holidays }) {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const days = [];
    for (let i = 0; i < firstDay; i++) {
        days.push(null); // empty slots before 1st
    }
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(i);
    }

    // Find holidays for this month
    // month + 1 because INDIAN_HOLIDAYS.month is 1-indexed (1-12)
    const monthHolidays = holidays.filter(h => h.month === month + 1);

    return (
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h4 style={{ color: 'white', fontSize: '19px', fontWeight: 700, textAlign: 'center', marginBottom: '16px' }}>
                {MONTHS[month]} {year}
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px' }}>
                {DAYS.map(d => (
                    <div key={d} style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 600, textAlign: 'center' }}>
                        {d}
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                {days.map((day, idx) => {
                    if (!day) return <div key={`empty-${idx}`} />;

                    // This function handles holiday.
                    const holiday = monthHolidays.find(h => {
                        const diff = Math.abs(day - h.date);
                        return diff <= h.radius;
                    });

                    const isActualDate = monthHolidays.find(h => h.date === day);
                    const isRush = !!holiday && !isActualDate;

                    let bg = 'rgba(255,255,255,0.05)';
                    let color = '#e2e8f0';
                    let title = '';
                    let border = '1px solid transparent';

                    if (isActualDate) {
                        // Peak holiday
                        const severity = isActualDate.severity;
                        if (severity > 19) { bg = 'rgba(239,68,68,0.2)'; color = '#fca5a5'; border = '1px solid rgba(239,68,68,0.5)'; }
                        else if (severity > 14) { bg = 'rgba(249,115,22,0.2)'; color = '#fdba74'; border = '1px solid rgba(249,115,22,0.5)'; }
                        else { bg = 'rgba(234,179,8,0.2)'; color = '#fde047'; border = '1px solid rgba(234,179,8,0.5)'; }
                        title = `${isActualDate.name} (Peak Risk)`;
                    } else if (isRush) {
                        // Rush window
                        bg = 'rgba(255,255,255,0.08)';
                        const severity = holiday.severity;
                        if (severity > 19) { color = '#f87171'; }
                        else if (severity > 14) { color = '#fb923c'; }
                        else { color = '#facc15'; }
                        title = `${holiday.name} Rush Window`;
                    }

                    return (
                        <div
                            key={day}
                            title={title}
                            style={{
                                aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                borderRadius: '6px', background: bg, color: color, fontSize: '16px',
                                border, cursor: title ? 'help' : 'default', fontWeight: (isActualDate || isRush) ? 700 : 500,
                                position: 'relative'
                            }}
                        >
                            {day}
                            {(isActualDate || isRush) && (
                                <div style={{ position: 'absolute', bottom: '2px', width: '4px', height: '4px', borderRadius: '50%', background: color }} />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// This component renders the holiday calendar view.
export default function HolidayCalendar({ onClose }) {
    // Show current month and next month
    const [date, setDate] = useState(new Date());

    const year1 = date.getFullYear();
    const month1 = date.getMonth();

    // Calculate next month correctly handling December roll-over
    const year2 = month1 === 11 ? year1 + 1 : year1;
    // This function handles month2.
    const month2 = (month1 + 1) % 12;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(8px)',
            zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px', animation: 'fadeIn 0.3s ease'
        }}>
            <div style={{
                background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '800px',
                maxHeight: '90vh', overflowY: 'auto',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div>
                        <h2 style={{ color: 'white', fontSize: '27px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            📅 Holiday Risk Calendar
                        </h2>
                        <p style={{ color: '#94a3b8', fontSize: '17px', margin: '4px 0 0 0' }}>
                            View historical periods of high traffic and elevated flight delay risk across India.
                        </p>
                    </div>
                    <button onClick={onClose} style={{
                        background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white',
                        width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer',
                        fontSize: '21px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'background 0.2s'
                    }}>✕</button>
                </div>

                {/* Month Navigation */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                    <button
                        onClick={() => setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1))}
                        style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}
                    >
                        ← Prev Month
                    </button>
                    <button
                        onClick={() => setDate(new Date())}
                        style={{ background: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)', padding: '6px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                    >
                        Return to Today
                    </button>
                    <button
                        onClick={() => setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1))}
                        style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}
                    >
                        Next Month →
                    </button>
                </div>

                {/* Legend */}
                <div style={{ display: 'flex', gap: '20px', marginBottom: '24px', flexWrap: 'wrap', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.5)' }} />
                        <span style={{ color: '#e2e8f0', fontSize: '16px' }}>Critical Risk (e.g. Diwali)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'rgba(249,115,22,0.2)', border: '1px solid rgba(249,115,22,0.5)' }} />
                        <span style={{ color: '#e2e8f0', fontSize: '16px' }}>High Risk (e.g. Christmas)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'rgba(234,179,8,0.2)', border: '1px solid rgba(234,179,8,0.5)' }} />
                        <span style={{ color: '#e2e8f0', fontSize: '16px' }}>Moderate Risk (e.g. Navratri)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#fb923c' }} />
                        <span style={{ color: '#e2e8f0', fontSize: '16px' }}>Surplus Rush Window</span>
                    </div>
                </div>

                {/* Calendars side-by-side on large screens, stacked on small */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                    <CalendarMonth year={year1} month={month1} holidays={INDIAN_HOLIDAYS} />
                    <CalendarMonth year={year2} month={month2} holidays={INDIAN_HOLIDAYS} />
                </div>
            </div>
        </div>
    );
}
