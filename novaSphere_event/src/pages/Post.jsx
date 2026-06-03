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

        let event = null;
        if (eventId) {
          event = data;
        } else if (Array.isArray(data)) {
          // map dates to timestamps
          const withTs = data.map((e) => ({ ...e, _ts: Date.parse(e.date) }));
          const now = Date.now();
          // upcoming events: ts > now
          const upcoming = withTs.filter((e) => !Number.isNaN(e._ts) && e._ts > now).sort((a, b) => a._ts - b._ts);
          if (upcoming.length) {
            event = upcoming[0];
          } else {
            // fallback: most recent past event
            const past = withTs.filter((e) => !Number.isNaN(e._ts) && e._ts <= now).sort((a, b) => b._ts - a._ts);
            event = past.length ? past[0] : null;
          }
        } else {
          event = data;
        }

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
      <h1 className="post-title">{eventData.title || 'Nächstes Event'}</h1>
      <h2 className="post-date">Findet statt am <strong>{dateStr}</strong></h2>
      {eventData.description && <h3 className="post-description">{eventData.description}</h3>}
      <Countdown targetDate={eventData.date} onComplete={() => console.log('Event erreicht')} />
    </article>
  );
}