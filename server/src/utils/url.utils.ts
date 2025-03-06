// Function to ensure a URL is absolute
export const ensureAbsoluteUrl = (url: string, baseUrl?: string): string => {
    try {
      // Check if it's already a valid URL
      new URL(url);
      return url;
    } catch (error) {
      // If it's not a valid URL, it might be a relative path
      if (url.startsWith('/')) {
        // If baseUrl is provided, use it
        if (baseUrl) {
          try {
            return new URL(url, baseUrl).toString();
          } catch (e) {
            // If baseUrl is invalid, fallback to current origin
            const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
            return new URL(url, origin).toString();
          }
        } else {
          // Fallback to localhost if no baseUrl provided
          return new URL(url, 'http://localhost:3000').toString();
        }
      } else {
        // If it doesn't start with '/', prepend '/' and try again
        return ensureAbsoluteUrl('/' + url, baseUrl);
      }
    }
  };