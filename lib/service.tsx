import http from "@/lib/http";
import {
  Actor,
  Category,
  Film,
  FilmDataResponse,
  HomeFilms,
  Keyword,
  SearchFilms,
} from "@/types";

export async function getHomeFilms(): Promise<HomeFilms> {
  const res = await http.get<HomeFilms>("/films/home", {
    cache: "no-store",
  });

  if (!res.payload) {
    throw new Error("Failed to fetch home films");
  }

  return res.payload;
}

export async function searchFilms(params: any): Promise<SearchFilms> {
  const res = await http.get<SearchFilms>(
    `/films/search?${params.toString()}`,
    {
      cache: "force-cache",
    }
  );

  if (!res.payload) {
    throw new Error("Failed to search films");
  }

  return res.payload;
}

export async function getFilmBySlug(slug: string): Promise<Film> {
  const res = await http.get<Film>(`/films/slug/${slug}`, {
    cache: "force-cache",
  });

  if (!res.payload) {
    throw new Error("Failed to fetch film by slug");
  }

  return res.payload;
}

export async function getDetailFilm(id: number): Promise<Film> {
  const res = await http.get<Film>(`/films/${id}`, {
    cache: "force-cache",
  });

  if (!res.payload) {
    throw new Error("Failed to fetch detail film");
  }

  return res.payload;
}

export async function getRelatedFilms(categoryId: number): Promise<Film[]> {
  const res = await http.get<Film[]>(
    `/films?categoryId=${categoryId}&limit=12`,
    {
      cache: "force-cache",
    }
  );

  if (!res.payload) {
    throw new Error("Failed to fetch related films");
  }

  return res.payload;
}

export async function incrementView(id: number): Promise<void> {
  await http.post(`/films/${id}/view`);
}

export async function getCategoryById(
  id: number,
  limit: number = 10
): Promise<Category> {
  const res = await http.get<Category>(`/categories/${id}?limit=${limit}`, {
    // cache: "force-cache",
  });

  if (!res.payload) {
    throw new Error("Failed to fetch category by id");
  }

  return res.payload;
}

export async function getFilms(params: any): Promise<FilmDataResponse> {
  const res = await http.get<Film[]>(`/films?${params.toString()}`, {
    cache: "force-cache",
  });

  if (!res.payload) {
    throw new Error("Failed to fetch films");
  }

  return res.payload;
}

export async function getDetailFilmBySlug(slug: string): Promise<Film> {
  const res = await http.get<Film>(`/films/slug/${slug}`, {
    cache: "force-cache",
  });

  if (!res.payload) {
    throw new Error("Failed to fetch detail film by slug");
  }

  return res.payload;
}

export async function getCategories(type: string): Promise<Category[]> {
  let url = "/categories";
  if (type) {
    url += `?type=${type}`;
  }
  const res = await http.get<Category[]>(url, {
    cache: "force-cache",
  });

  if (!res.payload) {
    throw new Error("Failed to fetch categories");
  }

  return res.payload;
}

export async function getActors(limit?: number): Promise<Actor[]> {
  let url = "/actors";
  if (limit) {
    url += `?limit=${limit}`;
  }
  const res = await http.get<Actor[]>(url, {
    cache: "force-cache",
  });

  if (!res.payload) {
    throw new Error("Failed to fetch actors");
  }

  return res.payload;
}

export async function getKeywords(limit?: number): Promise<Keyword[]> {
  let url = "/keywords";
  if (limit) {
    url += `?limit=${limit}`;
  }
  const res = await http.get<Keyword[]>(url, {
    cache: "force-cache",
  });

  if (!res.payload) {
    throw new Error("Failed to fetch keywords");
  }

  return res.payload;
}

// Watch Progress APIs
export interface WatchProgress {
  id: number;
  deviceId: string;
  filmId: number;
  episodeId?: number;
  currentTime: number;
  duration: number;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function saveWatchProgress(
  deviceId: string,
  filmId: number,
  episodeId: number | undefined,
  currentTime: number,
  duration: number,
  completed?: boolean
): Promise<WatchProgress | null> {
  try { 
    const res = await http.post<WatchProgress>("/watch-progress", {
      deviceId,
      filmId,
      episodeId,
      currentTime,
      duration,
      completed,
    });

    if (!res.payload) {
      console.warn("Failed to save watch progress:", res.status, res.mess);
      return null;
    }

    return res.payload;
  } catch (error) {
    console.error("Error saving watch progress:", error);
    return null;
  }
}

export async function getWatchProgress(
  deviceId: string,
  filmId: number,
  episodeId?: number
): Promise<WatchProgress | WatchProgress[] | null> {
  try {
    const url = episodeId
      ? `/watch-progress/device/${deviceId}/film/${filmId}/episode/${episodeId}`
      : `/watch-progress/device/${deviceId}/film/${filmId}`;
    
    const res = await http.get<WatchProgress | WatchProgress[]>(url);

    if (!res.payload || res.status === 404) {
      return null;
    }

    return res.payload;
  } catch (error) {
    console.error("Error getting watch progress:", error);
    return null;
  }
}

export async function getRecentWatching(
  deviceId: string,
  limit: number = 20
): Promise<WatchProgress[]> {
  const res = await http.get<WatchProgress[]>(
    `/watch-progress/device/${deviceId}/recent?limit=${limit}`
  );

  if (!res.payload) {
    return [];
  }

  return res.payload;
}