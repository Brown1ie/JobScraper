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
        
        // Try multiple ways to get the description
        let description = el.find('[class*="description"], [class*="snippet"], [class*="VwiC3b"]').first().text().trim();
        if (!description) {
          // Try to get description from the title text after company name
          const fullText = title.split(/\s{2,}/);
          if (fullText.length > 2) {
            description = fullText.slice(2).join(' ').trim();
          }
        }

        const url = el.find('a').attr('href') || searchUrl;

        console.log('Found potential job:', { title, company, jobLocation, description });

        // Only skip navigation and filter UI elements
        if (title && 
            !['Skip to main content', 'All', 'Choose area', 'Jobs'].includes(title) &&
            title !== '') {
          const shouldAdd = keywords.length === 0 || keywords.some(keyword => 
            description.toLowerCase().includes(keyword.toLowerCase()) ||
            title.toLowerCase().includes(keyword.toLowerCase()) ||
            (title + ' ' + description).toLowerCase().includes('no degree') ||
            (title + ' ' + description).toLowerCase().includes('degree not required')
          );

          if (shouldAdd) {
            // Extract company from title if not found separately
            const titleParts = title.split(/\s{2,}/);
            const extractedCompany = titleParts[1] || company || 'Company not specified';
            
            // Clean up the description
            const cleanDescription = description
              .replace(/•\s+via\s+[^•]+/, '') // Remove "via LinkedIn" etc.
              .replace(/\s+ago[^•]*/, '')     // Remove "X days ago"
              .replace(/Full-time.*$/, '')     // Remove "Full-time" etc.
              .trim();

            jobs.push({
              id: generateId(),
              title: titleParts[0],
              company: extractedCompany,
              location: jobLocation || location || 'Location not specified',
              description: cleanDescription || 'No description available',
              url,
              keywords: keywords.filter(keyword => 
                description.toLowerCase().includes(keyword.toLowerCase()) ||
                title.toLowerCase().includes(keyword.toLowerCase()) ||
                (title + ' ' + description).toLowerCase().includes('no degree') ||
                (title + ' ' + description).toLowerCase().includes('degree not required')
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
          title: "No suitable jobs found",
          company: "None",
          location: location || "Remote",
          description: "Try a different search term or location",
          url: "https://example.com/job1",
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
