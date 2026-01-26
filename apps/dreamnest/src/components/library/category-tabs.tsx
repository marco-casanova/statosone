"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

const CATEGORIES = [
  { id: "", label: "All", emoji: "📚" },
  { id: "adventure", label: "Adventure", emoji: "🏰" },
  { id: "animals", label: "Animals", emoji: "🐻" },
  { id: "bedtime", label: "Bedtime", emoji: "🌙" },
  { id: "educational", label: "Educational", emoji: "🎓" },
  { id: "fantasy", label: "Fantasy", emoji: "🧚" },
  { id: "friendship", label: "Friendship", emoji: "🤝" },
  { id: "nature", label: "Nature", emoji: "🌳" },
];

const AGE_GROUPS = [
  { id: "", label: "All Ages" },
  { id: "baby", label: "0-2" },
  { id: "toddler", label: "2-4" },
  { id: "preschool", label: "4-6" },
  { id: "early_reader", label: "6+" },
];

interface CategoryTabsProps {
  activeCategory?: string;
  activeAge?: string;
}

export function CategoryTabs({ activeCategory, activeAge }: CategoryTabsProps) {
  const searchParams = useSearchParams();

  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(name, value);
    } else {
      params.delete(name);
    }
    return params.toString();
  };

  return (
    <div className="space-y-4">
      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {CATEGORIES.map((category) => (
          <Link
            key={category.id}
            href={`/app/library?${createQueryString("category", category.id)}`}
            className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
              activeCategory === category.id ||
              (!activeCategory && category.id === "")
                ? "bg-purple-600 text-white shadow-md"
                : "bg-white text-purple-700 hover:bg-purple-100"
            }`}
          >
            <span>{category.emoji}</span>
            <span className="text-sm font-medium">{category.label}</span>
          </Link>
        ))}
      </div>

      {/* Age Filter */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-purple-600 font-medium">Age:</span>
        <div className="flex gap-2">
          {AGE_GROUPS.map((age) => (
            <Link
              key={age.id}
              href={`/app/library?${createQueryString("age", age.id)}`}
              className={`px-3 py-1 rounded-full text-sm transition-all ${
                activeAge === age.id || (!activeAge && age.id === "")
                  ? "bg-pink-500 text-white"
                  : "bg-pink-100 text-pink-700 hover:bg-pink-200"
              }`}
            >
              {age.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
