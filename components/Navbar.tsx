"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Film, Search, Home, Tv, Clapperboard } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14 md:h-16">
          <Link href="/" className="flex items-center gap-2 text-lg md:text-xl font-bold">
            <Film className="w-5 h-5 md:w-6 md:h-6 text-primary-500" />
            <span>WebFilm</span>
          </Link>

          <div className="flex items-center gap-2 md:gap-4 lg:gap-6">
            <Link
              href="/"
              className={`flex items-center gap-1.5 md:gap-2 text-sm md:text-base ${
                pathname === "/"
                  ? "text-primary-500"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              <Home className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden sm:inline">Trang chủ</span>
            </Link>
            <Link
              href="/movies"
              className={`flex items-center gap-1.5 md:gap-2 text-sm md:text-base ${
                pathname === "/movies"
                  ? "text-primary-500"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              <Clapperboard className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden sm:inline">Phim Lẻ</span>
            </Link>
            <Link
              href="/tv-series"
              className={`flex items-center gap-1.5 md:gap-2 text-sm md:text-base ${
                pathname === "/tv-series"
                  ? "text-primary-500"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              <Tv className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden sm:inline">Phim Bộ</span>
            </Link>
            <Link
              href="/search"
              className={`flex items-center gap-1.5 md:gap-2 text-sm md:text-base ${
                pathname === "/search"
                  ? "text-primary-500"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              <Search className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden sm:inline">Tìm kiếm</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
