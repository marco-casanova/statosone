import type { TestimonialsConfig } from "../types";
import { Quote } from "lucide-react";

export function Testimonials({
  sectionTitle,
  testimonials,
}: TestimonialsConfig) {
  return (
    <section style={styles.section}>
      <div style={styles.container}>
        <h2 style={styles.title}>{sectionTitle}</h2>

        <div style={styles.grid}>
          {testimonials.map((testimonial, index) => (
            <div key={index} style={styles.card}>
              <Quote size={24} color="#d1d5db" style={{ marginBottom: "1rem" }} />
              <blockquote style={styles.quote}>{testimonial.quote}</blockquote>
              <div style={styles.author}>
                {testimonial.avatar && (
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.author}
                    style={styles.avatar}
                  />
                )}
                <div>
                  <div style={styles.authorName}>{testimonial.author}</div>
                  {(testimonial.role || testimonial.company) && (
                    <div style={styles.authorRole}>
                      {[testimonial.role, testimonial.company]
                        .filter(Boolean)
                        .join(" at ")}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  section: {
    padding: "6rem 1.5rem",
    backgroundColor: "#f9fafb",
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
  },
  title: {
    fontSize: "2.5rem",
    fontWeight: 700,
    color: "#111827",
    textAlign: "center" as const,
    marginBottom: "4rem",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "2rem",
  },
  card: {
    padding: "2rem",
    backgroundColor: "#ffffff",
    borderRadius: "1rem",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
  },
  quote: {
    fontSize: "1rem",
    color: "#374151",
    lineHeight: 1.7,
    fontStyle: "italic",
    marginBottom: "1.5rem",
  },
  author: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  avatar: {
    width: "3rem",
    height: "3rem",
    borderRadius: "50%",
    objectFit: "cover" as const,
  },
  authorName: {
    fontWeight: 600,
    color: "#111827",
  },
  authorRole: {
    fontSize: "0.875rem",
    color: "#6b7280",
  },
};
