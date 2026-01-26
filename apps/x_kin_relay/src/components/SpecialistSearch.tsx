"use client";

import React, { useState } from "react";
import { Profile, SearchFilters, SearchResult } from "@/types/kinrelay";

interface SpecialistSearchProps {
  userRole: "family" | "specialist" | "nurse" | "caregiver";
}

export default function SpecialistSearch({ userRole }: SpecialistSearchProps) {
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    specialization: "",
    minRating: 0,
    maxHourlyRate: undefined,
    languages: [],
    location: {},
  });

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filters),
      });

      const result = await response.json();
      if (result.success) {
        setSearchResults(result.data.profiles);
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const isFamily = userRole === "family";

  return (
    <div className="specialist-search">
      <div className="search-header">
        <h2>{isFamily ? "Buscar Especialistas" : "Buscar Familias"}</h2>
      </div>

      <div className="search-filters">
        {isFamily && (
          <>
            <div className="filter-group">
              <label htmlFor="specialization">Especialización</label>
              <input
                type="text"
                id="specialization"
                placeholder="Ej: Enfermería geriátrica"
                value={filters.specialization}
                onChange={(e) =>
                  setFilters({ ...filters, specialization: e.target.value })
                }
              />
            </div>

            <div className="filter-group">
              <label htmlFor="minRating">Calificación Mínima</label>
              <select
                id="minRating"
                value={filters.minRating}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    minRating: parseFloat(e.target.value),
                  })
                }
              >
                <option value="0">Todas</option>
                <option value="3">3+ Estrellas</option>
                <option value="4">4+ Estrellas</option>
                <option value="4.5">4.5+ Estrellas</option>
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="maxHourlyRate">Tarifa Máxima por Hora</label>
              <input
                type="number"
                id="maxHourlyRate"
                placeholder="$"
                value={filters.maxHourlyRate || ""}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    maxHourlyRate: parseFloat(e.target.value),
                  })
                }
              />
            </div>
          </>
        )}

        <div className="filter-group">
          <label htmlFor="city">Ciudad</label>
          <input
            type="text"
            id="city"
            placeholder="Ej: Miami"
            value={filters.location?.city || ""}
            onChange={(e) =>
              setFilters({
                ...filters,
                location: { ...filters.location, city: e.target.value },
              })
            }
          />
        </div>

        <button
          className="search-btn"
          onClick={handleSearch}
          disabled={loading}
        >
          {loading ? "Buscando..." : "Buscar"}
        </button>
      </div>

      <div className="search-results">
        {searchResults.length === 0 && !loading && (
          <div className="empty-state">
            <p>No se encontraron resultados. Intenta ajustar tus filtros.</p>
          </div>
        )}

        {searchResults.map((profile) => (
          <div key={profile.id} className="profile-card">
            <div className="profile-header">
              {profile.profile_image_url ? (
                <img
                  src={profile.profile_image_url}
                  alt={profile.full_name}
                  className="profile-image"
                />
              ) : (
                <div className="profile-placeholder">
                  {profile.full_name.charAt(0)}
                </div>
              )}
              <div className="profile-info">
                <h3>{profile.full_name}</h3>
                {isFamily && profile.specialization && (
                  <p className="specialization">{profile.specialization}</p>
                )}
                {profile.rating > 0 && (
                  <div className="rating">
                    ⭐ {profile.rating.toFixed(1)} ({profile.total_reviews}{" "}
                    reseñas)
                  </div>
                )}
              </div>
            </div>

            <div className="profile-details">
              {profile.years_of_experience && (
                <div className="detail-item">
                  <strong>Experiencia:</strong> {profile.years_of_experience}{" "}
                  años
                </div>
              )}
              {profile.hourly_rate && (
                <div className="detail-item">
                  <strong>Tarifa:</strong> ${profile.hourly_rate}/hora
                </div>
              )}
              {profile.languages && profile.languages.length > 0 && (
                <div className="detail-item">
                  <strong>Idiomas:</strong> {profile.languages.join(", ")}
                </div>
              )}
              {profile.city && (
                <div className="detail-item">
                  <strong>Ubicación:</strong> {profile.city}
                  {profile.state ? `, ${profile.state}` : ""}
                </div>
              )}
              {profile.bio && <p className="bio">{profile.bio}</p>}
            </div>

            <div className="profile-actions">
              <button className="btn-contact">Contactar</button>
              <button className="btn-view-profile">Ver Perfil</button>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .specialist-search {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background: #f5f5f5;
          min-height: 100vh;
        }

        .search-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .search-header h2 {
          font-size: 24px;
          color: #333;
        }

        .search-filters {
          background: white;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
          display: grid;
          gap: 15px;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
        }

        .filter-group label {
          margin-bottom: 5px;
          font-weight: 500;
          color: #555;
        }

        .filter-group input,
        .filter-group select {
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 14px;
        }

        .search-btn {
          padding: 12px;
          background: #4caf50;
          color: white;
          border: none;
          border-radius: 25px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
        }

        .search-btn:hover:not(:disabled) {
          background: #45a049;
        }

        .search-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .search-results {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .empty-state {
          text-align: center;
          padding: 40px;
          color: #666;
        }

        .profile-card {
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .profile-header {
          display: flex;
          gap: 15px;
          margin-bottom: 15px;
        }

        .profile-image {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          object-fit: cover;
        }

        .profile-placeholder {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: #b2dfdb;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: bold;
          color: #00796b;
        }

        .profile-info h3 {
          margin: 0 0 5px 0;
          font-size: 18px;
        }

        .specialization {
          color: #666;
          font-size: 14px;
          margin: 0 0 5px 0;
        }

        .rating {
          color: #ff9800;
          font-size: 14px;
        }

        .profile-details {
          margin-bottom: 15px;
        }

        .detail-item {
          margin-bottom: 8px;
          font-size: 14px;
        }

        .bio {
          margin-top: 10px;
          font-size: 14px;
          color: #666;
          line-height: 1.5;
        }

        .profile-actions {
          display: flex;
          gap: 10px;
        }

        .btn-contact,
        .btn-view-profile {
          flex: 1;
          padding: 10px;
          border: none;
          border-radius: 20px;
          font-weight: 500;
          cursor: pointer;
        }

        .btn-contact {
          background: #ffd54f;
          color: #333;
        }

        .btn-contact:hover {
          background: #ffc107;
        }

        .btn-view-profile {
          background: #e0e0e0;
          color: #333;
        }

        .btn-view-profile:hover {
          background: #bdbdbd;
        }

        @media (min-width: 768px) {
          .search-filters {
            grid-template-columns: repeat(2, 1fr);
          }

          .search-btn {
            grid-column: 1 / -1;
          }
        }
      `}</style>
    </div>
  );
}
