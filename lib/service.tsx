import http from "@/lib/http";
import { HomeFilms, SearchFilms } from "@/types";

export async function getHomeFilms(): Promise<HomeFilms> {
  const res = await http.get<HomeFilms>("/films/home", {
    cache: "force-cache",
  });

  if (!res.payload) {
    throw new Error("Failed to fetch home films");
  }

  return res.payload;
}


export async function searchFilms(params: any): Promise<SearchFilms> {
  const res = await http.get<SearchFilms>(`/films/search?${params.toString()}`, {
    cache: "force-cache",
  });
  
  if (!res.payload) {
    throw new Error("Failed to search films");
  }

  return res.payload;
}
