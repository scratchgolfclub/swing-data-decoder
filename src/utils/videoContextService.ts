// Video context service - only for utility functions, no hardcoded video data
// All video recommendations come from vector search in insights table

// Find a specific video by URL - only for utility functions
export const findVideoByUrl = (url: string): { title: string; description: string; url: string } | undefined => {
  // This is now just a utility function - no hardcoded video data
  return {
    title: 'Training Video',
    description: 'Recommended training content',
    url: url
  };
};

// Get videos by their URLs and return formatted data
export const getVideosByUrls = (urls: string[]): { title: string; description: string; url: string }[] => {
  return urls.map(url => ({
    title: 'Training Video',
    description: 'Recommended training content',
    url: url
  })).filter(video => video.url);
};