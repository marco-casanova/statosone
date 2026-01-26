"use client";

import React, { useState, useEffect } from "react";
import { Client, ClientFormData } from "@/types/kinrelay";

interface ClientFormProps {
  onSubmit?: (client: Client) => void;
  initialData?: Partial<Client>;
  mode?: "create" | "edit";
}

export default function ClientForm({
  onSubmit,
  initialData,
  mode = "create",
}: ClientFormProps) {
  const [formData, setFormData] = useState<ClientFormData>({
    full_name: "",
    date_of_birth: "",
    gender: "",
    address: "",
    phone: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    medical_conditions: [],
    allergies: [],
    medications_notes: "",
    dietary_restrictions: "",
    mobility_level: "",
    cognitive_status: "",
    insurance_provider: "",
    insurance_policy_number: "",
    primary_physician_name: "",
    primary_physician_phone: "",
    care_requirements: "",
    additional_notes: "",
    ...initialData,
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalSteps = 3;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (
    field: "medical_conditions" | "allergies",
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
        .split(",")
        .map((v) => v.trim())
        .filter((v) => v),
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const endpoint = "/api/clients";
      const method = mode === "create" ? "POST" : "PUT";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          mode === "edit" ? { ...formData, id: initialData?.id } : formData
        ),
      });

      const result = await response.json();

      if (result.success) {
        if (onSubmit) onSubmit(result.data);
      } else {
        setError(result.error.message);
      }
    } catch (err: any) {
      setError(err.message || "Failed to save client");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="client-form">
      <div className="form-header">
        <h2>REGISTRO DE CLIENTES</h2>
        <div className="step-indicators">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`step-indicator ${
                currentStep === step ? "active" : ""
              } ${currentStep > step ? "completed" : ""}`}
            >
              {step}
            </div>
          ))}
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="form-content">
        {currentStep === 1 && (
          <div className="form-step">
            <h3>Información Básica</h3>

            <div className="form-group">
              <label htmlFor="full_name">Nombre Completo *</label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="date_of_birth">Fecha de Nacimiento *</label>
                <input
                  type="date"
                  id="date_of_birth"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="gender">Género</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="">Seleccionar...</option>
                  <option value="male">Masculino</option>
                  <option value="female">Femenino</option>
                  <option value="other">Otro</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="address">Dirección</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Teléfono</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="form-step">
            <h3>Información Médica</h3>

            <div className="form-group">
              <label htmlFor="medical_conditions">
                Condiciones Médicas (separadas por comas)
              </label>
              <textarea
                id="medical_conditions"
                value={formData.medical_conditions?.join(", ")}
                onChange={(e) =>
                  handleArrayChange("medical_conditions", e.target.value)
                }
                rows={3}
              />
            </div>

            <div className="form-group">
              <label htmlFor="allergies">Alergias (separadas por comas)</label>
              <textarea
                id="allergies"
                value={formData.allergies?.join(", ")}
                onChange={(e) => handleArrayChange("allergies", e.target.value)}
                rows={3}
              />
            </div>

            <div className="form-group">
              <label htmlFor="medications_notes">Notas de Medicamentos</label>
              <textarea
                id="medications_notes"
                name="medications_notes"
                value={formData.medications_notes}
                onChange={handleChange}
                rows={3}
              />
            </div>

            <div className="form-group">
              <label htmlFor="dietary_restrictions">
                Restricciones Dietéticas
              </label>
              <textarea
                id="dietary_restrictions"
                name="dietary_restrictions"
                value={formData.dietary_restrictions}
                onChange={handleChange}
                rows={2}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="mobility_level">Nivel de Movilidad</label>
                <select
                  id="mobility_level"
                  name="mobility_level"
                  value={formData.mobility_level}
                  onChange={handleChange}
                >
                  <option value="">Seleccionar...</option>
                  <option value="independent">Independiente</option>
                  <option value="needs_assistance">Necesita Asistencia</option>
                  <option value="wheelchair">Silla de Ruedas</option>
                  <option value="bedridden">Postrado en Cama</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="cognitive_status">Estado Cognitivo</label>
                <select
                  id="cognitive_status"
                  name="cognitive_status"
                  value={formData.cognitive_status}
                  onChange={handleChange}
                >
                  <option value="">Seleccionar...</option>
                  <option value="normal">Normal</option>
                  <option value="mild_impairment">Deterioro Leve</option>
                  <option value="moderate_impairment">
                    Deterioro Moderado
                  </option>
                  <option value="severe_impairment">Deterioro Severo</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="form-step">
            <h3>Contacto de Emergencia y Seguro</h3>

            <div className="form-group">
              <label htmlFor="emergency_contact_name">
                Nombre Contacto de Emergencia
              </label>
              <input
                type="text"
                id="emergency_contact_name"
                name="emergency_contact_name"
                value={formData.emergency_contact_name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="emergency_contact_phone">
                Teléfono Contacto de Emergencia
              </label>
              <input
                type="tel"
                id="emergency_contact_phone"
                name="emergency_contact_phone"
                value={formData.emergency_contact_phone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="insurance_provider">Proveedor de Seguro</label>
              <input
                type="text"
                id="insurance_provider"
                name="insurance_provider"
                value={formData.insurance_provider}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="insurance_policy_number">Número de Póliza</label>
              <input
                type="text"
                id="insurance_policy_number"
                name="insurance_policy_number"
                value={formData.insurance_policy_number}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="primary_physician_name">Médico de Cabecera</label>
              <input
                type="text"
                id="primary_physician_name"
                name="primary_physician_name"
                value={formData.primary_physician_name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="primary_physician_phone">Teléfono Médico</label>
              <input
                type="tel"
                id="primary_physician_phone"
                name="primary_physician_phone"
                value={formData.primary_physician_phone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="care_requirements">
                Requerimientos de Cuidado
              </label>
              <textarea
                id="care_requirements"
                name="care_requirements"
                value={formData.care_requirements}
                onChange={handleChange}
                rows={3}
              />
            </div>

            <div className="form-group">
              <label htmlFor="additional_notes">Notas Adicionales</label>
              <textarea
                id="additional_notes"
                name="additional_notes"
                value={formData.additional_notes}
                onChange={handleChange}
                rows={3}
              />
            </div>
          </div>
        )}
      </div>

      <div className="form-actions">
        {currentStep > 1 && (
          <button
            onClick={prevStep}
            className="btn-secondary"
            disabled={loading}
          >
            Anterior
          </button>
        )}
        <button onClick={nextStep} className="btn-primary" disabled={loading}>
          {loading
            ? "Guardando..."
            : currentStep === totalSteps
            ? "Guardar"
            : "Siguiente"}
        </button>
      </div>

      <style jsx>{`
        .client-form {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background: #b2dfdb;
          min-height: 100vh;
        }

        .form-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .form-header h2 {
          font-size: 20px;
          margin-bottom: 20px;
        }

        .step-indicators {
          display: flex;
          justify-content: center;
          gap: 15px;
        }

        .step-indicator {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border: 2px solid #ccc;
          font-weight: bold;
        }

        .step-indicator.active {
          background: #ffd54f;
          border-color: #ffd54f;
        }

        .step-indicator.completed {
          background: #4caf50;
          border-color: #4caf50;
          color: white;
        }

        .error-message {
          background: #ffebee;
          color: #c62828;
          padding: 12px;
          border-radius: 4px;
          margin-bottom: 20px;
        }

        .form-content {
          background: white;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .form-step h3 {
          font-size: 18px;
          margin-bottom: 20px;
          color: #333;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
          color: #555;
        }

        input,
        select,
        textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 14px;
        }

        textarea {
          resize: vertical;
        }

        .form-actions {
          display: flex;
          justify-content: space-between;
          gap: 10px;
        }

        .btn-primary,
        .btn-secondary {
          flex: 1;
          padding: 12px;
          border: none;
          border-radius: 25px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
        }

        .btn-primary {
          background: #ffd54f;
          color: #333;
        }

        .btn-primary:hover:not(:disabled) {
          background: #ffc107;
        }

        .btn-secondary {
          background: white;
          color: #333;
          border: 2px solid #ffd54f;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #f5f5f5;
        }

        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
