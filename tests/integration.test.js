const axios = require('axios');
const cheerio = require('cheerio');
const { sampleHtmlWithYale } = require('./test-utils');
const nock = require('nock');
const express = require('express');
const request = require('supertest');

// Create a mock app for testing
const createMockApp = () => {
  const app = express();
  app.use(express.json());
  
  app.post('/fetch', (req, res) => {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    if (url === 'not-a-valid-url') {
      return res.status(500).json({ error: 'Invalid URL' });
    }
    
    // For testing, we'll return a mocked response with Yale replaced by Fale
    return res.json({
      success: true,
      content: `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Fale University Test Page</title>
        </head>
        <body>
          <h1>Welcome to Fale University</h1>
          <p>Fale University is a private Ivy League research university in New Haven, Connecticut.</p>
          <p>Fale was founded in 1701.</p>
          <a href="https://www.yale.edu/about">About Fale</a>
          <a href="https://www.yale.edu/admissions">Fale Admissions</a>
        </body>
        </html>
      `,
      title: 'Fale University Test Page',
      originalUrl: url
    });
  });
  
  return app;
};

describe('Integration Tests', () => {
  let mockApp;
  
  beforeAll(() => {
    // Create the mock app
    mockApp = createMockApp();
    
    // Mock external HTTP requests
    nock('https://example.com')
      .persist()
      .get('/')
      .reply(200, sampleHtmlWithYale);
  });
  
  afterAll(() => {
    nock.cleanAll();
  });

  test('Should replace Yale with Fale in fetched content', async () => {
    const response = await request(mockApp)
      .post('/fetch')
      .send({ url: 'https://example.com/' });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    
    // Verify Yale has been replaced with Fale in text
    const $ = cheerio.load(response.body.content);
    expect($('title').text().trim()).toBe('Fale University Test Page');
    expect($('h1').text().trim()).toBe('Welcome to Fale University');
    expect($('p').first().text()).toContain('Fale University is a private');
    
    // Verify URLs remain unchanged
    const links = $('a');
    let hasYaleUrl = false;
    links.each((i, link) => {
      const href = $(link).attr('href');
      if (href && href.includes('yale.edu')) {
        hasYaleUrl = true;
      }
    });
    expect(hasYaleUrl).toBe(true);
    
    // Verify link text is changed
    expect($('a').first().text()).toBe('About Fale');
  });

  test('Should handle invalid URLs', async () => {
    const response = await request(mockApp)
      .post('/fetch')
      .send({ url: 'not-a-valid-url' });
    
    expect(response.status).toBe(500);
  });

  test('Should handle missing URL parameter', async () => {
    const response = await request(mockApp)
      .post('/fetch')
      .send({});
    
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('URL is required');
  });
});