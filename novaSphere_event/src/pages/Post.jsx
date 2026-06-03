import pictureFallback from '../assets/pictures/post-1.jpg';
import { useState, useEffect } from 'react';
import Countdown from '../components/Countdown';

const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3001';



export default function Post({ eventId } = {}) {
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const url = eventId ? `${apiBase}/events/${eventId}` : `${apiBase}/events`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Fehler beim Laden: ${res.status}`);
        const data = await res.json();
        const event = eventId ? data : Array.isArray(data) ? data[0] : data;
        if (mounted) setEventData(event || null);
      } catch (err) {
        if (mounted) setError(err.message || String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => { mounted = false; };
  }, [eventId]);

  if (loading) return <div className="post">Lädt...</div>;
  if (error) return <div className="post post-error">Fehler: {error}</div>;
  if (!eventData) return <div className="post">Kein Event gefunden.</div>;

  // Try to use an image URL from the API, otherwise fall back to the local picture
  const imgSrc = eventData.image || pictureFallback;
  const dateStr = eventData.date ? new Date(eventData.date).toLocaleDateString() : 'Datum unbekannt';

  return (
    <article className="post" style={{ backgroundImage: `url(${imgSrc})` }}>
      <h2>Nächstes Event</h2>
      <h1 className="post-title">{eventData.title || 'Nächstes Event'}</h1>
      <p className="post-date">Findet statt am {dateStr}</p>
      {eventData.description && <p className="post-description">{eventData.description}</p>}
      <h2 className="post-countdown"> In nur </h2>
      <Countdown targetDate={new Date("2026-12-31T23:59:59").getTime()} />
    </article>
  );
}