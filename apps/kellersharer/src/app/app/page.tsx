"use client";

import { useAuth } from "@stratos/auth";
import { Card, Button, Avatar, Badge } from "@stratos/ui";
import { LogOut, Plus, Search, MessageSquare, MapPin } from "lucide-react";

// Placeholder listings
const listings = [
  {
    id: 1,
    title: "Dry Basement Storage",
    location: "Berlin Mitte",
    size: "15 m²",
    price: "€80/month",
  },
  {
    id: 2,
    title: "Garage Space",
    location: "Berlin Kreuzberg",
    size: "20 m²",
    price: "€120/month",
  },
  {
    id: 3,
    title: "Attic Room",
    location: "Berlin Prenzlauer Berg",
    size: "10 m²",
    price: "€60/month",
  },
];

export default function AppDashboard() {
  const { user, signOut } = useAuth();

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.logo}>🏠 KellerSharer</h1>
        <div style={styles.headerRight}>
          <Button variant="outline" size="sm">
            <MessageSquare size={16} /> Messages
          </Button>
          <Avatar fallback={user?.email || "U"} size="sm" />
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut size={16} />
          </Button>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.actions}>
          <Button>
            <Plus size={16} /> List a Space
          </Button>
          <Button variant="secondary">
            <Search size={16} /> Find a Space
          </Button>
        </div>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Spaces Near You</h2>
          <div style={styles.grid}>
            {listings.map((listing) => (
              <Card key={listing.id} padding="md" style={styles.listingCard}>
                <div style={styles.listingImage}>📦</div>
                <h3 style={styles.listingTitle}>{listing.title}</h3>
                <p style={styles.listingMeta}>
                  <MapPin size={14} /> {listing.location}
                </p>
                <div style={styles.listingFooter}>
                  <Badge variant="success">{listing.size}</Badge>
                  <span style={styles.price}>{listing.price}</span>
                </div>
                <Button size="sm" variant="outline" style={{ marginTop: "1rem", width: "100%" }}>
                  View Details
                </Button>
              </Card>
            ))}
          </div>
        </section>

        <Card padding="lg" style={{ marginTop: "2rem" }}>
          <h3 style={styles.cardTitle}>MVP Note</h3>
          <p style={styles.placeholder}>
            In the full version, users can create space listings, browse available spaces,
            and communicate directly through the platform. Admins can review listings for fraud.
          </p>
        </Card>
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "1rem 2rem",
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
  },
  logo: {
    fontSize: "1.25rem",
    fontWeight: 700,
    color: "#166534",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  main: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "2rem",
  },
  actions: {
    display: "flex",
    gap: "1rem",
    marginBottom: "2rem",
  },
  section: {
    marginBottom: "2rem",
  },
  sectionTitle: {
    fontSize: "1.5rem",
    fontWeight: 700,
    marginBottom: "1.5rem",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "1.5rem",
  },
  listingCard: {
    cursor: "pointer",
  },
  listingImage: {
    height: "120px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "3rem",
    backgroundColor: "#dcfce7",
    borderRadius: "0.5rem",
    marginBottom: "1rem",
  },
  listingTitle: {
    fontSize: "1rem",
    fontWeight: 600,
    marginBottom: "0.25rem",
  },
  listingMeta: {
    display: "flex",
    alignItems: "center",
    gap: "0.25rem",
    fontSize: "0.875rem",
    color: "#6b7280",
    marginBottom: "0.75rem",
  },
  listingFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  price: {
    fontWeight: 600,
    color: "#166534",
  },
  cardTitle: {
    fontSize: "1.125rem",
    fontWeight: 600,
    marginBottom: "0.5rem",
  },
  placeholder: {
    color: "#6b7280",
  },
};
