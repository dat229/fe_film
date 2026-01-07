// Convert YouTube URL to embed format with start time
export function toYoutubeEmbed(url: string, startTime?: number): string {
  if (!url) return url;
  
  let embedUrl = '';
  
  if (url.includes('youtube.com/embed')) {
    embedUrl = url;
  } else {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        embedUrl = `https://www.youtube.com/embed/${match[1]}`;
        break;
      }
    }
    
    if (!embedUrl) {
      return url;
    }
  }
  
  if (startTime && startTime > 0) {
    embedUrl = embedUrl.replace(/[?&]start=\d+/g, '');
    embedUrl = embedUrl.replace(/[?&]autoplay=\d+/g, '');
    
    const separator = embedUrl.includes('?') ? '&' : '?';
    const startSeconds = Math.floor(startTime);
    embedUrl = `${embedUrl}${separator}start=${startSeconds}&autoplay=1`;
  }
  
  return embedUrl;
}

export function getDeviceId(): string {
  if (typeof window === 'undefined') {
    return 'unknown';
  }

  let deviceId = localStorage.getItem('deviceId');
  
  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('deviceId', deviceId);
  }

  return deviceId;
}
