import NodeCache from 'node-cache';

export function setupCache() {
  return new NodeCache({
    stdTTL: 3600, // Cache for 1 hour
    checkperiod: 120 // Check for expired entries every 2 minutes
  });
}