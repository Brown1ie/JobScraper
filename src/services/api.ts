import axios from 'axios';
import type { Job } from '../types/Job';

const API_URL = 'https://jobscraper-api-d1hj.onrender.com/api';

export async function searchJobs(
  query: string,
  location: string,
  keywords: string[]
): Promise<Job[]> {
  try {
    const { data } = await axios.post(`${API_URL}/jobs`, {
      query,
      location,
      keywords
    });
    return data;
  } catch (error) {
    console.error('Error fetching jobs:', error);
    throw new Error('Failed to fetch jobs');
  }
}