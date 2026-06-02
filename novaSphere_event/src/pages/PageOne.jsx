import { useState, useEffect } from "react";
import "../styles/PageOne.css";

const API_URL = "http://localhost:3001";

export default function PageOne({ onNavigate }) {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDescription, setNewEventDescription] = useState("");
  const [newEventDate, setNewEventDate] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
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


  async function handleApiResponse(response, errorMessage) {
    if (!response.ok) {
      throw new Error(errorMessage);
    }
    return response.status === 204 ? null : response.json();
  }


  const addEvent = async () => {
    if (newEventTitle.trim() && newEventDate) {
      const payload = {
        title: newEventTitle,
        description: newEventDescription,
        date: newEventDate,
      };

      try {
        const response = await fetch(`${API_URL}/events`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const createdEvent = await handleApiResponse(
          response,
          "ERROR! Event konnte nicht gespeichert werden!"
        );

        setEvents((prevEvents) => [...prevEvents, createdEvent]);
        setNewEventTitle("");
        setNewEventDescription("");
        setNewEventDate("");
      } catch (err) {
        setError(err.message);
      }
    }
  };
  const startEdit = (id, title, description, date) => {
    setEditingId(id);
    setEditTitle(title);
    setEditDescription(description);
    setEditDate(date);
  };

  const saveEdit = async (id) => {
    try {
      const response = await fetch(`${API_URL}/events/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
          date: editDate,
        }),
      });

      const updatedEvent = await handleApiResponse(
        response,
        "ERROR! Event konnte nicht aktualisiert werden!"
      );

      setEvents((prevEvents) =>
        prevEvents.map((event) => (event.id === id ? updatedEvent : event))
      );
      setEditingId(null);
      setEditTitle("");
      setEditDescription("");
      setEditDate("");
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteEvent = async (id) => {
    try {
      const response = await fetch(`${API_URL}/events/${id}`, {
        method: "DELETE",
      });

      await handleApiResponse(
        response,
        "ERROR! Event konnte nicht gelöscht werden!"
      );

      setEvents((prevEvents) => prevEvents.filter((event) => event.id !== id));
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
        <h2>Bevorstehende Events ({events.length})</h2>
        {events.length === 0 ? (
          <p className="no-events">Keine Events vorhanden</p>
        ) : (
          <ul className="events-list">
            {events.map((event) => (
              <li key={event.id} className="event-item">
                <div className="event-info">
                  <strong>{event.title}</strong>
                  <strong>{event.description}</strong>
                  <span className="event-date">{event.date}</span>
                </div>
                <div className="event-buttons">
                  <button
                    className="edit-button"
                    onClick={() => startEdit(event.id, event.title, event.description, event.date)}
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