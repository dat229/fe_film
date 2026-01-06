export const normalizePath = (path: string) => {
  return path.startsWith('/') ? path.slice(1) : path
}

export function toYoutubeEmbed(url: string) {
  const reg =
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(reg);

  if (!match) return url;

  return `https://www.youtube.com/embed/${match[1]}?autoplay=1`;
}
