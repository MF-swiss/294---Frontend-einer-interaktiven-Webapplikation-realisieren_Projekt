import { useEffect, useState, useRef } from 'react';

/**
 * Countdown component
 * Props:
 * - targetDate: Date | number | string (will be parsed with `new Date(...)`)
 * - onComplete?: () => void  (optional callback when countdown reaches zero)
 */
export default function Countdown({ targetDate, onComplete } = {}) {
  const [parts, setParts] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const timerRef = useRef(null);

  // Parse the passed targetDate into a timestamp (ms)
  const parseTarget = (d) => {
    if (!d) return NaN;
    if (typeof d === 'number') return d;
    if (d instanceof Date) return d.getTime();
    const parsed = Date.parse(d);
    return Number.isNaN(parsed) ? NaN : parsed;
  };

  useEffect(() => {
    const targetTs = parseTarget(targetDate);
    if (Number.isNaN(targetTs)) {
      // invalid target; clear any existing timer and defer state update to avoid sync setState in effect
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        if (timerRef.current) {
          setParts({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        }
      }, 0);
      return;
    }

    let mounted = true;

    const update = () => {
      const now = Date.now();
      let distance = Math.max(0, targetTs - now);

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      if (mounted) setParts({ days, hours, minutes, seconds });

      if (distance === 0) {
        if (onComplete) onComplete();
        return; // stop scheduling
      }

      // Align next tick to the next full second to reduce drift
      const msToNextSecond = distance % 1000 || 1000;
      timerRef.current = setTimeout(update, msToNextSecond);
    };

    // run immediately
    update();

    return () => {
      mounted = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [targetDate, onComplete]);

  const pad = (n) => String(n).padStart(2, '0');

  return (
    <div className="countdown" aria-live="polite" style={{ textAlign: 'center', fontWeight: '600' }}>
      <span className="countdown-part">{parts.days}d</span>
      <span className="countdown-sep">&nbsp;:&nbsp;</span>
      <span className="countdown-part">{pad(parts.hours)}h</span>
      <span className="countdown-sep">&nbsp;:&nbsp;</span>
      <span className="countdown-part">{pad(parts.minutes)}m</span>
      <span className="countdown-sep">&nbsp;:&nbsp;</span>
      <span className="countdown-part">{pad(parts.seconds)}s</span>
    </div>
  );
}
