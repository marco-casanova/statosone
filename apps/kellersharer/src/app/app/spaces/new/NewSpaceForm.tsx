"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Card, Input, useToast } from "@stratos/ui";
import { 
  ArrowLeft, 
  ArrowRight, 
  Building2, 
  MapPin, 
  Euro, 
  Calendar,
  Check
} from "lucide-react";
import { Sidebar, Header } from "@/components/dashboard";
import { createSpace } from "@/actions";
import type { KellerProfile, SpaceType, CreateSpaceForm } from "@/types";

interface NewSpaceFormProps {
  profile: KellerProfile;
}

const spaceTypes: { value: SpaceType; label: string; icon: string; desc: string }[] = [
  { value: "basement", label: "Basement", icon: "🏚️", desc: "Underground storage space" },
  { value: "garage", label: "Garage", icon: "🚗", desc: "Vehicle or storage space" },
  { value: "attic", label: "Attic", icon: "🏠", desc: "Upper floor storage" },
  { value: "storage_room", label: "Storage Room", icon: "📦", desc: "Dedicated storage area" },
  { value: "warehouse", label: "Warehouse", icon: "🏭", desc: "Large commercial space" },
  { value: "parking", label: "Parking", icon: "🅿️", desc: "Outdoor parking spot" },
  { value: "other", label: "Other", icon: "📍", desc: "Other type of space" },
];

const amenities = [
  "24/7 Access",
  "Climate Control",
  "Security Camera",
  "Lighting",
  "Shelving",
  "Power Outlet",
  "Water Access",
  "Vehicle Access",
  "Ground Floor",
  "Elevator Access",
];

export function NewSpaceForm({ profile }: NewSpaceFormProps) {
  const router = useRouter();
  const toast = useToast();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState<CreateSpaceForm>({
    title: "",
    description: "",
    type: "basement",
    size_m2: 0,
    price_per_m2: 0,
    address: "",
    city: "",
    postal_code: "",
    amenities: [],
    available_from: new Date().toISOString().split("T")[0],
    minimum_rental_months: 3,
  });

  const totalPrice = form.size_m2 * form.price_per_m2;

  function updateForm(updates: Partial<CreateSpaceForm>) {
    setForm((prev) => ({ ...prev, ...updates }));
  }

  function toggleAmenity(amenity: string) {
    const updated = form.amenities.includes(amenity)
      ? form.amenities.filter((a) => a !== amenity)
      : [...form.amenities, amenity];
    updateForm({ amenities: updated });
  }

  async function handleSubmit() {
    setLoading(true);
    const result = await createSpace(form);
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Space created! It will be reviewed shortly.");
    router.push("/app/spaces");
  }

  return (
    <>
      <Sidebar userType="renter" />
      
      <div style={styles.mainContent}>
        <Header 
          title="Add New Space"
          subtitle="List your unused space and start earning"
          actions={
            <Link href="/app/spaces">
              <Button variant="ghost">
                <ArrowLeft size={18} /> Back to Spaces
              </Button>
            </Link>
          }
        />

        <main style={styles.main}>
          {/* Progress Steps */}
          <div style={styles.progress}>
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                style={{
                  ...styles.progressStep,
                  backgroundColor: step >= s ? "#10b981" : "#e5e7eb",
                  color: step >= s ? "#ffffff" : "#6b7280",
                }}
              >
                {step > s ? <Check size={16} /> : s}
              </div>
            ))}
          </div>

          <Card padding="lg" style={styles.formCard}>
            {/* Step 1: Space Type */}
            {step === 1 && (
              <>
                <h2 style={styles.stepTitle}>What type of space is it?</h2>
                <p style={styles.stepDesc}>Select the category that best describes your space</p>
                
                <div style={styles.typeGrid}>
                  {spaceTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => updateForm({ type: type.value })}
                      style={{
                        ...styles.typeCard,
                        borderColor: form.type === type.value ? "#10b981" : "#e5e7eb",
                        backgroundColor: form.type === type.value ? "#f0fdf4" : "#ffffff",
                      }}
                    >
                      <span style={styles.typeIcon}>{type.icon}</span>
                      <span style={styles.typeLabel}>{type.label}</span>
                      <span style={styles.typeDesc}>{type.desc}</span>
                    </button>
                  ))}
                </div>

                <div style={styles.formActions}>
                  <div />
                  <Button onClick={() => setStep(2)}>
                    Continue <ArrowRight size={18} />
                  </Button>
                </div>
              </>
            )}

            {/* Step 2: Details */}
            {step === 2 && (
              <>
                <h2 style={styles.stepTitle}>Space Details</h2>
                <p style={styles.stepDesc}>Tell potential renters about your space</p>
                
                <div style={styles.formGrid}>
                  <div style={styles.fullWidth}>
                    <Input
                      label="Title"
                      value={form.title}
                      onChange={(e) => updateForm({ title: e.target.value })}
                      placeholder="e.g., Dry Basement Storage in Berlin Mitte"
                      required
                    />
                  </div>
                  
                  <div style={styles.fullWidth}>
                    <label style={styles.label}>Description</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => updateForm({ description: e.target.value })}
                      placeholder="Describe your space, its features, and any access instructions..."
                      style={styles.textarea}
                      rows={4}
                    />
                  </div>

                  <Input
                    label="Size (m²)"
                    type="number"
                    value={form.size_m2 || ""}
                    onChange={(e) => updateForm({ size_m2: Number(e.target.value) })}
                    placeholder="15"
                    required
                  />

                  <Input
                    label="Minimum rental (months)"
                    type="number"
                    value={form.minimum_rental_months}
                    onChange={(e) => updateForm({ minimum_rental_months: Number(e.target.value) })}
                    placeholder="3"
                  />
                </div>

                <div style={styles.formActions}>
                  <Button variant="ghost" onClick={() => setStep(1)}>
                    <ArrowLeft size={18} /> Back
                  </Button>
                  <Button onClick={() => setStep(3)} disabled={!form.title || !form.size_m2}>
                    Continue <ArrowRight size={18} />
                  </Button>
                </div>
              </>
            )}

            {/* Step 3: Location & Price */}
            {step === 3 && (
              <>
                <h2 style={styles.stepTitle}>Location & Pricing</h2>
                <p style={styles.stepDesc}>Where is your space and how much will you charge?</p>
                
                <div style={styles.formGrid}>
                  <div style={styles.fullWidth}>
                    <Input
                      label="Street Address"
                      value={form.address}
                      onChange={(e) => updateForm({ address: e.target.value })}
                      placeholder="Friedrichstraße 123"
                      required
                    />
                  </div>

                  <Input
                    label="City"
                    value={form.city}
                    onChange={(e) => updateForm({ city: e.target.value })}
                    placeholder="Berlin"
                    required
                  />

                  <Input
                    label="Postal Code"
                    value={form.postal_code}
                    onChange={(e) => updateForm({ postal_code: e.target.value })}
                    placeholder="10117"
                    required
                  />

                  <Input
                    label="Price per m² (€/month)"
                    type="number"
                    value={form.price_per_m2 || ""}
                    onChange={(e) => updateForm({ price_per_m2: Number(e.target.value) })}
                    placeholder="5"
                    required
                  />

                  <Input
                    label="Available from"
                    type="date"
                    value={form.available_from}
                    onChange={(e) => updateForm({ available_from: e.target.value })}
                    required
                  />
                </div>

                <div style={styles.pricePreview}>
                  <div style={styles.priceLabel}>Total Monthly Price</div>
                  <div style={styles.priceAmount}>
                    €{totalPrice.toFixed(2)}
                    <span style={styles.priceCalc}>
                      ({form.size_m2} m² × €{form.price_per_m2}/m²)
                    </span>
                  </div>
                </div>

                <div style={styles.formActions}>
                  <Button variant="ghost" onClick={() => setStep(2)}>
                    <ArrowLeft size={18} /> Back
                  </Button>
                  <Button onClick={() => setStep(4)} disabled={!form.city || !form.price_per_m2}>
                    Continue <ArrowRight size={18} />
                  </Button>
                </div>
              </>
            )}

            {/* Step 4: Amenities & Submit */}
            {step === 4 && (
              <>
                <h2 style={styles.stepTitle}>Amenities & Features</h2>
                <p style={styles.stepDesc}>What features does your space offer?</p>
                
                <div style={styles.amenitiesGrid}>
                  {amenities.map((amenity) => (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => toggleAmenity(amenity)}
                      style={{
                        ...styles.amenityBtn,
                        borderColor: form.amenities.includes(amenity) ? "#10b981" : "#e5e7eb",
                        backgroundColor: form.amenities.includes(amenity) ? "#f0fdf4" : "#ffffff",
                        color: form.amenities.includes(amenity) ? "#059669" : "#4b5563",
                      }}
                    >
                      {form.amenities.includes(amenity) && <Check size={14} />}
                      {amenity}
                    </button>
                  ))}
                </div>

                {/* Summary */}
                <Card padding="md" style={styles.summaryCard}>
                  <h3 style={styles.summaryTitle}>Summary</h3>
                  <div style={styles.summaryGrid}>
                    <div>
                      <span style={styles.summaryLabel}>Type</span>
                      <span style={styles.summaryValue}>
                        {spaceTypes.find((t) => t.value === form.type)?.icon}{" "}
                        {spaceTypes.find((t) => t.value === form.type)?.label}
                      </span>
                    </div>
                    <div>
                      <span style={styles.summaryLabel}>Size</span>
                      <span style={styles.summaryValue}>{form.size_m2} m²</span>
                    </div>
                    <div>
                      <span style={styles.summaryLabel}>Location</span>
                      <span style={styles.summaryValue}>{form.city}</span>
                    </div>
                    <div>
                      <span style={styles.summaryLabel}>Monthly Price</span>
                      <span style={styles.summaryValue}>€{totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </Card>

                <div style={styles.formActions}>
                  <Button variant="ghost" onClick={() => setStep(3)}>
                    <ArrowLeft size={18} /> Back
                  </Button>
                  <Button onClick={handleSubmit} loading={loading}>
                    Submit for Review <Check size={18} />
                  </Button>
                </div>
              </>
            )}
          </Card>
        </main>
      </div>
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  mainContent: {
    marginLeft: "260px",
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  main: {
    padding: "2rem",
    maxWidth: "800px",
  },
  progress: {
    display: "flex",
    justifyContent: "center",
    gap: "1rem",
    marginBottom: "2rem",
  },
  progressStep: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.875rem",
    fontWeight: 600,
  },
  formCard: {
    
  },
  stepTitle: {
    fontSize: "1.25rem",
    fontWeight: 600,
    color: "#111827",
    marginBottom: "0.5rem",
  },
  stepDesc: {
    fontSize: "0.875rem",
    color: "#6b7280",
    marginBottom: "1.5rem",
  },
  typeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
    gap: "1rem",
    marginBottom: "1.5rem",
  },
  typeCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "1rem",
    border: "2px solid #e5e7eb",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    textAlign: "center",
  },
  typeIcon: {
    fontSize: "2rem",
    marginBottom: "0.5rem",
  },
  typeLabel: {
    fontSize: "0.875rem",
    fontWeight: 600,
    color: "#111827",
    marginBottom: "0.25rem",
  },
  typeDesc: {
    fontSize: "0.7rem",
    color: "#6b7280",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1rem",
    marginBottom: "1.5rem",
  },
  fullWidth: {
    gridColumn: "1 / -1",
  },
  label: {
    display: "block",
    fontSize: "0.875rem",
    fontWeight: 500,
    color: "#374151",
    marginBottom: "0.5rem",
  },
  textarea: {
    width: "100%",
    padding: "0.75rem",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "0.875rem",
    resize: "vertical",
    fontFamily: "inherit",
  },
  pricePreview: {
    padding: "1rem",
    backgroundColor: "#f0fdf4",
    borderRadius: "8px",
    marginBottom: "1.5rem",
  },
  priceLabel: {
    fontSize: "0.8rem",
    color: "#6b7280",
    marginBottom: "0.25rem",
  },
  priceAmount: {
    fontSize: "1.5rem",
    fontWeight: 700,
    color: "#059669",
    display: "flex",
    alignItems: "baseline",
    gap: "0.5rem",
  },
  priceCalc: {
    fontSize: "0.8rem",
    fontWeight: 400,
    color: "#6b7280",
  },
  amenitiesGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.5rem",
    marginBottom: "1.5rem",
  },
  amenityBtn: {
    display: "flex",
    alignItems: "center",
    gap: "0.375rem",
    padding: "0.5rem 0.75rem",
    border: "1px solid #e5e7eb",
    borderRadius: "20px",
    fontSize: "0.8rem",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  summaryCard: {
    backgroundColor: "#f9fafb",
    marginBottom: "1.5rem",
  },
  summaryTitle: {
    fontSize: "0.9rem",
    fontWeight: 600,
    color: "#111827",
    marginBottom: "1rem",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1rem",
  },
  summaryLabel: {
    display: "block",
    fontSize: "0.75rem",
    color: "#6b7280",
    marginBottom: "0.25rem",
  },
  summaryValue: {
    fontSize: "0.9rem",
    fontWeight: 500,
    color: "#111827",
  },
  formActions: {
    display: "flex",
    justifyContent: "space-between",
    paddingTop: "1rem",
    borderTop: "1px solid #e5e7eb",
  },
};
