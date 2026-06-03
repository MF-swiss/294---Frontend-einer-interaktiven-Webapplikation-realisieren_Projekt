import { useState, useEffect } from "react";
import "../styles/PageOne.css";

const API_URL = import.meta.env.VITE_API_URL;

const sortByDate = (arr) =>
  [...arr].sort((a, b) => new Date(a.date) - new Date(b.date));

export default function PageOne({ onNavigate }) {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [validationError, setValidationError] = useState("");
  const [editValidationError, setEditValidationError] = useState("");
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDescription, setNewEventDescription] = useState("");
  const [newEventDate, setNewEventDate] = useState("");
  const [newEventDescription, setNewEventDescription] = useState("");
  const [newEventLocation, setNewEventLocation] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editLocation, setEditLocation] = useState("");
    
  useEffect(() => {
    async function loadEvents() {
      try {
        const response = await fetch(`${API_URL}/events`);
        if (!response.ok) {
          throw new Error("ERROR! Die Events konnten nicht geladen werden!");
        }
        const data = await response.json();
        setEvents(data.events || data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    loadEvents();
  }, []);

  const addEvent = async () => {
    if (newEventTitle.trim() && newEventDate && newEventDescription.trim() && newEventLocation.trim()) {
      const newEvent = {
        title: newEventTitle,
        date: newEventDate,
        description: newEventDescription,
        location: newEventLocation,
      };
      try {
        const response = await fetch(`${API_URL}/events`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newEvent),
        });
        if (!response.ok) throw new Error("Fehler beim Hinzufügen!");
        const addedEvent = await response.json();
        setEvents([...events, addedEvent]);
        setNewEventTitle("");
        setNewEventDate("");
        setNewEventDescription("");
        setNewEventLocation("");
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const startEdit = (id, title, date, description, location) => {
    setEditingId(id);
    setEditTitle(title);
    setEditDescription(description);
    setEditDate(date);
    setEditDescription(description);
    setEditLocation(location);
  };

  const saveEdit = async (id) => {
    const editedEvent = { 
      title: editTitle, 
      date: editDate,
      description: editDescription,
      location: editLocation
    };
    try {
      const response = await fetch(`${API_URL}/events/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedEvent),
      });
      if (!response.ok) throw new Error("Fehler beim Bearbeiten!");
      const updatedEvent = await response.json();
      const updatedEvents = events.map((event) => 
        event.id === id ? updatedEvent : event
      );
      setEvents(updatedEvents);
      setEditingId(null);
      setEditTitle("");
      setEditDate("");
      setEditDescription("");
      setEditLocation("");
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteEvent = async (id) => {
    try {
      const response = await fetch(`${API_URL}/events/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Fehler beim Löschen!");
      setEvents(events.filter((event) => event.id !== id));
    } catch (err) {
      setError(err.message);
    }
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
            type="text"
            placeholder="Beschreibung"
            value={newEventDescription}
            onChange={(e) => setNewEventDescription(e.target.value)}
          />
          <input
            type="date"
            value={newEventDate}
            onChange={(e) => setNewEventDate(e.target.value)}
          />
          <input
            type="text"
            placeholder="Ort"
            value={newEventLocation}
            onChange={(e) => setNewEventLocation(e.target.value)}
          />
          <button className="add-button" onClick={addEvent}>
            Hinzufügen
          </button>
          {validationError && (
            <div className="error-message" style={{ color: "red", marginTop: "10px", fontWeight: "bold" }}>
              {validationError}
            </div>
          )}
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
              type="text"
              placeholder="Beschreibung"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
            />
            <input
              type="date"
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
            />
            <input
              type="text"
              placeholder="Ort"
              value={editLocation}
              onChange={(e) => setEditLocation(e.target.value)}
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
            {editValidationError && (
              <div className="error-message" style={{ color: "red", marginTop: "10px", fontWeight: "bold" }}>
                {editValidationError}
              </div>
            )}
          </div>
        </section>
      )}

      <section className="events-list-section">
        <h2>Bevorstehende Events ({events.length})</h2>
        {events.length === 0 ? (
          <p className="no-events">Keine Events vorhanden</p>
        ) : (
          <ul className="events-list">
            {events.map((event) => (
              <li
                key={event.id}
                className={`event-item ${new Date(event.date) < new Date(new Date().toDateString()) ? "expired" : ""}`}
              >
                <div className="event-info">
                  <strong>{event.title || event.description}</strong>
                  <p className="event-description">{event.description}</p>
                  <span className="event-date">{event.date}</span>
                  <span className="event-location">{event.location}</span>
                </div>
                <div className="event-buttons">
                  <button
                    className="edit-button"
                    onClick={() => startEdit(event.id, event.title, event.date, event.description, event.location)}
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