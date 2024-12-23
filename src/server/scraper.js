import axios from 'axios';
import * as cheerio from 'cheerio';
import { generateId } from '../utils/helpers.js';

export async function scrapeJobs(query, location, keywords) {
  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query + ' ' + location + ' jobs')}&ibp=htl;jobs`;
  
  try {
    const { data } = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $ = cheerio.load(data);
    const jobs = [];

    $('.job-card').each((i, element) => {
      const title = $(element).find('.title').text().trim();
      const company = $(element).find('.company').text().trim();
      const jobLocation = $(element).find('.location').text().trim() || location;
      const description = $(element).find('.description').text().trim();
      const url = $(element).find('a').attr('href');
      
      // Check if job matches keywords
      const matchesKeywords = keywords.some(keyword => 
        description.toLowerCase().includes(keyword.toLowerCase()) ||
        title.toLowerCase().includes(keyword.toLowerCase())
      );

      if (matchesKeywords) {
        jobs.push({
          id: generateId(),
          title,
          company,
          location: jobLocation,
          description,
          url,
          keywords: keywords.filter(keyword => 
            description.toLowerCase().includes(keyword.toLowerCase()) ||
            title.toLowerCase().includes(keyword.toLowerCase())
          ),
          datePosted: new Date().toISOString()
        });
      }
    });

    return jobs;
  } catch (error) {
    console.error('Error scraping jobs:', error);
    throw error;
  }
}