import React, { useRef, useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import './CalendarApp.css';

const CalendarApp = () => {
  const [events, setEvents] = useState([]);

  const [initialView, setInitialView] = useState('dayGridMonth');
  const calendarRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const [activeEvent, setActiveEvent] = useState(null);
  const [formData, setFormData] = useState({ title: '', date: '', time: '' });
  const modalRef = useRef(null);

  function getColorByTitle(title) {
    switch (title) {
      case 'SBH@Sims':
        return '#3788d8';
      case 'OBA Arena@Sprout Hub':
        return '#e67e22';
      case 'KFF Arena':
        return '#7f8c8d';
      case 'Delta Sports Hall':
        return '#e74c3c';
      case 'Stadium':
        return '#f1c40f';
      default:
        return '#000000';
    }
  }

  function getLocationByTitle(title) {
    switch (title) {
      case 'SBH@Sims':
        return 'https://maps.app.goo.gl/e7KPiqXSaXxaaLX69';
      case 'OBA Arena@Sprout Hub':
        return 'https://maps.app.goo.gl/syLNgLojyv8dBWf48';
      case 'KFF Arena':
        return 'https://maps.app.goo.gl/5UyCTGS2FnGryXeW6';
      case 'Delta Sports Hall':
        return 'https://maps.app.goo.gl/m3XJfJu4ZNRZ5bhb7';
      case 'Stadium':
        return 'https://maps.app.goo.gl/3eV9hyNuNThAyyLC8';
      default:
        return '';
    }
  }

  const fetchBookings = async () => {
    const res = await fetch('https://badminton-calendar.vercel.app/api/get');
    const data = await res.json();
    try {
      const coloredEvents = data.map((event) => ({
        ...event,
        color: getColorByTitle(event.title),
      }));

      setEvents(coloredEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleEventClick = (clickInfo) => {
    const event = clickInfo.event;
    setActiveEvent(event);
    try {
      setFormData({
        title: event.title,
        dateStart: event.startStr.split('T')[0],
        timeStart: event.startStr.split('T')[1].slice(0, 5),
        dateEnd: event.endStr.split('T')[0],
        timeEnd: event.endStr.split('T')[1].slice(0, 5),
      });
    } catch {
      setFormData({
        title: event.title,
        dateStart: event.startStr.split('T')[0],
        timeStart: event.startStr.split('T')[1].slice(0, 5),
        dateEnd: event.startStr.split('T')[0],
        timeEnd: event.startStr.split('T')[1].slice(0, 5),
      });
    }
    setShowModal(true);
  };

  // Detect outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setShowModal(false);
      }
    };
    if (showModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showModal]);

  const formatTo12Hour = (time24) => {
    const [hour, minute] = time24.split(':');
    const hourInt = parseInt(hour, 10);
    const suffix = hourInt >= 12 ? 'PM' : 'AM';
    const hour12 = hourInt % 12 || 12; // Convert 0 or 12 hours to 12
    return `${hour12}:${minute} ${suffix}`;
  };

  return (
    <div
      className="App"
      style={{ padding: '1rem' }}
    >
      <h2 style={{ textAlign: 'center' }}>🏸 Badminton Calendar</h2>
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={initialView}
        headerToolbar={{
          start: 'title',
          center: 'dayGridMonth,timeGridWeek,timeGridDay today,prev,next',
          end: '',
        }}
        editable={false}
        selectable={false}
        events={events}
        height="auto"
        eventClick={handleEventClick}
        eventDisplay="block"
      />
      {showModal && (
        <div className="modal-backdrop">
          <div
            className="modal"
            ref={modalRef}
          >
            <h3>🏸Badminton Court</h3>
            <label>
              <h3 name="title">📍Location: {formData.title}</h3>
            </label>
            <label>
              <h3 name="title">📅Date: {formData.dateStart}</h3>
            </label>
            <label>
              <h3 name="title">
                ⏰Time: {formatTo12Hour(formData.timeStart)} -{' '}
                {formatTo12Hour(formData.timeEnd)}
              </h3>
            </label>
            <label style={{ marginBottom: '2rem' }}>
              🗺️{' '}
              <a
                href={getLocationByTitle(formData.title)}
                target="_blank"
                rel="noopener noreferrer"
              >
                Google Maps
              </a>
            </label>
            <div className="modal-buttons">
              <button onClick={() => setShowModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarApp;
