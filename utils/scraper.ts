import * as cheerio from 'cheerio';

export type LinkMetadata = {
  url: string;
  title: string | null;
  description: string | null;
  image: string | null;
}

export async function scrapeUrl(url: string): Promise<LinkMetadata | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'bot-google-second-brain' // Some sites block generic fetchers
      }
    });
    
    const html = await response.text();
    const $ = cheerio.load(html);

    // Get Open Graph data (Standard for social previews)
    const title = $('meta[property="og:title"]').attr('content') || $('title').text() || '';
    const description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || '';
    const image = $('meta[property="og:image"]').attr('content') || '';

    return {
      url,
      title: title.substring(0, 100), // Limit length
      description: description.substring(0, 200),
      image
    };
  } catch (error) {
    console.error("Failed to scrape link:", error);
    return { url, title: null, description: null, image: null }; // Fallback
  }
}