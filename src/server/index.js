import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { scrapeJobs } from './scraper.js';
import { setupCache } from './cache.js';

const app = express();
const port = process.env.PORT || 3001; // Changed default port to 3001

// Setup middleware
app.use(cors());
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

// Routes
app.post('/api/jobs', async (req, res) => {
  try {
    const { query, location, keywords } = req.body;
    const cacheKey = `${query}-${location}-${keywords.join(',')}`;
    
    const cachedResults = cache.get(cacheKey);
    if (cachedResults) {
      return res.json(cachedResults);
    }
    
    const jobs = await scrapeJobs(query, location, keywords);
    cache.set(cacheKey, jobs);
    
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

app.set('trust proxy', 1);

// Error handling for server start
const server = app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Please try a different port.`);
    process.exit(1);
  } else {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
});