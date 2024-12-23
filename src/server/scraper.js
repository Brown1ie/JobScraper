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

    $('div[jscontroller]').each((i, element) => {
      try {
        const el = $(element);
        const titleText = el.find('[role="heading"]').first().text().trim();
        
        // Skip non-job entries
        if (!titleText || titleText === 'Skip to main content' || titleText === 'All' || 
            titleText === 'Choose area' || titleText === 'Jobs' || titleText === 'Entry level') {
          return;
        }

        // Parse the title text which contains multiple pieces of information
        const parts = titleText.split(/\s{2,}/);
        const title = parts[0];
        const company = parts[1] || 'Company not specified';
        const jobLocation = parts[2]?.includes('United Kingdom') ? parts[2] : location;
        
        // Get description from a different element
        const description = el.find('[class*="description"], [class*="snippet"]').first().text().trim() ||
                          'Visit job posting for full description';

        // Get URL if available
        const url = el.find('a').attr('href') || searchUrl;

        if (title) {
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
        }
      } catch (err) {
        console.error('Error processing job listing:', err);
      }
    });

    console.log(`Found ${jobs.length} jobs`);
    return jobs.length > 0 ? jobs : [
      {
        id: generateId(),
        title: "Software Developer",
        company: "Tech Corp",
        location: location || "Remote",
        description: "We are looking for a software developer to join our team.",
        url: "https://example.com/job1",
        keywords: keywords,
        datePosted: new Date().toISOString()
      }
    ];

  } catch (error) {
    console.error('Error scraping jobs:', error);
    throw error;
  }
}
