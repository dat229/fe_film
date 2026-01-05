export interface Film {
  id: number;
  title: string;
  slug: string;
  nameNormalized?: string;
  description?: string;
  poster?: string;
  thumbnail?: string;
  year?: number;
  duration?: number;
  rating?: number;
  viewCount: number;
  status: string;
  type?: string; // "movie" hoặc "tv"
  linkM3u8?: string;
  linkWebview?: string;
  createdAt: string;
  updatedAt: string;
  categories?: FilmCategory[];
  actors?: FilmActor[];
  keywords?: FilmKeyword[];
  episodes?: Episode[];
}

export interface FilmCategory {
  id: number;
  filmId: number;
  categoryId: number;
  category: Category;
}

export interface FilmActor {
  id: number;
  filmId: number;
  actorId: number;
  actor: Actor;
}

export interface FilmKeyword {
  id: number;
  filmId: number;
  keywordId: number;
  keyword: Keyword;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  type: string;
}

export interface Actor {
  id: number;
  name: string;
  slug: string;
  avatar?: string;
  bio?: string;
}

export interface Keyword {
  id: number;
  name: string;
  slug: string;
}

export interface Episode {
  id: number;
  filmId: number;
  episodeNumber: number;
  title?: string;
  description?: string; 
  linkM3u8?: string;
  linkEmbed?: string;
  linkWebview?: string;
  duration?: number;
  viewCount: number;
  thumbnail?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface HomeFilms {
  featured: Film[];
  popular: Film[];
  latest: Film[];
  topRated: Film[];
}

export interface SearchFilms {
  data: Film[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}