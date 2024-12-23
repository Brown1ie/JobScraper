import * as cheerio from 'cheerio';
import axios from 'axios';

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

export async function scrapeJobs(query, location, keywords) {
  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query + ' ' + location + ' jobs')}&ibp=htl;jobs`;
  
  try {
    console.log('Fetching jobs from:', searchUrl);
    
    const { data } = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': 'https://www.google.com'
      }
    });

    const $ = cheerio.load(data);
    const jobs = [];

    // Try different selectors that Google might use
    $('[class*="job-"], [class*="Job"], .iFjolb, .g').each((i, element) => {
      try {
        const el = $(element);
        const title = el.find('h3, .BjJfJf, [class*="title"]').first().text().trim();
        const company = el.find('.company, .vNEEBe, [class*="company"]').first().text().trim();
        const jobLocation = el.find('.location, .Qk80Jf, [class*="location"]').first().text().trim() || location;
        const description = el.find('.description, .HBvzbc, [class*="description"], [class*="snippet"]').first().text().trim();
        const url = el.find('a').attr('href') || searchUrl;

        if (title && (company || description)) {
          const shouldAdd = keywords.length === 0 || keywords.some(keyword => 
            description.toLowerCase().includes(keyword.toLowerCase()) ||
            title.toLowerCase().includes(keyword.toLowerCase())
          );

          if (shouldAdd) {
            jobs.push({
              id: generateId(),
              title,
              company: company || 'Company not specified',
              location: jobLocation || location || 'Location not specified',
              description: description || 'No description available',
              url,
              keywords: keywords.filter(keyword => 
                description.toLowerCase().includes(keyword.toLowerCase()) ||
                title.toLowerCase().includes(keyword.toLowerCase())
              ),
              datePosted: new Date().toISOString()
            });
          }
        }
      } catch (err) {
        console.error('Error processing job listing:', err);
      }
    });

    console.log(`Found ${jobs.length} jobs`);
    if (jobs.length === 0) {
      console.log('Page content:', data.substring(0, 1000)); // Log first 1000 chars for debugging
    }

    return jobs;
  } catch (error) {
    console.error('Error scraping jobs:', error);
    throw error;
  }
}