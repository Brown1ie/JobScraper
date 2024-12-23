import { useQuery } from 'react-query';
import { searchJobs } from '../services/api';
import type { Job } from '../types/Job';

interface UseJobsParams {
  query: string;
  location: string;
  keywords: string[];
  enabled?: boolean;
}

export function useJobs({ query, location, keywords, enabled = true }: UseJobsParams) {
  return useQuery<Job[], Error>(
    ['jobs', query, location, keywords],
    () => searchJobs(query, location, keywords),
    {
      enabled,
      staleTime: 1000 * 60 * 5, // Consider data stale after 5 minutes
      cacheTime: 1000 * 60 * 30, // Keep data in cache for 30 minutes
      retry: 2
    }
  );
}