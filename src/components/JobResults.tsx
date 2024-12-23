import React from 'react';
import { useSearchStore } from '../stores/searchStore';
import { useJobs } from '../hooks/useJobs';
import JobCard from './JobCard';

export default function JobResults() {
  const { query, location, keywords } = useSearchStore();
  const { data: jobs, isLoading, error } = useJobs({
    query,
    location,
    keywords,
    enabled: Boolean(query)
  });

  if (error) {
    return (
      <div className="mb-8 p-4 bg-red-100 text-red-700 rounded-lg">
        Failed to fetch jobs. Please try again.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Searching for jobs...</p>
      </div>
    );
  }

  if (!jobs?.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">
          {query ? 'No jobs found. Try different search criteria.' : 'Start searching for jobs by entering your criteria above.'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {jobs.map(job => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
}