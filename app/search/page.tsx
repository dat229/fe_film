"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Film, SearchFilms } from "@/types";
import FilmCard from "@/components/FilmCard";
import FilmCardSkeleton from "@/components/FilmCardSkeleton";
import SearchableSelect from "@/components/SearchableSelect";
import { Search, Filter } from "lucide-react";
import { getActors, getCategories, getKeywords, searchFilms } from "@/lib/service";
import useDebounce from "@/components/hooks/useDebounce";

export const dynamic = 'force-dynamic';

function SearchContent() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const debouncedSearchTerm = useDebounce(searchQuery, 300);
  const [filters, setFilters] = useState({
    year: "",
    countryId: "",
    genreId: "",
    actorId: "",
    keywordId: "",
  });
  const debouncedYear = useDebounce(filters.year, 500);
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

  const searchParamsMemo = useMemo(() => {
    const params = new URLSearchParams();
    if (debouncedSearchTerm) params.append("q", debouncedSearchTerm);
    if (debouncedYear) params.append("year", debouncedYear);
    if (filters.countryId) params.append("countryId", filters.countryId);
    if (filters.genreId) params.append("genreId", filters.genreId);
    if (filters.actorId) params.append("actorId", filters.actorId);
    if (filters.keywordId) params.append("keywordId", filters.keywordId);
    return params;
  }, [debouncedSearchTerm, debouncedYear, filters.countryId, filters.genreId, filters.actorId, filters.keywordId]);

  const {
    data,
    isLoading,
    isFetching,
    error,
  } = useQuery<SearchFilms>({
    queryKey: ["search", searchParamsMemo.toString()],
    queryFn: () => searchFilms(searchParamsMemo),
    enabled: debouncedSearchTerm !== undefined || Object.values(filters).some((v) => v),
    placeholderData: (previousData) => previousData,
    staleTime: 30000,
  });

  const films = data?.data || [];
  const loading = isLoading || isFetching;

  const fetchCountries = async () => {
    try {
      const data = await getCategories("country");
      setCountries(data);
    } catch (error) {
      console.error("Error fetching countries:", error);
    }
  };

  const fetchGenres = async () => {
    try {
      const data = await getCategories("genre");
      setGenres(data);
    } catch (error) {
      console.error("Error fetching genres:", error);
    }
  };

  const fetchActors = async () => {
    try {
      const data = await getActors();
      setActors(data);
    } catch (error) {
      console.error("Error fetching actors:", error);
    }
  };

  const fetchKeywords = async () => {
    try {
      const data = await getKeywords();
      setKeywords(data);
    } catch (error) {
      console.error("Error fetching keywords:", error);
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
            className="w-full pl-10 pr-4 py-3 bg-gray-800 rounded-lg border border-gray-700 focus:outline-none focus:border-primary-500 text-base"
            style={{ fontSize: '16px' }}
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
              className="w-full px-4 py-2 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:border-primary-500 text-base"
              style={{ fontSize: '16px' }}
            />
          </div>
          <SearchableSelect
            label="Quốc gia"
            value={filters.countryId}
            onChange={(value) => setFilters({ ...filters, countryId: value })}
            options={countries}
            placeholder="Tất cả quốc gia"
            searchPlaceholder="Tìm quốc gia..."
          />
          <SearchableSelect
            label="Thể loại"
            value={filters.genreId}
            onChange={(value) => setFilters({ ...filters, genreId: value })}
            options={genres}
            placeholder="Tất cả thể loại"
            searchPlaceholder="Tìm thể loại..."
          />
          <SearchableSelect
            label="Diễn viên"
            value={filters.actorId}
            onChange={(value) => setFilters({ ...filters, actorId: value })}
            options={actors}
            placeholder="Tất cả diễn viên"
            searchPlaceholder="Tìm diễn viên..."
          />
          <SearchableSelect
            label="Từ khóa"
            value={filters.keywordId}
            onChange={(value) => setFilters({ ...filters, keywordId: value })}
            options={keywords}
            placeholder="Tất cả từ khóa"
            searchPlaceholder="Tìm từ khóa..."
          />
        </div>
      </div>

      {loading && !films.length ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <FilmCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-400">
          Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại.
        </div>
      ) : films.length > 0 ? (
        <div className="relative">
          {isFetching && films.length > 0 && (
            <div className="absolute top-0 right-0 bg-primary-500 text-white px-3 py-1 rounded-bl-lg text-sm z-10">
              Đang tải...
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {films.map((film: Film) => (
              <FilmCard key={film.id} film={film} />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400">
          Không tìm thấy kết quả nào
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Tìm Kiếm Phim</h1>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <FilmCardSkeleton key={i} />
            ))}
          </div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
