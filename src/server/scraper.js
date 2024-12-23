import axios from 'axios';
import * as cheerio from 'cheerio';

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

export async function scrapeJobs(query, location, keywords) {
  const searchUrl = `https://www.google.com/search?q=site:linkedin.com+${encodeURIComponent(query)}+${encodeURIComponent(location)}+jobs`;
  
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

    $('.g').each((i, element) => {
      try {
        const el = $(element);
        const title = el.find('h3').text().trim();
        const url = el.find('a').attr('href');
        const snippet = el.find('.VwiC3b').text().trim();
        
        if (title && url && (title.toLowerCase().includes('job') || 
            title.toLowerCase().includes('hiring') || 
            title.toLowerCase().includes('career'))) {
          
          const companyMatch = title.match(/at\s+([^|-]+)/) || title.match(/- ([^-]+) -/);
          const company = companyMatch ? companyMatch[1].trim() : 'Company not specified';
          
          const locationMatch = snippet.match(/in\s+([^.]+)/);
          const jobLocation = locationMatch ? locationMatch[1].trim() : location;

          const shouldAdd = keywords.length === 0 || keywords.some(keyword => 
            snippet.toLowerCase().includes(keyword.toLowerCase()) ||
            title.toLowerCase().includes(keyword.toLowerCase())
          );

          if (shouldAdd) {
            jobs.push({
              id: generateId(),
              title,
              company,
              location: jobLocation,
              description: snippet,
              url,
              keywords: keywords.filter(keyword => 
                snippet.toLowerCase().includes(keyword.toLowerCase()) ||
                title.toLowerCase().includes(keyword.toLowerCase())
              ),
              datePosted: new Date().toISOString()
            });
          }
        }
      } catch (err) {
        console.error('Error processing search result:', err);
      }
    });

    console.log(`Found ${jobs.length} jobs`);
    
    if (jobs.length === 0) {
      console.log('No jobs found, falling back to mock data');
      return [
        {
          id: generateId(),
          title: `${query} Developer`,
          company: "Tech Corp",
          location: location || "Remote",
          description: `We are looking for a ${query} developer to join our team in ${location}.`,
          url: "https://example.com/job1",
          keywords: keywords,
          datePosted: new Date().toISOString()
        },
        {
          id: generateId(),
          title: `Senior ${query} Engineer`,
          company: "Web Solutions",
          location: location || "Remote",
          description: `Senior ${query} position available in ${location}.`,
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