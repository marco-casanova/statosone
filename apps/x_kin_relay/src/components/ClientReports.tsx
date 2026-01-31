"use client";

import React, { useState, useEffect } from "react";
import {
  Client,
  TaskWithDetails,
  MedicationAdministrationWithDetails,
  Incident,
  DailyReport,
} from "@/types/kinrelay";

interface ClientReportsProps {
  clientId: string;
  userRole: "family" | "specialist" | "nurse" | "caregiver";
}

export default function ClientReports({
  clientId,
  userRole,
}: ClientReportsProps) {
  const [client, setClient] = useState<Client | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [tasks, setTasks] = useState<TaskWithDetails[]>([]);
  const [medications, setMedications] = useState<
    MedicationAdministrationWithDetails[]
  >([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, [clientId, selectedDate]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      // Fetch client info
      const clientRes = await fetch(`/api/clients?id=${clientId}`);
      const clientData = await clientRes.json();
      if (clientData.success) setClient(clientData.data);

      // Fetch tasks for the day
      const tasksRes = await fetch(
        `/api/tasks?client_id=${clientId}&date=${selectedDate}`,
      );
      const tasksData = await tasksRes.json();
      if (tasksData.success) setTasks(tasksData.data);

      // Fetch medication administrations
      const medsRes = await fetch(
        `/api/medication-administrations?client_id=${clientId}&date=${selectedDate}`,
      );
      const medsData = await medsRes.json();
      if (medsData.success) setMedications(medsData.data);

      // Fetch incidents
      const incidentsRes = await fetch(
        `/api/incidents?client_id=${clientId}&date=${selectedDate}`,
      );
      const incidentsData = await incidentsRes.json();
      if (incidentsData.success) setIncidents(incidentsData.data);
    } catch (error) {
      console.error("Failed to fetch report data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const completedTasks = tasks.filter((t) => t.status === "completed").length;
    const totalTasks = tasks.length;
    const taskCompletionRate =
      totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    const medicationsTaken = medications.filter((m) => m.was_taken).length;
    const totalMedications = medications.length;
    const medicationComplianceRate =
      totalMedications > 0 ? (medicationsTaken / totalMedications) * 100 : 0;

    return {
      completedTasks,
      totalTasks,
      taskCompletionRate,
      medicationsTaken,
      totalMedications,
      medicationComplianceRate,
      totalIncidents: incidents.length,
    };
  };

  const stats = calculateStats();
  const isFamily = userRole === "family";

  if (loading) {
    return <div className="loading">Cargando reporte...</div>;
  }

  return (
    <div className="client-reports">
      <div className="report-header">
        <div className="client-info">
          {client && (
            <>
              <h2>{client.full_name}</h2>
              <p className="client-subtitle">Reporte Diario de Cuidado</p>
            </>
          )}
        </div>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="date-picker"
        />
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">
            {stats.completedTasks}/{stats.totalTasks}
          </div>
          <div className="stat-label">Tareas Completadas</div>
          <div className="stat-progress">
            <div
              className="stat-progress-bar"
              style={{
                width: `${stats.taskCompletionRate}%`,
                background: "#4CAF50",
              }}
            />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-value">
            {stats.medicationsTaken}/{stats.totalMedications}
          </div>
          <div className="stat-label">Medicamentos Administrados</div>
          <div className="stat-progress">
            <div
              className="stat-progress-bar"
              style={{
                width: `${stats.medicationComplianceRate}%`,
                background: "#2196F3",
              }}
            />
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-value"
            style={{ color: stats.totalIncidents > 0 ? "#F44336" : "#4CAF50" }}
          >
            {stats.totalIncidents}
          </div>
          <div className="stat-label">Incidentes Reportados</div>
        </div>
      </div>

      <div className="report-sections">
        <section className="report-section">
          <h3>Tareas del Día</h3>
          {tasks.length === 0 ? (
            <p className="empty-message">
              No hay tareas registradas para este día.
            </p>
          ) : (
            <div className="task-list">
              {tasks.map((task) => (
                <div key={task.id} className="task-item">
                  <div className="task-status">
                    {task.status === "completed" ? "✅" : "⏳"}
                  </div>
                  <div className="task-details">
                    <div className="task-category">
                      {task.category?.name_es}
                    </div>
                    {task.subcategory && (
                      <div className="task-subcategory">
                        {task.subcategory.name_es}
                      </div>
                    )}
                    {task.description && (
                      <div className="task-description">{task.description}</div>
                    )}
                    {task.completed_time && (
                      <div className="task-time">
                        Completado:{" "}
                        {new Date(task.completed_time).toLocaleTimeString("es")}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="report-section">
          <h3>Administración de Medicamentos</h3>
          {medications.length === 0 ? (
            <p className="empty-message">
              No hay medicamentos registrados para este día.
            </p>
          ) : (
            <div className="medication-list">
              {medications.map((med) => (
                <div key={med.id} className="medication-item">
                  <div className="medication-status">
                    {med.was_taken ? "✅" : med.was_refused ? "❌" : "⏳"}
                  </div>
                  <div className="medication-details">
                    <div className="medication-name">
                      {med.medication?.name}
                    </div>
                    <div className="medication-dosage">
                      Dosis: {med.dosage_given || med.medication?.dosage}
                    </div>
                    {med.actual_time && (
                      <div className="medication-time">
                        Administrado:{" "}
                        {new Date(med.actual_time).toLocaleTimeString("es")}
                      </div>
                    )}
                    {med.refusal_reason && (
                      <div className="refusal-reason">
                        Motivo de rechazo: {med.refusal_reason}
                      </div>
                    )}
                    {med.side_effects_observed && (
                      <div className="side-effects">
                        Efectos secundarios: {med.side_effects_observed}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {incidents.length > 0 && (
          <section className="report-section incidents">
            <h3>Incidentes</h3>
            <div className="incident-list">
              {incidents.map((incident) => (
                <div key={incident.id} className="incident-item">
                  <div className={`incident-severity ${incident.severity}`}>
                    {incident.severity.toUpperCase()}
                  </div>
                  <div className="incident-details">
                    <div className="incident-type">
                      {incident.incident_type}
                    </div>
                    <div className="incident-description">
                      {incident.description}
                    </div>
                    <div className="incident-time">
                      {new Date(incident.incident_date).toLocaleString("es")}
                    </div>
                    {incident.immediate_action_taken && (
                      <div className="incident-action">
                        Acción tomada: {incident.immediate_action_taken}
                      </div>
                    )}
                    {incident.family_notified && (
                      <div className="incident-notification">
                        ✅ Familia notificada
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {isFamily && (
        <div className="report-actions">
          <button className="btn-download">Descargar Reporte PDF</button>
          <button className="btn-email">Enviar por Email</button>
        </div>
      )}

      <style jsx>{`
        .client-reports {
          max-width: 900px;
          margin: 0 auto;
          padding: 20px;
          background: #f5f5f5;
          min-height: 100vh;
        }

        .loading {
          text-align: center;
          padding: 40px;
          font-size: 18px;
        }

        .report-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          background: white;
          padding: 20px;
          border-radius: 8px;
        }

        .client-info h2 {
          margin: 0 0 5px 0;
          font-size: 24px;
        }

        .client-subtitle {
          margin: 0;
          color: #666;
          font-size: 14px;
        }

        .date-picker {
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 14px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 15px;
          margin-bottom: 30px;
        }

        .stat-card {
          background: white;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
        }

        .stat-value {
          font-size: 32px;
          font-weight: bold;
          color: #333;
          margin-bottom: 5px;
        }

        .stat-label {
          font-size: 14px;
          color: #666;
          margin-bottom: 10px;
        }

        .stat-progress {
          height: 8px;
          background: #e0e0e0;
          border-radius: 4px;
          overflow: hidden;
        }

        .stat-progress-bar {
          height: 100%;
          transition: width 0.3s;
        }

        .report-sections {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .report-section {
          background: white;
          padding: 20px;
          border-radius: 8px;
        }

        .report-section.incidents {
          border-left: 4px solid #f44336;
        }

        .report-section h3 {
          margin: 0 0 15px 0;
          font-size: 18px;
          color: #333;
        }

        .empty-message {
          color: #999;
          text-align: center;
          padding: 20px;
        }

        .task-list,
        .medication-list,
        .incident-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .task-item,
        .medication-item,
        .incident-item {
          display: flex;
          gap: 12px;
          padding: 12px;
          background: #f9f9f9;
          border-radius: 4px;
        }

        .task-status,
        .medication-status {
          font-size: 24px;
        }

        .task-details,
        .medication-details,
        .incident-details {
          flex: 1;
        }

        .task-category,
        .medication-name,
        .incident-type {
          font-weight: 600;
          margin-bottom: 4px;
        }

        .task-subcategory,
        .medication-dosage,
        .task-time,
        .medication-time,
        .incident-time {
          font-size: 13px;
          color: #666;
          margin-bottom: 4px;
        }

        .task-description,
        .incident-description {
          font-size: 14px;
          margin-top: 8px;
        }

        .refusal-reason,
        .side-effects,
        .incident-action {
          font-size: 13px;
          margin-top: 8px;
          padding: 8px;
          background: #fff3cd;
          border-radius: 4px;
        }

        .incident-severity {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: bold;
          align-self: flex-start;
        }

        .incident-severity.low {
          background: #e8f5e9;
          color: #2e7d32;
        }

        .incident-severity.medium {
          background: #fff3e0;
          color: #e65100;
        }

        .incident-severity.high {
          background: #ffebee;
          color: #c62828;
        }

        .incident-severity.critical {
          background: #b71c1c;
          color: white;
        }

        .incident-notification {
          margin-top: 8px;
          color: #4caf50;
          font-size: 13px;
        }

        .report-actions {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }

        .btn-download,
        .btn-email {
          flex: 1;
          padding: 12px;
          border: none;
          border-radius: 25px;
          font-weight: 500;
          cursor: pointer;
        }

        .btn-download {
          background: #ffd54f;
          color: #333;
        }

        .btn-download:hover {
          background: #ffc107;
        }

        .btn-email {
          background: #2196f3;
          color: white;
        }

        .btn-email:hover {
          background: #1976d2;
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
