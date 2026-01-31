"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { ChevronLeft, Menu, Edit2, UserX, ChevronDown } from "lucide-react";

interface Client {
  id: string;
  full_name: string;
  last_name: string;
  date_of_birth: string;
  phone: string;
  address: string;
  medical_conditions: string;
  medication_allergies: string;
  other_allergies: string;
  vaccinations: string;
  health_service: string;
  doctor_name: string;
  health_service_address: string;
  emergency_service: string;
  emergency_service_address: string;
  authorized_person_name: string;
  relationship: string;
  authorized_person_email: string;
  authorized_person_phone: string;
  authorized_person_address: string;
}

export default function ClientsPage() {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split("/").filter(Boolean)[0] || "en";

  // Mock clients data
  const [clients] = useState<Client[]>([
    {
      id: "1",
      full_name: "NOMBRE CLIENTE 1",
      last_name: "APELLIDOS CLIENTE 1",
      date_of_birth: "1945-03-15",
      phone: "+34 612 345 678",
      address: "Calle Principal 123, Madrid",
      medical_conditions: "Diabetes tipo 2, Hipertensión",
      medication_allergies: "Penicilina",
      other_allergies: "Mariscos, Polen",
      vaccinations: "COVID-19 (2023), Gripe (2023)",
      health_service: "Seguridad Social - 12345678A",
      doctor_name: "Dr. García Martínez",
      health_service_address: "Centro de Salud Norte, Tel: 91 234 5678",
      emergency_service: "DKV Seguros - POL123456",
      emergency_service_address: "Tel: 900 123 456",
      authorized_person_name: "María García López",
      relationship: "Hija",
      authorized_person_email: "maria@email.com",
      authorized_person_phone: "+34 698 765 432",
      authorized_person_address: "Av. Secundaria 45, Madrid",
    },
    {
      id: "2",
      full_name: "NOMBRE CLIENTE 2",
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
    },
    {
      id: "3",
      full_name: "NOMBRE CLIENTE 3",
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
    },
  ]);

  const [selectedClient, setSelectedClient] = useState<Client | null>(
    clients[0],
  );
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleBack = () => {
    router.push(`/${locale}/app/home`);
  };

  const handleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleDeleteClient = () => {
    if (confirm("¿Está seguro de que desea eliminar este cliente?")) {
      // Handle delete
      console.log("Deleting client:", selectedClient?.id);
    }
  };

  return (
    <div className="clients-page">
      {/* Header */}
      <header className="clients-header">
        <button type="button" className="back-btn" onClick={handleBack}>
          <ChevronLeft size={24} />
        </button>
        <h1 className="clients-title">PERFIL DEL CLIENTE</h1>
        <button type="button" className="menu-btn">
          <Menu size={24} />
        </button>
      </header>

      {/* Client Selector */}
      <div className="client-selector-container">
        <div
          className="client-selector"
          onClick={() => setShowClientDropdown(!showClientDropdown)}
        >
          <span className="client-name">
            ({selectedClient?.full_name || "SELECCIONAR CLIENTE"})
          </span>
          <ChevronDown size={16} />
        </div>

        {/* Action Buttons */}
        <button
          type="button"
          className="action-btn action-btn--edit"
          onClick={handleEdit}
          aria-label="Editar"
        >
          <Edit2 size={18} />
        </button>
        <button
          type="button"
          className="action-btn action-btn--delete"
          onClick={handleDeleteClient}
          aria-label="Eliminar cliente"
        >
          <UserX size={18} />
        </button>

        {showClientDropdown && (
          <div className="client-dropdown">
            {clients.map((client) => (
              <button
                key={client.id}
                className={`client-option ${
                  selectedClient?.id === client.id ? "selected" : ""
                }`}
                onClick={() => {
                  setSelectedClient(client);
                  setShowClientDropdown(false);
                }}
              >
                ({client.full_name})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Client Profile Content */}
      {selectedClient && (
        <div className="profile-content">
          {/* Basic Info */}
          <div className="profile-field">
            <label className="field-label">NOMBRE DEL CLIENTE 1</label>
            <div className="field-value">{selectedClient.full_name || "—"}</div>
          </div>

          <div className="profile-field">
            <label className="field-label">APELLIDOS DEL CLIENTE 1</label>
            <div className="field-value field-value--highlight">
              {selectedClient.last_name || "—"}
            </div>
          </div>

          <div className="profile-row">
            <div className="profile-field">
              <label className="field-label">FECHA DE NACIMIENTO</label>
              <div className="field-value">
                {selectedClient.date_of_birth || "—"}
              </div>
            </div>
            <div className="profile-field">
              <label className="field-label">TELÉFONO</label>
              <div className="field-value">{selectedClient.phone || "—"}</div>
            </div>
          </div>

          <div className="profile-field">
            <label className="field-label">DIRECCIÓN</label>
            <div className="field-value">{selectedClient.address || "—"}</div>
          </div>

          {/* Medical Info */}
          <div className="profile-field">
            <label className="field-label">CONDICIONES DIAGNOSTICADAS</label>
            <div className="field-value">
              {selectedClient.medical_conditions || "—"}
            </div>
          </div>

          <div className="profile-field">
            <label className="field-label">ALERGIAS A MEDICAMENTOS</label>
            <div className="field-value field-value--highlight">
              {selectedClient.medication_allergies || "—"}
            </div>
          </div>

          <div className="profile-field">
            <label className="field-label">
              OTRAS ALERGIAS (ALIMENTOS, PICADURAS DE INSECTOS)
            </label>
            <div className="field-value field-value--highlight">
              {selectedClient.other_allergies || "—"}
            </div>
          </div>

          <div className="profile-field">
            <label className="field-label">ÚLTIMAS VACUNAS</label>
            <div className="field-value">
              {selectedClient.vaccinations || "—"}
            </div>
          </div>

          <div className="profile-field">
            <label className="field-label">
              SERVICIO DE SALUD Y Nro REGISTRO O SUBSCRIPCIÓN
            </label>
            <div className="field-value">
              {selectedClient.health_service || "—"}
            </div>
          </div>

          <div className="profile-field">
            <label className="field-label">NOMBRE DEL MÉDICO</label>
            <div className="field-value">
              {selectedClient.doctor_name || "—"}
            </div>
          </div>

          <div className="profile-field">
            <label className="field-label">
              DIRECCIÓN Y TELÉFONO DEL SERVICIO DE SALUD
            </label>
            <div className="field-value">
              {selectedClient.health_service_address || "—"}
            </div>
          </div>

          <div className="profile-field">
            <label className="field-label">
              SERVICIO PRIVADO DE EMERGENCIAS/Nro SUBSCRIPCIÓN
            </label>
            <div className="field-value field-value--highlight">
              {selectedClient.emergency_service || "—"}
            </div>
          </div>

          <div className="profile-field">
            <label className="field-label">
              DIRECCIÓN Y TELÉFONO DEL SERVICIO DE EMERGENCIAS
            </label>
            <div className="field-value field-value--highlight">
              {selectedClient.emergency_service_address || "—"}
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="profile-field">
            <label className="field-label">
              NOMBRE Y APELLIDO DE LA PERSONA AUTORIZADA POR EL CLIENTE 1
            </label>
            <div className="field-value">
              {selectedClient.authorized_person_name || "—"}
            </div>
          </div>

          <div className="profile-field">
            <label className="field-label">PARENTESCO CON EL CLIENTE 1</label>
            <div className="field-value">
              {selectedClient.relationship || "—"}
            </div>
          </div>

          <div className="profile-field">
            <label className="field-label">
              EMAIL DE LA PERSONA AUTORIZADA POR EL CLIENTE 1
            </label>
            <div className="field-value">
              {selectedClient.authorized_person_email || "—"}
            </div>
          </div>

          <div className="profile-field">
            <label className="field-label">TELÉFONO</label>
            <div className="field-value">
              {selectedClient.authorized_person_phone || "—"}
            </div>
          </div>

          <div className="profile-field">
            <label className="field-label">DIRECCIÓN</label>
            <div className="field-value">
              {selectedClient.authorized_person_address || "—"}
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="profile-actions">
        <button type="button" className="save-btn">
          ACEPTAR
        </button>
      </div>

      <style jsx>{`
        .clients-page {
          min-height: 100vh;
          background: var(--kinrelay-bg-primary, #88b9b0);
          padding: 16px;
          padding-top: env(safe-area-inset-top, 16px);
        }

        .clients-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 0;
          margin-bottom: 16px;
        }

        .back-btn,
        .menu-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
          color: var(--kinrelay-text-primary, #1a1a1a);
        }

        .clients-title {
          font-size: 16px;
          font-weight: 700;
          margin: 0;
          letter-spacing: 0.5px;
        }

        .client-selector-container {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
          position: relative;
        }

        .client-selector {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: var(--kinrelay-primary, #f5d547);
          border-radius: 8px;
          cursor: pointer;
          flex: 1;
        }

        .client-name {
          font-size: 13px;
          font-weight: 600;
        }

        .action-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .action-btn--edit {
          background: var(--kinrelay-primary, #f5d547);
          color: var(--kinrelay-primary-text, #1a1a1a);
        }

        .action-btn--delete {
          background: #f5f5f5;
          color: var(--kinrelay-text-secondary, #4a4a4a);
        }

        .client-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 80px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 100;
          overflow: hidden;
          margin-top: 4px;
        }

        .client-option {
          display: block;
          width: 100%;
          padding: 12px 16px;
          border: none;
          background: none;
          text-align: left;
          cursor: pointer;
          font-size: 14px;
        }

        .client-option:hover {
          background: #f5f5f5;
        }

        .client-option.selected {
          background: var(--kinrelay-primary, #f5d547);
        }

        .profile-content {
          max-width: 400px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
          max-height: calc(100vh - 280px);
          overflow-y: auto;
          padding-right: 8px;
        }

        .profile-content::-webkit-scrollbar {
          width: 4px;
        }

        .profile-content::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 2px;
        }

        .profile-content::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 2px;
        }

        .profile-field {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .profile-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .field-label {
          font-size: 10px;
          font-weight: 500;
          text-transform: uppercase;
          color: var(--kinrelay-text-secondary, #4a4a4a);
        }

        .field-value {
          padding: 8px 0;
          border-bottom: 1px solid var(--kinrelay-border, #d1d5db);
          font-size: 14px;
          color: var(--kinrelay-text-primary, #1a1a1a);
        }

        .field-value--highlight {
          border-bottom-color: #dc2626;
        }

        .profile-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 24px;
          padding-bottom: 32px;
        }

        .save-btn {
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
        }

        @media (max-width: 480px) {
          .profile-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
