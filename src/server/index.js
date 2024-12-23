import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { scrapeJobs } from './scraper.js';
import { setupCache } from './cache.js';

const app = express();
const port = process.env.PORT || 10000;

// Setup middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://brown1ie.github.io'
  ],
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: true
});
app.use(limiter);

// Setup cache
const cache = setupCache();

// Add a health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.post('/api/jobs', async (req, res) => {
  try {
    console.log('Received search request:', req.body);
    
    const { query, location, keywords } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const cacheKey = `${query}-${location}-${keywords.join(',')}`;
    console.log('Cache key:', cacheKey);
    
    const cachedResults = cache.get(cacheKey);
    if (cachedResults) {
      console.log('Returning cached results');
      return res.json(cachedResults);
    }
    
    console.log('Scraping jobs...');
    const jobs = await scrapeJobs(query, location, keywords);
    console.log(`Found ${jobs.length} jobs`);
    
    cache.set(cacheKey, jobs);
    
    res.json(jobs);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch jobs',
      details: error.message 
    });
  }
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    details: err.message
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});