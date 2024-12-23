import puppeteer from 'puppeteer';

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

export async function scrapeJobs(query, location, keywords) {
  try {
    console.log('Starting browser...');
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: 'new'
    });

    const page = await browser.newPage();
    
    // Set a realistic user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');
    
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query + ' ' + location + ' jobs')}&ibp=htl;jobs`;
    console.log('Navigating to:', searchUrl);
    
    await page.goto(searchUrl, { waitUntil: 'networkidle0' });
    
    // Wait for job listings to load
    await page.waitForSelector('div[role="main"]', { timeout: 5000 });

    const jobs = await page.evaluate((keywords) => {
      const results = [];
      const jobCards = document.querySelectorAll('div.iFjolb, div[jscontroller][data-ved]');

      jobCards.forEach(card => {
        const title = card.querySelector('h2, h3, [role="heading"]')?.textContent?.trim() || '';
        const company = card.querySelector('.vNEEBe, .company-name')?.textContent?.trim() || '';
        const jobLocation = card.querySelector('.Qk80Jf, .location')?.textContent?.trim() || '';
        const description = card.querySelector('.HBvzbc, .job-snippet')?.textContent?.trim() || '';
        const url = card.querySelector('a')?.href || '';

        if (title && (company || description)) {
          const shouldAdd = keywords.length === 0 || keywords.some(keyword => 
            description.toLowerCase().includes(keyword.toLowerCase()) ||
            title.toLowerCase().includes(keyword.toLowerCase())
          );

          if (shouldAdd) {
            results.push({
              title,
              company: company || 'Company not specified',
              location: jobLocation || 'Location not specified',
              description: description || 'No description available',
              url,
              keywords: keywords.filter(keyword => 
                description.toLowerCase().includes(keyword.toLowerCase()) ||
                title.toLowerCase().includes(keyword.toLowerCase())
              )
            });
          }
        }
      });

      return results;
    }, keywords);

    await browser.close();

    const processedJobs = jobs.map(job => ({
      ...job,
      id: generateId(),
      datePosted: new Date().toISOString()
    }));

    console.log(`Found ${processedJobs.length} jobs`);
    return processedJobs;

  } catch (error) {
    console.error('Error scraping jobs:', error);
    throw error;
  }
}