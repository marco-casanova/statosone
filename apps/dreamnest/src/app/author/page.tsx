"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Plus,
  BookOpen,
  Clock,
  Eye,
  Edit2,
  Trash2,
  MoreHorizontal,
  Search,
  FileText,
  Send,
  CheckCircle,
  XCircle,
  Loader2,
  AlertTriangle,
  Copy,
  Upload as PublishIcon,
} from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { getAssetPublicUrl } from "@/lib/storage";
import {
  getDefaultCoverTemplate,
  COVER_TEMPLATES,
  type CoverTemplateId,
} from "@/domain";
import {
  PAGE_LAYOUTS,
  PAGE_LAYOUT_IDS,
  getDefaultPageCount,
  type PageLayoutId,
} from "@/domain/page-layouts";

interface AuthorBook {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  status: "draft" | "in_review" | "published" | "archived";
  page_count: number;
  cover_url: string | null;
  created_at: string;
  updated_at: string;
  submitted_at: string | null;
  published_at: string | null;
  rejection_reason: string | null;
}

type StatusFilter = "all" | "draft" | "in_review" | "published" | "archived";

const statusConfig = {
  draft: {
    label: "Draft",
    icon: FileText,
    className: "bg-gray-100 text-gray-700",
  },
  in_review: {
    label: "In Review",
    icon: Clock,
    className: "bg-yellow-100 text-yellow-700",
  },
  published: {
    label: "Published",
    icon: CheckCircle,
    className: "bg-green-100 text-green-700",
  },
  archived: {
    label: "Archived",
    icon: XCircle,
    className: "bg-red-100 text-red-700",
  },
};

export default function AuthorDashboardPage() {
  const router = useRouter();
  const [books, setBooks] = useState<AuthorBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [showNewBookDialog, setShowNewBookDialog] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newBookData, setNewBookData] = useState({
    title: "",
    subtitle: "",
    description: "",
    ageMin: 2,
    ageMax: 8,
    pageLayout: "VIDEO_BACKGROUND_TEXT_BOTTOM" as PageLayoutId,
    coverTemplate: getDefaultCoverTemplate(2) as CoverTemplateId,
  });
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [confirmDeleteBook, setConfirmDeleteBook] = useState<AuthorBook | null>(
    null,
  );
  const [duplicating, setDuplicating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [authorId, setAuthorId] = useState<string | null>(null);

  // Create Supabase client
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // Get author profile
      const { data: author } = await supabase
        .from("authors")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!author) {
        // User is not an author, redirect or show message
        return;
      }
      setAuthorId(author.id);

      // Fetch author's books
      const { data: booksData, error } = await supabase
        .from("books")
        .select(
          `
          id,
          title,
          subtitle,
          description,
          status,
          page_count,
          created_at,
          updated_at,
          submitted_at,
          published_at,
          rejection_reason,
          cover:assets!cover_asset_id(file_path)
        `,
        )
        .eq("author_id", author.id)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      const formattedBooks: AuthorBook[] = (booksData || []).map(
        (book: any) => ({
          ...book,
          cover_url: book.cover?.file_path
            ? getAssetPublicUrl(book.cover.file_path)
            : null,
        }),
      );

      setBooks(formattedBooks);
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      searchQuery === "" ||
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || book.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Check if author exists, if not create one
      let { data: author } = await supabase
        .from("authors")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!author) {
        // Auto-create author profile for this user
        const { data: newAuthor, error: authorError } = await supabase
          .from("authors")
          .insert({
            user_id: user.id,
            is_verified: false,
          })
          .select("id")
          .single();

        if (authorError) {
          console.error("Error creating author profile:", authorError);
          throw new Error("Failed to create author profile");
        }
        author = newAuthor;
      }

      // Get page count based on selected layout
      const pageCount = getDefaultPageCount(newBookData.pageLayout);
      const layoutTemplate = PAGE_LAYOUTS[newBookData.pageLayout];

      // Create the book
      const { data: newBook, error: bookError } = await supabase
        .from("books")
        .insert({
          author_id: author.id,
          title: newBookData.title,
          subtitle: newBookData.subtitle || null,
          description: newBookData.description || null,
          age_min: newBookData.ageMin,
          age_max: newBookData.ageMax,
          status: "draft",
          page_count: pageCount,
          design_width: 1920,
          design_height: 1080,
          language: "en",
        })
        .select()
        .single();

      if (bookError) throw bookError;

      // Create all pages with the selected layout
      const pagesToCreate = Array.from({ length: pageCount }, (_, index) => ({
        book_id: newBook.id,
        page_index: index,
        layout_mode: "canvas" as const,
        background_color: "#ffffff",
      }));

      const { error: pageError } = await supabase
        .from("book_pages")
        .insert(pagesToCreate);

      if (pageError) throw pageError;

      // Navigate to the editor
      router.push(`/author/books/${newBook.id}/edit`);
    } catch (error) {
      console.error("Error creating book:", error);
      alert("Failed to create book. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteBook = async (bookId: string) => {
    if (deletingId) return;
    setDeletingId(bookId);
    try {
      let currentAuthorId = authorId;
      if (!currentAuthorId) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");
        const { data: author } = await supabase
          .from("authors")
          .select("id")
          .eq("user_id", user.id)
          .single();
        if (!author) throw new Error("Author profile not found");
        currentAuthorId = author.id;
        setAuthorId(author.id);
      }

      // Delete the book (cascades handle related rows)
      const { error } = await supabase
        .from("books")
        .delete()
        .eq("id", bookId)
        .eq("author_id", currentAuthorId);
      if (error) throw error;

      setBooks((prev) => prev.filter((b) => b.id !== bookId));
      setMenuOpen(null);
    } catch (error) {
      console.error("Error deleting book:", error);
      alert("Failed to delete book. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const handlePublishBook = async (bookId: string) => {
    if (publishing) return;
    setPublishing(true);
    try {
      const { error } = await supabase
        .from("books")
        .update({
          status: "published",
          published_at: new Date().toISOString(),
        })
        .eq("id", bookId);

      if (error) throw error;

      setBooks((prev) =>
        prev.map((b) =>
          b.id === bookId
            ? { ...b, status: "published", published_at: new Date().toISOString() }
            : b,
        ),
      );
      setMenuOpen(null);
    } catch (error) {
      console.error("Error publishing book:", error);
      alert("Failed to publish book. Please try again.");
    } finally {
      setPublishing(false);
    }
  };

  const handleDuplicateBook = async (book: AuthorBook) => {
    if (duplicating) return;
    setDuplicating(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No user session found");

      const { data: author } = await supabase
        .from("authors")
        .select("id")
        .eq("user_id", user.id)
        .single();
      if (!author) throw new Error("Author profile missing");

      // Create the duplicate book with a suffixed title
      const { data: newBook, error: bookError } = await supabase
        .from("books")
        .insert({
          author_id: author.id,
          title: `${book.title} (Copy)`,
          subtitle: book.subtitle,
          description: book.description,
          age_min: 2,
          age_max: 8,
          status: "draft",
          page_count: book.page_count,
          design_width: 1920,
          design_height: 1080,
          language: "en",
        })
        .select()
        .single();

      if (bookError) throw bookError;

      // Create blank pages matching original count
      if (book.page_count > 0) {
        const pagesToCreate = Array.from({ length: book.page_count }, (_, index) => ({
          book_id: newBook.id,
          page_index: index,
          layout_mode: "canvas" as const,
          background_color: "#ffffff",
        }));
        await supabase.from("book_pages").insert(pagesToCreate);
      }

      setBooks((prev) => [newBook as AuthorBook, ...prev]);
      setMenuOpen(null);
    } catch (error) {
      console.error("Error duplicating book:", error);
      alert("Failed to duplicate book. Please try again.");
    } finally {
      setDuplicating(false);
    }
  };

  const handleSubmitForReview = async (bookId: string) => {
    try {
      const { error } = await supabase
        .from("books")
        .update({
          status: "in_review",
          submitted_at: new Date().toISOString(),
        })
        .eq("id", bookId);

      if (error) throw error;

      setBooks(
        books.map((b) =>
          b.id === bookId
            ? {
                ...b,
                status: "in_review" as const,
                submitted_at: new Date().toISOString(),
              }
            : b,
        ),
      );
      setMenuOpen(null);
    } catch (error) {
      console.error("Error submitting for review:", error);
      alert("Failed to submit book for review. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link href="/" className="text-2xl font-bold text-amber-600">
                📚 DreamNest
              </Link>
              <span className="text-gray-300">|</span>
              <span className="text-gray-600 font-medium">Author Studio</span>
            </div>
            <nav className="flex items-center gap-4">
              <Link
                href="/library"
                className="text-gray-600 hover:text-gray-900 text-sm"
              >
                View Library
              </Link>
              <Link
                href="/account"
                className="text-gray-600 hover:text-gray-900 text-sm"
              >
                Account
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Books</h1>
            <p className="text-gray-600 mt-1">
              Create and manage your picture book collection
            </p>
          </div>
          <button
            onClick={() => setShowNewBookDialog(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl shadow-lg shadow-amber-500/30 transition-all hover:scale-105"
          >
            <Plus className="h-5 w-5" />
            Create New Book
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search books..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 flex-wrap">
            {(
              ["all", "draft", "in_review", "published", "archived"] as const
            ).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? "bg-amber-500 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                {status === "all"
                  ? "All"
                  : status === "in_review"
                    ? "In Review"
                    : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Books", value: books.length, color: "bg-blue-500" },
            {
              label: "Drafts",
              value: books.filter((b) => b.status === "draft").length,
              color: "bg-gray-500",
            },
            {
              label: "In Review",
              value: books.filter((b) => b.status === "in_review").length,
              color: "bg-yellow-500",
            },
            {
              label: "Published",
              value: books.filter((b) => b.status === "published").length,
              color: "bg-green-500",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className={`w-2 h-8 ${stat.color} rounded-full`} />
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Books Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {books.length === 0
                ? "No books yet"
                : "No books match your filters"}
            </h3>
            <p className="text-gray-500 mb-6">
              {books.length === 0
                ? "Create your first picture book and start bringing stories to life!"
                : "Try adjusting your search or filters"}
            </p>
            {books.length === 0 && (
              <button
                onClick={() => setShowNewBookDialog(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl transition-colors"
              >
                <Plus className="h-5 w-5" />
                Create Your First Book
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                menuOpen={menuOpen === book.id}
                onMenuToggle={() =>
                  setMenuOpen(menuOpen === book.id ? null : book.id)
                }
                onEdit={() => router.push(`/author/books/${book.id}/edit`)}
                onDelete={() => {
                  setMenuOpen(null);
                  setConfirmDeleteBook(book);
                }}
                onDuplicate={() => handleDuplicateBook(book)}
                onPublish={() => handlePublishBook(book.id)}
                onSubmitForReview={() => handleSubmitForReview(book.id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Delete Confirmation Dialog */}
      {confirmDeleteBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setConfirmDeleteBook(null)}
          />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b bg-gradient-to-r from-rose-50 to-red-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Delete "{confirmDeleteBook.title}"?
                  </h3>
                  <p className="text-sm text-gray-600">
                    This removes the book and its pages from your workspace. You
                    can’t undo this action.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 border border-gray-100 rounded-xl p-3">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span>
                  Make sure you’ve exported or shared anything you still need.
                </span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDeleteBook(null)}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await handleDeleteBook(confirmDeleteBook.id);
                    setConfirmDeleteBook(null);
                  }}
                  disabled={deletingId === confirmDeleteBook.id}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white font-semibold shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transition-all hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {deletingId === confirmDeleteBook.id ? "Deleting..." : "Delete Book"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Book Dialog */}
      {showNewBookDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowNewBookDialog(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl w-[90vw] max-w-6xl h-[90vh] max-h-[90vh] p-6 animate-in zoom-in-95 fade-in duration-200 flex flex-col overflow-hidden">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Create New Book
            </h2>
            <form
              onSubmit={handleCreateBook}
              className="space-y-5 flex-1 overflow-y-auto pr-1"
            >
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Title <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newBookData.title}
                  onChange={(e) =>
                    setNewBookData({ ...newBookData, title: e.target.value })
                  }
                  placeholder="Enter book title..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 bg-white text-gray-900 placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={newBookData.subtitle}
                  onChange={(e) =>
                    setNewBookData({ ...newBookData, subtitle: e.target.value })
                  }
                  placeholder="Optional subtitle..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 bg-white text-gray-900 placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Description
                </label>
                <textarea
                  value={newBookData.description}
                  onChange={(e) =>
                    setNewBookData({
                      ...newBookData,
                      description: e.target.value,
                    })
                  }
                  placeholder="What's your book about..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 resize-none bg-white text-gray-900 placeholder-gray-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Min Age
                  </label>
                  <select
                    value={newBookData.ageMin}
                    onChange={(e) => {
                      const newAgeMin = parseInt(e.target.value);
                      setNewBookData({
                        ...newBookData,
                        ageMin: newAgeMin,
                        coverTemplate: getDefaultCoverTemplate(
                          newAgeMin,
                        ) as CoverTemplateId,
                      });
                    }}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 bg-white text-gray-900 font-medium"
                  >
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((age) => (
                      <option key={age} value={age}>
                        {age} years
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Max Age
                  </label>
                  <select
                    value={newBookData.ageMax}
                    onChange={(e) =>
                      setNewBookData({
                        ...newBookData,
                        ageMax: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 bg-white text-gray-900 font-medium"
                  >
                    {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((age) => (
                      <option key={age} value={age}>
                        {age} years
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Page Layout Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Page Layout
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {PAGE_LAYOUT_IDS.map((layoutId) => {
                    const layout = PAGE_LAYOUTS[layoutId];
                    return (
                      <button
                        key={layoutId}
                        type="button"
                        onClick={() =>
                          setNewBookData({
                            ...newBookData,
                            pageLayout: layoutId,
                          })
                        }
                        className={`relative p-4 border-2 rounded-xl text-left transition-all ${
                          newBookData.pageLayout === layoutId
                            ? "border-amber-500 bg-amber-50"
                            : "border-gray-200 hover:border-amber-300 bg-white"
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <div className="flex-1">
                            <div
                              className={`text-sm font-semibold mb-1 ${
                                newBookData.pageLayout === layoutId
                                  ? "text-amber-900"
                                  : "text-gray-900"
                              }`}
                            >
                              {layout.name}
                            </div>
                            <div className="text-xs text-gray-600 leading-tight mb-2">
                              {layout.description}
                            </div>
                            <div className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                              {layout.defaultPageCount} pages
                            </div>
                          </div>
                          {newBookData.pageLayout === layoutId && (
                            <CheckCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cover Template Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Cover Template
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(COVER_TEMPLATES).map(([id, template]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() =>
                        setNewBookData({
                          ...newBookData,
                          coverTemplate: id as CoverTemplateId,
                        })
                      }
                      className={`relative p-4 border-2 rounded-xl text-left transition-all ${
                        newBookData.coverTemplate === id
                          ? "border-amber-500 bg-amber-50"
                          : "border-gray-200 hover:border-amber-300 bg-white"
                      }`}
                    >
                      <div className="flex flex-col gap-3">
                        <div className="flex items-start gap-2">
                          <div className="flex-1">
                            <div
                              className={`text-sm font-semibold mb-1 ${
                                newBookData.coverTemplate === id
                                  ? "text-amber-900"
                                  : "text-gray-900"
                              }`}
                            >
                              {template.name}
                            </div>
                            <div className="text-xs text-gray-600 leading-tight">
                              {template.description}
                            </div>
                          </div>
                          {newBookData.coverTemplate === id && (
                            <CheckCircle className="h-5 w-5 text-amber-500 shrink-0" />
                          )}
                        </div>

                        {/* Visual Preview */}
                        <div className="h-24 rounded-lg overflow-hidden relative">
                          {id === "VIDEO_CENTER_TEXT" && (
                            <div className="h-full bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                              <div className="text-center">
                                <div className="w-20 h-2.5 bg-white rounded mx-auto mb-1" />
                                <div className="w-16 h-1.5 bg-white/80 rounded mx-auto" />
                              </div>
                            </div>
                          )}
                          {id === "IMAGE_CENTER_TEXT" && (
                            <div className="h-full bg-linear-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                              <div className="text-center">
                                <div className="w-20 h-2.5 bg-white rounded mx-auto mb-1" />
                                <div className="w-16 h-1.5 bg-white/80 rounded mx-auto" />
                              </div>
                            </div>
                          )}
                          {id === "TEXT_ONLY_BORDER" && (
                            <div className="h-full bg-white border-4 border-amber-400 flex items-center justify-center">
                              <div className="text-center">
                                <div className="w-20 h-2.5 bg-gray-800 rounded mx-auto mb-1" />
                                <div className="w-16 h-1.5 bg-gray-600 rounded mx-auto" />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4 sticky bottom-0 bg-white pb-1">
                <button
                  type="button"
                  onClick={() => setShowNewBookDialog(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !newBookData.title}
                  className="flex-1 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {creating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Create Book
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Book Card Component
function BookCard({
  book,
  menuOpen,
  onMenuToggle,
  onEdit,
  onDelete,
  onDuplicate,
  onPublish,
  onSubmitForReview,
}: {
  book: AuthorBook;
  menuOpen: boolean;
  onMenuToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onPublish: () => void;
  onSubmitForReview: () => void;
}) {
  const status = statusConfig[book.status];
  const StatusIcon = status.icon;

  return (
    <div
      className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all overflow-hidden cursor-pointer"
      onClick={onEdit}
    >
      {/* Cover Image */}
      <div className="relative aspect-[4/3] bg-gradient-to-br from-amber-100 to-orange-100">
        {book.cover_url ? (
          <Image
            src={book.cover_url}
            alt={book.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen className="h-16 w-16 text-amber-300" />
          </div>
        )}
        {/* Status Badge */}
        <div
          className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${status.className}`}
          onClick={(e) => e.stopPropagation()}
        >
          <StatusIcon className="h-3 w-3" />
          {status.label}
        </div>
        {/* Menu Button */}
        <div className="absolute top-3 right-3 z-20">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMenuToggle();
            }}
            className="p-1.5 bg-white/90 hover:bg-white rounded-lg shadow-sm transition-transform hover:scale-105 focus:ring-2 focus:ring-amber-300"
          >
            <MoreHorizontal className="h-4 w-4 text-gray-600" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <Edit2 className="h-4 w-4" />
                Edit Book
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate();
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                Duplicate
              </button>
              {book.status === "draft" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSubmitForReview();
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-amber-600 hover:bg-amber-50 flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Submit for Review
                </button>
              )}
              {book.status !== "published" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPublish();
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-green-700 hover:bg-green-50 flex items-center gap-2"
                >
                  <PublishIcon className="h-4 w-4" />
                  Publish
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Book
              </button>
            </div>
          )}
        </div>
        {/* Quick Edit Overlay */}
        <div
          onClick={onEdit}
          className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors cursor-pointer flex items-center justify-center opacity-0 group-hover:opacity-100 z-10 pointer-events-none group-hover:pointer-events-auto"
        >
          <div className="bg-white rounded-xl px-4 py-2 font-medium text-gray-900 flex items-center gap-2 shadow-lg pointer-events-auto">
            <Edit2 className="h-4 w-4" />
            Edit
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 truncate">{book.title}</h3>
        {book.subtitle && (
          <p className="text-sm text-gray-500 truncate mt-0.5">
            {book.subtitle}
          </p>
        )}
        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            {book.page_count} {book.page_count === 1 ? "page" : "pages"}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {formatDate(book.updated_at)}
          </span>
        </div>
        {book.rejection_reason && book.status === "draft" && (
          <div className="mt-3 p-2 bg-red-50 rounded-lg text-xs text-red-600">
            <strong>Feedback:</strong> {book.rejection_reason}
          </div>
        )}
      </div>
    </div>
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
