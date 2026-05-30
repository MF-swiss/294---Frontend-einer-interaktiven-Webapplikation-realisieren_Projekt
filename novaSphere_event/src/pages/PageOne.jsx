import { useState, useEffect } from "react";
import "../styles/PageOne.css";

const API_URL = "http://localhost:3001";

export default function PageOne({ onNavigate }) {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDate, setNewEventDate] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDate, setEditDate] = useState("");
    
  useEffect(() => {
    async function loadEvents() {
      try {
        const response = await fetch(`${API_URL}/events`);
        if (!response.ok) {
          throw new Error("ERROR! Die Events konnten nicht geladen werden!");
        }
        const data = await response.json();
        setEvents(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    loadEvents();
  }, []);



  const addEvent = () => {
    if (newEventTitle.trim() && newEventDate) {
      const newEvent = {
        id: Date.now(),
        title: newEventTitle,
        date: newEventDate,
      };
      setEvents([...events, newEvent]);
      setNewEventTitle("");
      setNewEventDate("");
    }
  };
  const startEdit = (id, title, date) => {
    setEditingId(id);
    setEditTitle(title);
    setEditDate(date);
  };

  const saveEdit = (id) => {
    const updatedEvents = events.map((event) => {
      if (event.id === id) {
        return { ...event, title: editTitle, date: editDate };
      }
      return event;
    });
    setEvents(updatedEvents);
    setEditingId(null);
    setEditTitle("");
    setEditDate("");
  };

  const deleteEvent = (id) => {
    setEvents(events.filter((event) => event.id !== id));
  };

    if (isLoading) {
    return (
      <div>
        <h1>Events</h1>
        <p>Lade Events...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div>
        <h1>Events</h1>
        <p>Fehler: {error}</p>
        <button onClick={() => window.location.reload()}>
         Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="page-container">
      <section className="page-header">
        <h1>Events Verwalten</h1>
        <button className="back-button" onClick={() => onNavigate("home")}>
          ← Zurück
        </button>
      </section>

      <section className="add-event-section">
        <h2>Neues Event hinzufügen</h2>
        <div className="form-group">
          <input
            type="text"
            placeholder="Event Titel"
            value={newEventTitle}
            onChange={(e) => setNewEventTitle(e.target.value)}
          />
          <input
            type="date"
            value={newEventDate}
            onChange={(e) => setNewEventDate(e.target.value)}
          />
          <button className="add-button" onClick={addEvent}>
            Hinzufügen
          </button>
        </div>
      </section>

      {editingId && (
        <section className="add-event-section">
          <h2>Event bearbeiten</h2>
          <div className="form-group">
            <input
              type="text"
              placeholder="Event Titel"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
            />
            <input
              type="date"
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
            />
            <button className="add-button" onClick={() => saveEdit(editingId)}>
              Speichern
            </button>
            <button 
              className="delete-button" 
              onClick={() => setEditingId(null)}
            >
              Abbrechen
            </button>
          </div>
        </section>
      )}

      <section className="events-list-section">
        <h2>Events ({events.length})</h2>
        {events.length === 0 ? (
          <p className="no-events">Keine Events vorhanden</p>
        ) : (
          <ul className="events-list">
            {events.map((event) => (
              <li key={event.id} className="event-item">
                <div className="event-info">
                  <strong>{event.title}</strong>
                  <span className="event-date">{event.date}</span>
                </div>
                <div className="event-buttons">
                  <button
                    className="edit-button"
                    onClick={() => startEdit(event.id, event.title, event.date)}
                  >
                    Bearbeiten
                  </button>
                  <button
                    className="delete-button"
                    onClick={() => deleteEvent(event.id)}
                  >
                    Löschen
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}