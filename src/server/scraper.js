import * as cheerio from 'cheerio';
import axios from 'axios';

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

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

    // Update selectors to match Google Jobs HTML structure
    $('.iFjolb').each((i, element) => {
      const title = $(element).find('.BjJfJf').text().trim();
      const company = $(element).find('.vNEEBe').text().trim();
      const jobLocation = $(element).find('.Qk80Jf').text().trim() || location;
      const description = $(element).find('.HBvzbc').text().trim();
      const url = $(element).find('a').attr('href') || searchUrl;
      
      // Only apply keyword filtering if keywords array is not empty
      const shouldAdd = keywords.length === 0 || keywords.some(keyword => 
        description.toLowerCase().includes(keyword.toLowerCase()) ||
        title.toLowerCase().includes(keyword.toLowerCase())
      );

      if (shouldAdd) {
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

    // If no jobs found, log the HTML for debugging
    if (jobs.length === 0) {
      console.log('No jobs found. HTML structure:', data);
    }

    return jobs;
  } catch (error) {
    console.error('Error scraping jobs:', error);
    throw error;
  }
}