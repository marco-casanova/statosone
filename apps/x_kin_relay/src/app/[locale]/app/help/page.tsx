"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { ChevronLeft, Menu } from "lucide-react";

type HelpSection = "disclaimer" | "first-aid" | "moving";

interface HelpContent {
  id: HelpSection;
  title: string;
  content: string;
}

const HELP_CONTENT: HelpContent[] = [
  {
    id: "disclaimer",
    title: "DESCARGA DE RESPONSABILIDAD",
    content: `No es intención del contenido sustituir consulta médica profesional, diagnóstico, o tratamiento. Siempre busque la consulta de un médico u otro profesional calificado para responder las preguntas que usted pueda tener con respecto a alguna condición o tratamiento de salud y nunca descuide o demore consejo médico.

Esta aplicación está diseñada únicamente como una herramienta de apoyo para el registro y seguimiento de actividades de cuidado. Las decisiones médicas deben ser tomadas siempre por profesionales de la salud cualificados.

El uso de esta aplicación no establece una relación médico-paciente. Los usuarios son responsables de verificar la precisión de la información ingresada y de consultar con profesionales de la salud ante cualquier duda o emergencia.`,
  },
  {
    id: "first-aid",
    title: "PRIMEROS AUXILIOS",
    content: `EMERGENCIAS GENERALES:
• En caso de emergencia, llame inmediatamente al 112 (Europa) o al número de emergencias local.
• Mantenga la calma y evalúe la situación antes de actuar.
• No mueva a la persona a menos que esté en peligro inmediato.

CAÍDAS:
• No intente levantar a la persona inmediatamente.
• Compruebe si hay lesiones visibles.
• Si hay dolor intenso, hinchazón o deformidad, no mueva a la persona y llame a emergencias.

ATRAGANTAMIENTO:
• Si la persona puede toser, anímela a seguir tosiendo.
• Si no puede respirar, aplique la maniobra de Heimlich.

CONVULSIONES:
• No intente sujetar a la persona.
• Retire objetos peligrosos del área.
• Coloque algo suave bajo la cabeza.
• Cronometrar la duración de la convulsión.`,
  },
  {
    id: "moving",
    title: "MOVER Y MANIPULAR",
    content: `PRINCIPIOS BÁSICOS:
• Evalúe siempre la situación antes de mover a una persona.
• Planifique el movimiento y comuníquelo claramente.
• Use equipo de ayuda cuando esté disponible (grúas, tablas de transferencia).

TÉCNICAS SEGURAS:
• Mantenga la espalda recta y doble las rodillas.
• Mantenga a la persona cerca de su cuerpo.
• Use sus piernas, no su espalda, para levantar.
• Evite movimientos de torsión.

TRANSFERENCIAS:
• De la cama a la silla: Asegúrese de que la silla esté bloqueada.
• Use una tabla de transferencia si es posible.
• Guíe el movimiento, no fuerce.

POSICIONAMIENTO EN CAMA:
• Cambie de posición cada 2 horas para prevenir úlceras por presión.
• Use almohadas para apoyo y comodidad.
• Asegúrese de que la ropa de cama esté lisa y sin arrugas.`,
  },
];

export default function HelpPage() {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split("/").filter(Boolean)[0] || "en";

  const [activeSection, setActiveSection] = useState<HelpSection>("disclaimer");

  const handleBack = () => {
    router.push(`/${locale}/app/home`);
  };

  const activeContent = HELP_CONTENT.find((c) => c.id === activeSection);

  return (
    <div className="help-page">
      {/* Header */}
      <header className="help-header">
        <button type="button" className="back-btn" onClick={handleBack}>
          <ChevronLeft size={24} />
        </button>
        <h1 className="help-title">TUTORIAL</h1>
        <button type="button" className="menu-btn">
          <Menu size={24} />
        </button>
      </header>

      {/* Navigation Tabs */}
      <nav className="help-nav">
        {HELP_CONTENT.map((section) => (
          <button
            key={section.id}
            className={`help-nav-item ${
              activeSection === section.id ? "active" : ""
            }`}
            onClick={() => setActiveSection(section.id)}
          >
            {section.title}
          </button>
        ))}
      </nav>

      {/* Content */}
      <div className="help-content">
        {activeContent && (
          <>
            <h2 className="content-title">{activeContent.title}</h2>
            <div className="content-body">
              {activeContent.content.split("\n\n").map((paragraph, idx) => (
                <p key={idx} className="content-paragraph">
                  {paragraph}
                </p>
              ))}
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .help-page {
          min-height: 100vh;
          background: #f5f5f5;
          display: flex;
          flex-direction: column;
        }

        .help-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          background: var(--kinrelay-bg-primary, #88b9b0);
        }

        .back-btn,
        .menu-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
          color: var(--kinrelay-text-primary, #1a1a1a);
        }

        .help-title {
          font-size: 16px;
          font-weight: 700;
          margin: 0;
          letter-spacing: 0.5px;
        }

        .help-nav {
          display: flex;
          flex-direction: column;
          gap: 0;
          padding: 16px;
          background: white;
          border-bottom: 1px solid #e5e7eb;
        }

        .help-nav-item {
          padding: 8px 0;
          background: none;
          border: none;
          text-align: left;
          font-size: 11px;
          font-weight: 500;
          color: var(--kinrelay-text-muted, #6b7280);
          cursor: pointer;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .help-nav-item.active {
          color: #dc2626;
          font-weight: 600;
        }

        .help-content {
          flex: 1;
          padding: 24px 16px;
          overflow-y: auto;
          max-width: 600px;
          margin: 0 auto;
          width: 100%;
        }

        .content-title {
          font-size: 14px;
          font-weight: 700;
          color: #dc2626;
          margin: 0 0 16px 0;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .content-body {
          font-size: 14px;
          line-height: 1.7;
          color: var(--kinrelay-text-primary, #1a1a1a);
        }

        .content-paragraph {
          margin: 0 0 16px 0;
          white-space: pre-line;
        }

        .content-paragraph:last-child {
          margin-bottom: 0;
        }

        /* Quick links styling */
        .help-content :global(a) {
          color: #dc2626;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
