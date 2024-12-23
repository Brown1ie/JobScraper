import React from 'react';
import { Building2, MapPin, ExternalLink } from 'lucide-react';
import type { Job } from '../types/Job';

interface JobCardProps {
  job: Job;
}

export default function JobCard({ job }: JobCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
          <div className="flex items-center gap-2 text-gray-600 mt-2">
            <Building2 className="h-4 w-4" />
            <span>{job.company}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 mt-1">
            <MapPin className="h-4 w-4" />
            <span>{job.location}</span>
          </div>
        </div>
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800"
        >
          <ExternalLink className="h-5 w-5" />
        </a>
      </div>
      
      <div className="mt-4">
        <p className="text-gray-700 line-clamp-3">{job.description}</p>
      </div>
      
      <div className="mt-4 flex flex-wrap gap-2">
        {job.keywords.map((keyword, index) => (
          <span
            key={index}
            className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
          >
            {keyword}
          </span>
        ))}
      </div>
      
      <div className="mt-4 text-sm text-gray-500">
        Posted: {new Date(job.datePosted).toLocaleDateString()}
      </div>
    </div>
  );
}