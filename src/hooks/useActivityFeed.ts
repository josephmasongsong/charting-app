'use client';
import { useEffect, useState } from 'react';

export function useActivityFeed() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchActivityFeed() {
      try {
        const response = await fetch('/api/activity-feed?limit=500');
        if (!response.ok) throw new Error('Failed to fetch');

        const data = await response.json();
        setActivities(data.activities);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchActivityFeed();
  }, []);

  return { activities, loading, error };
}
