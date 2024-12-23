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

    // Log the HTML structure for debugging
    console.log('HTML Structure:', $.html());

    // Try multiple potential selectors for job listings
    $('div.gws-plugins-horizon-jobs__tl-lif, div.g, div[jscontroller], div[data-ved]').each((i, element) => {
      try {
        const el = $(element);
        
        // Try multiple selectors for each field
        const title = el.find('div[role="heading"], h3, .jcs-JobTitle').first().text().trim();
        const company = el.find('.company-name, .business-name, div[class*="company"]').first().text().trim();
        const jobLocation = el.find('div[class*="location"], .location').first().text().trim() || location;
        const description = el.find('div[class*="description"], div[class*="snippet"], .job-snippet').first().text().trim();
        const url = el.find('a[href*="google.com/search"]').attr('href') || searchUrl;

        console.log('Found potential job:', { title, company, jobLocation, description: description.substring(0, 100) });

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
    
    // If no jobs found, log a sample of the HTML for debugging
    if (jobs.length === 0) {
      console.log('No jobs found. Sample HTML:', data.substring(0, 2000));
      console.log('Available classes:', {
        headings: $('div[role="heading"]').length,
        jobTitles: $('.jcs-JobTitle').length,
        companies: $('.company-name').length,
        locations: $('div[class*="location"]').length
      });
    }

    return jobs;
  } catch (error) {
    console.error('Error scraping jobs:', error);
    throw error;
  }
}