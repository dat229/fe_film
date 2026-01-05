"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Film, Search, Home } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold">
            <Film className="w-6 h-6 text-primary-500" />
            <span>WebFilm</span>
          </Link>

          <div className="flex items-center gap-6">
            <Link
              href="/"
              className={`flex items-center gap-2 ${
                pathname === "/"
                  ? "text-primary-500"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              <Home className="w-5 h-5" />
              <span>Trang chủ</span>
            </Link>
            <Link
              href="/search"
              className={`flex items-center gap-2 ${
                pathname === "/search"
                  ? "text-primary-500"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              <Search className="w-5 h-5" />
              <span>Tìm kiếm</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
