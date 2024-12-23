import axios from 'axios';
import type { Job } from '../types/Job';

const API_URL = 'https://jobscraper-api-d1hj.onrender.com/api';

export async function searchJobs(
  query: string,
  location: string,
  keywords: string[]
): Promise<Job[]> {
  try {
    console.log('Sending request to:', `${API_URL}/jobs`);
    console.log('Request payload:', { query, location, keywords });

    const { data } = await axios.post(`${API_URL}/jobs`, {
      query,
      location,
      keywords
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log('Response data:', data);
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
    } else {
      console.error('Error fetching jobs:', error);
    }
    throw new Error('Failed to fetch jobs');
  }
}