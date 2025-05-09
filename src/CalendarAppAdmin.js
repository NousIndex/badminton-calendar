import React, { useRef, useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { v4 as uuidv4 } from 'uuid';
import './CalendarApp.css';

const CalendarAppAdmin = () => {
  const [events, setEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  const [isSaving, setIsSaving] = useState(false);
  const [initialView, setInitialView] = useState('dayGridMonth');
  const calendarRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const [newEvent, setNewEvent] = useState(false);
  const [activeEvent, setActiveEvent] = useState(null);
  const [formData, setFormData] = useState({ title: '', date: '', time: '' });
  const [modalTitle, setModalTitle] = useState('Edit Event');
  const modalRef = useRef(null);

  const handleDateClick = (arg) => {
    setModalTitle('Add Event');
    setFormData({
      uuid: uuidv4(),
      title: 'SBH@Sims',
      dateStart: arg.dateStr,
      timeStart: '20:00',
      timeEnd: '22:00',
      court: '',
    });
    setNewEvent(true);
    setShowModal(true);
  };

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

  const formatTo12Hour = (time24) => {
    const [hour, minute] = time24.split(':');
    const hourInt = parseInt(hour, 10);
    const suffix = hourInt >= 12 ? 'PM' : 'AM';
    const hour12 = hourInt % 12 || 12; // Convert 0 or 12 hours to 12
    return `${hour12}:${minute} ${suffix}`;
  };

  const createBooking = async (bookingData) => {
    const { color, ...cleanedEvent } = bookingData;
    const res = await fetch(
      'https://badminton-calendar.vercel.app/api/createEvent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanedEvent),
      }
    );

    const data = await res.json();
    console.log('Created:', data);
  };

  const callCourtPlacePollWork = async (bookingData) => {
    await fetch(
      'https://badminton-bookie123.vercel.app/court_place_poll_work',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          auth_key: 'K6iEEmI8NwWGS7VAzicLGTHWtmpkB/2AZtJY5myz8dI=',
        },
        body: JSON.stringify({
          start: bookingData.start,
          end: bookingData.end,
          location: bookingData.title,
        }),
      }
    );
  };

  const updateBooking = async (updatedData) => {
    const { color, ...cleanedEvent } = updatedData;
    const res = await fetch(
      'https://badminton-calendar.vercel.app/api/updateEvent',
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanedEvent),
      }
    );
    const data = await res.json();
    console.log('Updated:', data);
  };

  const deleteBooking = async (uuid) => {
    const res = await fetch(
      'https://badminton-calendar.vercel.app/api/deleteEvent',
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uuid }),
      }
    );
    const data = await res.json();
    console.log('Deleted:', data);
  };

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

  //27ae60 Green
  //e67e22 orange
  //3788d8 blue
  //7f8c8d gray
  //e74c3c red
  //f1c40f yellow
  //9b59b6 purple

  const fetchBookings = async () => {
    const res = await fetch(
      'https://badminton-calendar.vercel.app/api/getEvents'
    );
    const data = await res.json();
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const filteredAndSorted = data
        .filter((event) => new Date(event.end) >= today) // Exclude past events
        .sort((a, b) => new Date(a.start) - new Date(b.start)); // Sort by closest

      const coloredEvents2 = filteredAndSorted.map((event) => ({
        ...event,
        color: getColorByTitle(event.title),
      }));

      const coloredEvents = data.map((event) => ({
        ...event,
        color: getColorByTitle(event.title),
      }));

      setEvents(coloredEvents);
      setUpcomingEvents(coloredEvents2);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleEventClick = (clickInfo) => {
    setModalTitle('Edit Event');
    const event = clickInfo.event;
    setActiveEvent(event);
    try {
      setFormData({
        uuid: event.extendedProps.uuid,
        title: event.title,
        dateStart: event.startStr.split('T')[0],
        timeStart: event.startStr.split('T')[1].slice(0, 5),
        timeEnd: event.endStr.split('T')[1].slice(0, 5),
        court: event.extendedProps.court_no,
      });
    } catch {
      setFormData({
        uuid: event.extendedProps.uuid,
        title: event.title,
        dateStart: event.startStr.split('T')[0],
        timeStart: event.startStr.split('T')[1].slice(0, 5),
        timeEnd: event.startStr.split('T')[1].slice(0, 5),
        court: event.extendedProps.court_no,
      });
    }
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const updatedTitle = formData.title;
      const updatedStart =
        formData.dateStart + 'T' + formData.timeStart + ':00';
      const updatedEnd = formData.dateStart + 'T' + formData.timeEnd + ':00';
      const color = getColorByTitle(updatedTitle);

      if (activeEvent && !newEvent) {
        // Update the local state `events` array
        setEvents((prevEvents) =>
          prevEvents.map((event) =>
            event.uuid === activeEvent.extendedProps.uuid
              ? {
                  ...event,
                  uuid: activeEvent.extendedProps.uuid,
                  title: updatedTitle,
                  start: updatedStart,
                  end: updatedEnd,
                  color: color,
                  court_no: formData.court,
                }
              : event
          )
        );
        // Update the event in the database
        updateBooking({
          uuid: activeEvent.extendedProps.uuid,
          title: updatedTitle,
          start: updatedStart,
          end: updatedEnd,
          color: color,
          court_no: formData.court,
        });
      } else if (newEvent) {
        setEvents([
          ...events,
          {
            uuid: uuidv4(),
            title: updatedTitle,
            start: updatedStart,
            end: updatedEnd,
            color: color,
            court_no: formData.court,
          },
        ]);
        createBooking({
          uuid: uuidv4(),
          title: updatedTitle,
          start: updatedStart,
          end: updatedEnd,
          color: color,
          court_no: formData.court,
        });
        callCourtPlacePollWork({
          uuid: uuidv4(),
          title: updatedTitle,
          start: updatedStart,
          end: updatedEnd,
          color: color,
          court_no: formData.court,
        });
      }
    } catch (error) {
      console.error('Error saving event:', error);
    } finally {
      setIsSaving(false);
      setNewEvent(false);
      setShowModal(false);
    }
  };

  const handleDelete = () => {
    console.log('Delete:', activeEvent.extendedProps.uuid);
    setEvents(
      events.filter((event) => event.uuid !== activeEvent.extendedProps.uuid)
    );
    deleteBooking(activeEvent.extendedProps.uuid);
    setShowModal(false);
  };

  const handleEventClickCard = (clickInfo) => {
    const event = clickInfo.event;
    setActiveEvent(event);
    try {
      setFormData({
        title: event.title,
        dateStart: event.start.split('T')[0],
        timeStart: event.start.split('T')[1].slice(0, 5),
        dateEnd: event.end.split('T')[0],
        timeEnd: event.end.split('T')[1].slice(0, 5),
        court: event.court_no,
      });
    } catch {
      setFormData({
        title: event.title,
        dateStart: event.startStr.split('T')[0],
        timeStart: event.startStr.split('T')[1].slice(0, 5),
        dateEnd: event.startStr.split('T')[0],
        timeEnd: event.startStr.split('T')[1].slice(0, 5),
        court: event.court_no,
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

  return (
    <div
      className="App"
      style={{ padding: '1rem' }}
    >
      <h2 style={{ textAlign: 'center' }}>🏸 Badminton Court Calendar</h2>
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={initialView}
        headerToolbar={{
          start: 'title',
          center: 'dayGridMonth,timeGridWeek,timeGridDay today,prev,next',
          end: '',
        }}
        buttonText={{
          today: 'Today',
          dayGridMonth: 'Month',
          timeGridWeek: 'Week',
          timeGridDay: 'Day',
        }}
        editable={true}
        selectable={true}
        dateClick={handleDateClick}
        events={events}
        height="auto"
        eventClick={handleEventClick}
        eventDisplay="block"
      />
      <div className="upcoming-events">
        <h3>🎯 Upcoming Courts</h3>
        <div className="event-list">
          {upcomingEvents.length > 0 ? (
            upcomingEvents.map((event, index) => (
              <div
                key={index}
                className="event-card"
                style={{
                  borderLeft: `5px solid ${getColorByTitle(event.title)}`,
                }}
                onClick={() => handleEventClickCard({ event })}
              >
                <div className="event-title">{event.title}</div>
                <div className="event-date-time">
                  🏸 Court {event.court_no}
                  <br />
                  📅 {new Date(event.start).toLocaleDateString()}
                  <br />⏰{' '}
                  {formatTo12Hour(event.start.split('T')[1].slice(0, 5))} -{' '}
                  {formatTo12Hour(event.end.split('T')[1].slice(0, 5))}
                </div>
                <a
                  className="event-link"
                  href={getLocationByTitle(event.title)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()} // Prevent modal from opening
                >
                  🗺️ Google Maps
                </a>
              </div>
            ))
          ) : (
            <p>No upcoming events</p>
          )}
        </div>
      </div>
      {/* Modal for editing event */}
      {showModal && (
        <div className="modal-backdrop">
          <div
            className="modal"
            ref={modalRef}
          >
            <div className="modal-top">
              <h3>{modalTitle}</h3>
              {modalTitle === 'Edit Event' && (
                <button onClick={handleDelete}>Delete</button>
              )}
            </div>
            <label>
              Location:
              <select
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="custom-dropdown"
              >
                <option value="SBH@Sims">SBH@Sims</option>
                <option value="OBA Arena@Sprout Hub">
                  OBA Arena@Sprout Hub
                </option>
                <option value="KFF Arena">KFF Arena</option>
                <option value="Delta Sports Hall">Delta Sports Hall</option>
                <option value="Stadium">Stadium</option>
              </select>
            </label>
            <label>
              Court:
              <input
                name="court"
                type="text"
                value={formData.court}
                onChange={handleInputChange}
                maxLength={4}
              />
            </label>
            <label>
              Date:
              <input
                name="dateStart"
                type="date"
                value={formData.dateStart}
                onChange={handleInputChange}
              />
            </label>
            <label>
              Start Time:
              <input
                name="timeStart"
                type="time"
                value={formData.timeStart}
                onChange={handleInputChange}
              />
            </label>
            <label>
              End Time:
              <input
                name="timeEnd"
                type="time"
                value={formData.timeEnd}
                onChange={handleInputChange}
              />
            </label>
            <div className="modal-buttons">
              <button
                onClick={handleSave}
                disabled={isSaving}
              >
                Save
              </button>
              <button onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarAppAdmin;
