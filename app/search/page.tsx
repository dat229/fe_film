"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Film, SearchFilms } from "@/types";
import FilmCard from "@/components/FilmCard";
import { Search, Filter } from "lucide-react";
import { searchFilms } from "@/lib/service";
import useDebounce from "@/components/hooks/useDebounce";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [films, setFilms] = useState<Film[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const debouncedSearchTerm = useDebounce(searchQuery, 300);
  const [filters, setFilters] = useState({
    year: "",
    countryId: "",
    genreId: "",
    actorId: "",
    keywordId: "",
  });
  const [countries, setCountries] = useState<any[]>([]);
  const [genres, setGenres] = useState<any[]>([]);
  const [actors, setActors] = useState<any[]>([]);
  const [keywords, setKeywords] = useState<any[]>([]);
  
  useEffect(() => {
    fetchCountries();
    fetchGenres();
    fetchActors();
    fetchKeywords();
  }, []);

  useEffect(() => { 
    if (debouncedSearchTerm || Object.values(filters).some((v) => v)) {
      performSearch();
    }
  }, [debouncedSearchTerm, filters]);

  const fetchCountries = async () => {
    try {
      const response = await fetch("http://localhost:3001/categories?type=country");
      const data = await response.json();
      setCountries(data);
    } catch (error) {
      console.error("Error fetching countries:", error);
    }
  };

  const fetchGenres = async () => {
    try {
      const response = await fetch("http://localhost:3001/categories?type=genre");
      const data = await response.json();
      setGenres(data);
    } catch (error) {
      console.error("Error fetching genres:", error);
    }
  };

  const fetchActors = async () => {
    try {
      const response = await fetch("http://localhost:3001/actors");
      const data = await response.json();
      setActors(data);
    } catch (error) {
      console.error("Error fetching actors:", error);
    }
  };

  const fetchKeywords = async () => {
    try {
      const response = await fetch("http://localhost:3001/keywords");
      const data = await response.json();
      setKeywords(data);
    } catch (error) {
      console.error("Error fetching keywords:", error);
    }
  };

  const performSearch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearchTerm) params.append("q", debouncedSearchTerm);
      if (filters.year) params.append("year", filters.year);
      if (filters.countryId) params.append("countryId", filters.countryId);
      if (filters.genreId) params.append("genreId", filters.genreId);
      if (filters.actorId) params.append("actorId", filters.actorId);
      if (filters.keywordId) params.append("keywordId", filters.keywordId);
      console.log(params);
      const data: SearchFilms = await searchFilms(params);
      setFilms(data.data || []);
    } catch (error) {
      console.error("Error searching films:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Tìm Kiếm Phim</h1>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm phim..."
            className="w-full pl-10 pr-4 py-3 bg-gray-800 rounded-lg border border-gray-700 focus:outline-none focus:border-primary-500"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 p-4 bg-gray-800 rounded-lg">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-primary-500" />
          <h2 className="font-semibold">Bộ Lọc</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm mb-2">Năm</label>
            <input
              type="number"
              value={filters.year}
              onChange={(e) => setFilters({ ...filters, year: e.target.value })}
              placeholder="Năm phát hành"
              className="w-full px-4 py-2 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm mb-2">Quốc gia</label>
            <select
              title="Quốc gia"
              value={filters.countryId}
              onChange={(e) =>
                setFilters({ ...filters, countryId: e.target.value })
              }
              className="w-full px-4 py-2 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:border-primary-500"
            >
              <option value="">Tất cả</option>
              {countries.map((country) => (
                <option key={country.id} value={country.id}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-2">Thể loại</label>
            <select
              title="Thể loại"
              value={filters.genreId}
              onChange={(e) =>
                setFilters({ ...filters, genreId: e.target.value })
              }
              className="w-full px-4 py-2 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:border-primary-500"
            >
              <option value="">Tất cả</option>
              {genres.map((genre) => (
                <option key={genre.id} value={genre.id}>
                  {genre.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-2">Diễn viên</label>
            <select
              title="Diễn viên"
              value={filters.actorId}
              onChange={(e) =>
                setFilters({ ...filters, actorId: e.target.value })
              }
              className="w-full px-4 py-2 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:border-primary-500"
            >
              <option value="">Tất cả</option>
              {actors.map((actor) => (
                <option key={actor.id} value={actor.id}>
                  {actor.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-2">Từ khóa</label>
            <select
              title="Từ khóa"
              value={filters.keywordId}
              onChange={(e) =>
                setFilters({ ...filters, keywordId: e.target.value })
              }
              className="w-full px-4 py-2 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:border-primary-500"
            >
              <option value="">Tất cả</option>
              {keywords.map((keyword) => (
                <option key={keyword.id} value={keyword.id}>
                  {keyword.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : films.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {films.map((film) => (
            <FilmCard key={film.id} film={film} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400">
          Không tìm thấy kết quả nào
        </div>
      )}
    </div>
  );
}
