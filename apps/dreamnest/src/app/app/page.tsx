"use client";

import { BookOpen, Play, Star, Clock, Users } from "lucide-react";

// Placeholder book data
const books = [
  {
    id: 1,
    title: "The Little Star",
    cover: "🌟",
    duration: "5 min",
    ageRange: "3-5",
    color: "from-amber-100 to-yellow-200",
  },
  {
    id: 2,
    title: "Forest Friends",
    cover: "🌲",
    duration: "8 min",
    ageRange: "4-7",
    color: "from-green-100 to-emerald-200",
  },
  {
    id: 3,
    title: "Ocean Adventure",
    cover: "🐠",
    duration: "6 min",
    ageRange: "3-6",
    color: "from-blue-100 to-cyan-200",
  },
  {
    id: 4,
    title: "Moon Journey",
    cover: "🌙",
    duration: "7 min",
    ageRange: "5-8",
    color: "from-purple-100 to-indigo-200",
  },
];

export default function LibraryPage() {
  return (
    <div className="min-h-screen">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tonight's Picks Section */}
        <section className="mb-12">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-amber-800 mb-6">
            <BookOpen className="w-7 h-7" />
            Tonight&apos;s Picks
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {books.map((book) => (
              <div
                key={book.id}
                className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer hover:-translate-y-1"
              >
                <div
                  className={`h-40 bg-gradient-to-br ${book.color} flex items-center justify-center`}
                >
                  <span className="text-6xl group-hover:scale-110 transition-transform duration-300">
                    {book.cover}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors">
                    {book.title}
                  </h3>
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {book.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      Ages {book.ageRange}
                    </span>
                  </div>
                  <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl text-sm font-medium hover:from-purple-600 hover:to-pink-600 transition-all shadow-sm hover:shadow-md">
                    <Play className="w-4 h-4" />
                    Read Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Coming Soon Section */}
        <section className="mb-12">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-amber-800 mb-6">
            <Star className="w-7 h-7" />
            Coming Soon
          </h2>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-sm border border-purple-100">
            <div className="text-center">
              <span className="text-5xl mb-4 block">✨</span>
              <p className="text-gray-600 max-w-xl mx-auto">
                More magical stories are on the way! In the MVP, this library
                shows placeholder books. The full version will include browsing,
                reading, and auto-narration features.
              </p>
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
              <div className="text-3xl font-bold">4</div>
              <div className="text-purple-200 text-sm">Books Available</div>
            </div>
            <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl p-6 text-white">
              <div className="text-3xl font-bold">26 min</div>
              <div className="text-pink-200 text-sm">Total Reading Time</div>
            </div>
            <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-6 text-white">
              <div className="text-3xl font-bold">Ages 3-8</div>
              <div className="text-amber-200 text-sm">Age Range</div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
