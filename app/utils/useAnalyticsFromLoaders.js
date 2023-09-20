import {useMatches} from '@remix-run/react';

export function useAnalyticsFromLoaders(dataKey = 'analytics') {
  const matches = useMatches();
  const data = {};

  matches.forEach((event) => {
    const eventData = event?.data;
    if (eventData && eventData[dataKey]) {
      Object.assign(data, eventData[dataKey]);
    }
  });

  return data;
}
