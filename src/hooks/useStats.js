import { useState, useEffect, useRef, useCallback } from 'react';

const REFRESH_MS = 5 * 60 * 1000; // 5 minutes

export function useStats() {
  const [data,        setData]        = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const timer = useRef(null);
  const mounted = useRef(true);

  const fetch = useCallback(async () => {
    try {
      const res  = await window.fetch('/api/stats');
      const json = await res.json();
      if (!mounted.current) return;
      if (json.ok) {
        setData(json);
        setError(null);
        setLastUpdated(new Date());
      } else {
        setError(json.error || 'Failed to load');
      }
    } catch (e) {
      if (mounted.current) setError('Network error — retrying…');
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, []);

  const schedule = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => { fetch(); schedule(); }, REFRESH_MS);
  }, [fetch]);

  // Pause when tab hidden, resume immediately when visible
  useEffect(() => {
    const onVis = () => { if (!document.hidden) { clearTimeout(timer.current); fetch().then(schedule); } };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [fetch, schedule]);

  useEffect(() => {
    mounted.current = true;
    fetch().then(schedule);
    return () => { mounted.current = false; clearTimeout(timer.current); };
  }, [fetch, schedule]);

  return { data, loading, error, lastUpdated, refresh: () => { clearTimeout(timer.current); fetch().then(schedule); } };
}
