import FirecrawlApp from '@mendable/firecrawl-js';

interface ErrorResponse {
  success: false;
  error: string;
}

interface ScrapeResponse {
  success: true;
  data: {
    metadata?: {
      title?: string;
      description?: string;
      ogImage?: string;
      ogTitle?: string;
      ogDescription?: string;
    };
    markdown?: string;
    html?: string;
  };
}

type FirecrawlResponse = ScrapeResponse | ErrorResponse;

export class FirecrawlService {
  private static API_KEY_STORAGE_KEY = 'firecrawl_api_key';
  private static firecrawlApp: FirecrawlApp | null = null;

  static saveApiKey(apiKey: string): void {
    localStorage.setItem(this.API_KEY_STORAGE_KEY, apiKey);
    this.firecrawlApp = new FirecrawlApp({ apiKey });
    console.log('API key saved successfully');
  }

  static getApiKey(): string | null {
    return localStorage.getItem(this.API_KEY_STORAGE_KEY);
  }

  static async testApiKey(apiKey: string): Promise<boolean> {
    try {
      console.log('Testing API key with Firecrawl API');
      this.firecrawlApp = new FirecrawlApp({ apiKey });
      // A simple test scrape to verify the API key
      const testResponse = await this.firecrawlApp.scrapeUrl('https://example.com');
      return testResponse.success;
    } catch (error) {
      console.error('Error testing API key:', error);
      return false;
    }
  }

  static async scrapeVideoThumbnail(url: string): Promise<{ success: boolean; error?: string; thumbnail?: string; title?: string }> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      // Try to extract Wistia thumbnail without API key using the media ID
      return this.extractWistiaThumbnailDirect(url);
    }

    try {
      console.log('Scraping video page for thumbnail:', url);
      if (!this.firecrawlApp) {
        this.firecrawlApp = new FirecrawlApp({ apiKey });
      }

      const scrapeResponse = await this.firecrawlApp.scrapeUrl(url, {
        formats: ['extract']
      }) as FirecrawlResponse;

      if (!scrapeResponse.success) {
        console.error('Scrape failed:', (scrapeResponse as ErrorResponse).error);
        // Fallback to direct Wistia extraction
        return this.extractWistiaThumbnailDirect(url);
      }

      const data = (scrapeResponse as ScrapeResponse).data;
      const thumbnail = data.metadata?.ogImage;
      const title = data.metadata?.ogTitle || data.metadata?.title;

      if (thumbnail) {
        return { 
          success: true,
          thumbnail,
          title
        };
      } else {
        // Fallback to direct Wistia extraction
        return this.extractWistiaThumbnailDirect(url);
      }
    } catch (error) {
      console.error('Error during scrape:', error);
      // Fallback to direct Wistia extraction
      return this.extractWistiaThumbnailDirect(url);
    }
  }

  private static extractWistiaThumbnailDirect(url: string): { success: boolean; thumbnail?: string; title?: string } {
    try {
      // Extract media ID from Wistia URL
      // Format: https://scratchgc.wistia.com/medias/[mediaId]
      const mediaIdMatch = url.match(/medias\/([a-zA-Z0-9]+)/);
      if (mediaIdMatch) {
        const mediaId = mediaIdMatch[1];
        // Wistia thumbnail URL pattern
        const thumbnail = `https://embed-ssl.wistia.com/deliveries/${mediaId}/thumbnail.jpg`;
        return {
          success: true,
          thumbnail
        };
      }
      return { success: false };
    } catch (error) {
      console.error('Error extracting Wistia thumbnail:', error);
      return { success: false };
    }
  }

  static async scrapeWebsite(url: string): Promise<{ success: boolean; error?: string; data?: any }> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      return { success: false, error: 'API key not found' };
    }

    try {
      console.log('Making scrape request to Firecrawl API');
      if (!this.firecrawlApp) {
        this.firecrawlApp = new FirecrawlApp({ apiKey });
      }

      const scrapeResponse = await this.firecrawlApp.scrapeUrl(url, {
        formats: ['markdown', 'html'],
      }) as FirecrawlResponse;

      if (!scrapeResponse.success) {
        console.error('Scrape failed:', (scrapeResponse as ErrorResponse).error);
        return { 
          success: false, 
          error: (scrapeResponse as ErrorResponse).error || 'Failed to scrape website' 
        };
      }

      console.log('Scrape successful:', scrapeResponse);
      return { 
        success: true,
        data: (scrapeResponse as ScrapeResponse).data 
      };
    } catch (error) {
      console.error('Error during scrape:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to connect to Firecrawl API' 
      };
    }
  }
}