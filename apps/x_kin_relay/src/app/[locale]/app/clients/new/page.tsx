"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { ChevronLeft, Menu, Info } from "lucide-react";

interface ClientFormData {
  // Step 1 - Basic Info
  full_name: string;
  last_name: string;
  date_of_birth: string;
  phone: string;
  address: string;
  // Step 2 - Medical Info
  medical_conditions: string;
  medication_allergies: string;
  other_allergies: string;
  vaccinations: string;
  health_service: string;
  doctor_name: string;
  health_service_address: string;
  emergency_service: string;
  emergency_service_address: string;
  // Step 3 - Emergency Contact
  authorized_person_name: string;
  relationship: string;
  authorized_person_email: string;
  authorized_person_phone: string;
  authorized_person_address: string;
}

export default function NewClientPage() {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split("/").filter(Boolean)[0] || "en";

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<ClientFormData>({
    full_name: "",
    last_name: "",
    date_of_birth: "",
    phone: "",
    address: "",
    medical_conditions: "",
    medication_allergies: "",
    other_allergies: "",
    vaccinations: "",
    health_service: "",
    doctor_name: "",
    health_service_address: "",
    emergency_service: "",
    emergency_service_address: "",
    authorized_person_name: "",
    relationship: "",
    authorized_person_email: "",
    authorized_person_phone: "",
    authorized_person_address: "",
  });

  const totalSteps = 3;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBack = () => {
    router.push(`/${locale}/app/home`);
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNextStep = async () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Submit form
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/clients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const result = await response.json();
        if (result.success) {
          router.push(`/${locale}/app/clients`);
        } else {
          setError(result.error?.message || "Error al guardar");
        }
      } catch (err) {
        setError("Error de conexión");
      } finally {
        setLoading(false);
      }
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="form-step">
            <div className="form-group">
              <label className="form-label required">
                NOMBRE DEL CLIENTE 1
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">APELLIDOS DEL CLIENTE 1</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label required">
                  FECHA DE NACIMIENTO
                </label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label required">TELÉFONO</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">DIRECCIÓN</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="form-step">
            <div className="form-group">
              <label className="form-label required">
                CONDICIONES DIAGNOSTICADAS
              </label>
              <input
                type="text"
                name="medical_conditions"
                value={formData.medical_conditions}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label required">
                ALERGIAS A MEDICAMENTOS
              </label>
              <input
                type="text"
                name="medication_allergies"
                value={formData.medication_allergies}
                onChange={handleChange}
                className="form-input form-input--highlight"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label required">
                OTRAS ALERGIAS (ALIMENTOS, PICADURAS DE INSECTOS, OTROS)
              </label>
              <input
                type="text"
                name="other_allergies"
                value={formData.other_allergies}
                onChange={handleChange}
                className="form-input form-input--highlight"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label required">ÚLTIMAS VACUNAS</label>
              <input
                type="text"
                name="vaccinations"
                value={formData.vaccinations}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                SERVICIO DE SALUD Y Nro REGISTRO O SUBSCRIPCIÓN
              </label>
              <input
                type="text"
                name="health_service"
                value={formData.health_service}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">NOMBRE DEL MÉDICO</label>
              <input
                type="text"
                name="doctor_name"
                value={formData.doctor_name}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                DIRECCIÓN Y TELÉFONO DEL SERVICIO DE SALUD
              </label>
              <input
                type="text"
                name="health_service_address"
                value={formData.health_service_address}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                SERVICIO PRIVADO DE EMERGENCIAS/Nro SUBSCRIPCIÓN
              </label>
              <input
                type="text"
                name="emergency_service"
                value={formData.emergency_service}
                onChange={handleChange}
                className="form-input form-input--highlight"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                DIRECCIÓN Y TELÉFONO DEL SERVICIO DE EMERGENCIAS
              </label>
              <input
                type="text"
                name="emergency_service_address"
                value={formData.emergency_service_address}
                onChange={handleChange}
                className="form-input form-input--highlight"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="form-step">
            <div className="form-group">
              <label className="form-label required">
                NOMBRE Y APELLIDO DE LA PERSONA AUTORIZADA POR EL CLIENTE 1
                <button
                  type="button"
                  className="info-btn"
                  aria-label="Información"
                >
                  <Info size={14} />
                </button>
              </label>
              <input
                type="text"
                name="authorized_person_name"
                value={formData.authorized_person_name}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label required">
                PARENTESCO CON EL CLIENTE 1
              </label>
              <input
                type="text"
                name="relationship"
                value={formData.relationship}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label required">
                EMAIL DE LA PERSONA AUTORIZADA POR EL CLIENTE 1
              </label>
              <input
                type="email"
                name="authorized_person_email"
                value={formData.authorized_person_email}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label required">TELÉFONO</label>
              <input
                type="tel"
                name="authorized_person_phone"
                value={formData.authorized_person_phone}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label required">DIRECCIÓN</label>
              <input
                type="text"
                name="authorized_person_address"
                value={formData.authorized_person_address}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="client-registration">
      {/* Header */}
      <header className="registration-header">
        <button type="button" className="back-btn" onClick={handleBack}>
          <ChevronLeft size={24} />
        </button>
        <h1 className="registration-title">REGISTRO DE CLIENTES</h1>
        <button type="button" className="menu-btn">
          <Menu size={24} />
        </button>
      </header>

      {/* Step Indicators */}
      <div className="step-indicators">
        {[1, 2, 3].map((step) => (
          <React.Fragment key={step}>
            <div
              className={`step-indicator ${
                currentStep === step ? "active" : ""
              } ${currentStep > step ? "completed" : ""}`}
            >
              {step}
            </div>
            {step < 3 && (
              <div
                className={`step-connector ${
                  currentStep > step ? "completed" : ""
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Error Message */}
      {error && <div className="error-message">{error}</div>}

      {/* Form Content */}
      <div className="form-content">{renderStep()}</div>

      {/* Action Button */}
      <div className="form-actions">
        <button
          type="button"
          className="submit-btn"
          onClick={handleNextStep}
          disabled={loading}
        >
          {loading ? "..." : "ACEPTAR"}
        </button>
      </div>

      <style jsx>{`
        .client-registration {
          min-height: 100vh;
          background: var(--kinrelay-bg-primary, #88b9b0);
          padding: 16px;
          padding-top: env(safe-area-inset-top, 16px);
        }

        .registration-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 0;
          margin-bottom: 24px;
        }

        .back-btn,
        .menu-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
          color: var(--kinrelay-text-primary, #1a1a1a);
        }

        .registration-title {
          font-size: 16px;
          font-weight: 700;
          margin: 0;
          text-decoration: underline;
          letter-spacing: 0.5px;
        }

        .step-indicators {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0;
          margin-bottom: 32px;
        }

        .step-indicator {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 600;
          background: white;
          color: var(--kinrelay-text-secondary, #4a4a4a);
          transition: all 0.2s ease;
        }

        .step-indicator.active {
          background: var(--kinrelay-primary, #f5d547);
          color: var(--kinrelay-primary-text, #1a1a1a);
        }

        .step-indicator.completed {
          background: var(--kinrelay-success, #22c55e);
          color: white;
        }

        .step-connector {
          width: 24px;
          height: 2px;
          background: white;
        }

        .step-connector.completed {
          background: var(--kinrelay-primary, #f5d547);
        }

        .error-message {
          background: #fee2e2;
          color: #dc2626;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 16px;
          font-size: 14px;
        }

        .form-content {
          max-width: 400px;
          margin: 0 auto;
        }

        .form-step {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .form-label {
          font-size: 10px;
          font-weight: 500;
          text-transform: uppercase;
          color: var(--kinrelay-text-secondary, #4a4a4a);
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .form-label.required::after {
          content: "*";
          color: #dc2626;
        }

        .info-btn {
          background: none;
          border: 1px solid currentColor;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: inherit;
          padding: 0;
        }

        .form-input {
          width: 100%;
          padding: 10px 0;
          border: none;
          border-bottom: 1px solid var(--kinrelay-border, #d1d5db);
          background: transparent;
          font-size: 14px;
          color: var(--kinrelay-text-primary, #1a1a1a);
          transition: border-color 0.2s ease;
        }

        .form-input:focus {
          outline: none;
          border-bottom-color: var(--kinrelay-primary, #f5d547);
        }

        .form-input--highlight {
          border-bottom-color: #dc2626;
        }

        .form-input--highlight:focus {
          border-bottom-color: #dc2626;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 32px;
          padding-bottom: 32px;
        }

        .submit-btn {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          border: none;
          background: var(--kinrelay-primary, #f5d547);
          color: var(--kinrelay-primary-text, #1a1a1a);
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
          transition: all 0.2s ease;
        }

        .submit-btn:hover {
          transform: scale(1.05);
        }

        .submit-btn:active {
          transform: scale(0.98);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 480px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
