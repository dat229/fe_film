"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, X } from "lucide-react";

interface SearchableSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ id: number | string; name: string }>;
  placeholder?: string;
  searchPlaceholder?: string;
}

export default function SearchableSelect({
  label,
  value,
  onChange,
  options,
  placeholder = "Tất cả",
  searchPlaceholder = "Tìm kiếm...",
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((option) =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find((opt) => String(opt.id) === value);

  const handleSelect = (optionId: string) => {
    onChange(optionId);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setSearchTerm("");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm mb-2">{label}</label>
      <div
        className="relative cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="w-full px-4 py-2 bg-gray-700 rounded border border-gray-600 focus-within:border-primary-500 flex items-center justify-between">
          <span className={value ? "text-white" : "text-gray-400"}>
            {selectedOption ? selectedOption.name : placeholder}
          </span>
          <div className="flex items-center gap-2">
            {value && (
              <button
                onClick={handleClear}
                className="text-gray-400 hover:text-white"
                type="button"
                aria-label="Xóa lựa chọn"
                title="Xóa lựa chọn"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-64 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-gray-700">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              placeholder={searchPlaceholder}
              className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:border-primary-500 text-sm"
              autoFocus
            />
          </div>

          <div className="overflow-y-auto max-h-48">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleSelect(String(option.id))}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors ${
                    String(option.id) === value
                      ? "bg-primary-600 text-white"
                      : "text-gray-300"
                  }`}
                >
                  {option.name}
                </button>
              ))
            ) : (
              <div className="px-4 py-2 text-gray-400 text-sm text-center">
                Không tìm thấy
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

