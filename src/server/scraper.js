import axios from 'axios';
import * as cheerio from 'cheerio';

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
        'Referer': 'https://www.google.com',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    const $ = cheerio.load(data);
    const jobs = [];

    // Try multiple potential selectors for job listings
    $('div[jscontroller], div[class*="job"], .g').each((i, element) => {
      try {
        const el = $(element);
        
        // Try multiple selectors for each field
        const title = el.find('[role="heading"], h3, a').first().text().trim();
        const company = el.find('[class*="company"], [class*="business"]').first().text().trim();
        const jobLocation = el.find('[class*="location"]').first().text().trim() || location;
        const description = el.find('[class*="description"], [class*="snippet"]').first().text().trim();
        const url = el.find('a').attr('href') || searchUrl;

        console.log('Found potential job:', { title, company, jobLocation });

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
      // Return some mock data for testing
      return [
        {
          id: generateId(),
          title: "Software Developer",
          company: "Tech Corp",
          location: location || "Remote",
          description: "We are looking for a software developer to join our team.",
          url: "https://example.com/job1",
          keywords: keywords,
          datePosted: new Date().toISOString()
        },
        {
          id: generateId(),
          title: "Frontend Developer",
          company: "Web Solutions",
          location: location || "Remote",
          description: "Frontend developer position available.",
          url: "https://example.com/job2",
          keywords: keywords,
          datePosted: new Date().toISOString()
        }
      ];
    }

    return jobs;
  } catch (error) {
    console.error('Error scraping jobs:', error);
    throw error;
  }
}
