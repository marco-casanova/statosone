"use client";

import { useState, useEffect } from "react";
import { X, ArrowRight, Check } from "lucide-react";
import styles from "./ProjectBriefModal.module.css";

interface ProjectBriefModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCalendly?: () => void;
}

interface FormData {
  projectDescription: string;
  projectStage: string;
  areasOfHelp: string[];
  targetPlatforms: string[];
  budgetRange: string;
  timeline: string;
  name: string;
  email: string;
  companyOrLink: string;
}

export function ProjectBriefModal({
  isOpen,
  onClose,
  onOpenCalendly,
}: ProjectBriefModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    projectDescription: "",
    projectStage: "",
    areasOfHelp: [],
    targetPlatforms: [],
    budgetRange: "",
    timeline: "",
    name: "",
    email: "",
    companyOrLink: "",
  });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (
    field: "areasOfHelp" | "targetPlatforms",
    value: string,
  ) => {
    setFormData((prev) => {
      const current = prev[field];
      const updated = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];
      return { ...prev, [field]: updated };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Replace with actual API endpoint
      const response = await fetch("/api/project-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsSuccess(true);
      } else {
        console.error("Submission failed");
        alert("Something went wrong. Please try again or email us directly.");
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("Something went wrong. Please try again or email us directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    setIsSuccess(false);
    setFormData({
      projectDescription: "",
      projectStage: "",
      areasOfHelp: [],
      targetPlatforms: [],
      budgetRange: "",
      timeline: "",
      name: "",
      email: "",
      companyOrLink: "",
    });
    onClose();
  };

  const handleBookCall = () => {
    handleSuccessClose();
    if (onOpenCalendly) {
      onOpenCalendly();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {isSuccess ? (
          <div className={styles.successState}>
            <div className={styles.successIcon}>
              <Check size={32} />
            </div>
            <h2 className={styles.successTitle}>
              Thanks for sharing your project!
            </h2>
            <p className={styles.successMessage}>
              I'll review your brief and get back to you within 24 hours with
              initial scope thoughts and next steps.
            </p>
            <div className={styles.successActions}>
              <button
                onClick={handleSuccessClose}
                className={styles.primaryButton}
              >
                Done
              </button>
              {onOpenCalendly && (
                <button
                  onClick={handleBookCall}
                  className={styles.secondaryButton}
                >
                  Want to speed this up? Book a 30-min call
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className={styles.header}>
              <h2 className={styles.title}>Tell us about your project</h2>
              <p className={styles.subtitle}>
                Answer a few questions so we can scope your MVP and give you a
                realistic estimate.
              </p>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              {/* Project Description */}
              <div className={styles.formGroup}>
                <label htmlFor="projectDescription" className={styles.label}>
                  What are you building?{" "}
                  <span className={styles.required}>*</span>
                </label>
                <textarea
                  id="projectDescription"
                  name="projectDescription"
                  value={formData.projectDescription}
                  onChange={handleInputChange}
                  className={styles.textarea}
                  rows={5}
                  required
                  placeholder="Brief description of your product or idea..."
                />
              </div>

              {/* Project Stage */}
              <div className={styles.formGroup}>
                <label htmlFor="projectStage" className={styles.label}>
                  Project stage <span className={styles.required}>*</span>
                </label>
                <select
                  id="projectStage"
                  name="projectStage"
                  value={formData.projectStage}
                  onChange={handleInputChange}
                  className={styles.select}
                  required
                >
                  <option value="">Select stage</option>
                  <option value="idea">Idea</option>
                  <option value="early-mvp">Early MVP</option>
                  <option value="existing-product">Existing product</option>
                  <option value="scaling">Scaling</option>
                </select>
              </div>

              {/* Areas of Help */}
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Areas of help <span className={styles.required}>*</span>
                </label>
                <div className={styles.checkboxGroup}>
                  {[
                    "Product & UX",
                    "Frontend",
                    "Backend / APIs",
                    "AI / ML",
                    "Infrastructure",
                    "End-to-end delivery",
                  ].map((area) => (
                    <label key={area} className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={formData.areasOfHelp.includes(area)}
                        onChange={() =>
                          handleCheckboxChange("areasOfHelp", area)
                        }
                        className={styles.checkbox}
                      />
                      <span>{area}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Target Platforms */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Target platforms</label>
                <div className={styles.checkboxGroup}>
                  {["Web", "Mobile", "Admin / internal tool"].map(
                    (platform) => (
                      <label key={platform} className={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={formData.targetPlatforms.includes(platform)}
                          onChange={() =>
                            handleCheckboxChange("targetPlatforms", platform)
                          }
                          className={styles.checkbox}
                        />
                        <span>{platform}</span>
                      </label>
                    ),
                  )}
                </div>
              </div>

              <div className={styles.formRow}>
                {/* Budget Range */}
                <div className={styles.formGroup}>
                  <label htmlFor="budgetRange" className={styles.label}>
                    Budget range
                  </label>
                  <select
                    id="budgetRange"
                    name="budgetRange"
                    value={formData.budgetRange}
                    onChange={handleInputChange}
                    className={styles.select}
                  >
                    <option value="">Select budget</option>
                    <option value="under-5k">{"< €5k"}</option>
                    <option value="5k-15k">€5k–€15k</option>
                    <option value="15k-30k">€15k–€30k</option>
                    <option value="30k-plus">€30k+</option>
                  </select>
                </div>

                {/* Timeline */}
                <div className={styles.formGroup}>
                  <label htmlFor="timeline" className={styles.label}>
                    Timeline / urgency
                  </label>
                  <select
                    id="timeline"
                    name="timeline"
                    value={formData.timeline}
                    onChange={handleInputChange}
                    className={styles.select}
                  >
                    <option value="">Select timeline</option>
                    <option value="asap">ASAP</option>
                    <option value="1-2-months">1–2 months</option>
                    <option value="exploring">Just exploring</option>
                  </select>
                </div>
              </div>

              {/* Contact Information */}
              <div className={styles.divider}></div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="name" className={styles.label}>
                    Your name <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={styles.input}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.label}>
                    Email <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={styles.input}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="companyOrLink" className={styles.label}>
                  Company or product link
                </label>
                <input
                  type="text"
                  id="companyOrLink"
                  name="companyOrLink"
                  value={formData.companyOrLink}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="https://..."
                />
              </div>

              <button
                type="submit"
                className={styles.submitButton}
                disabled={isSubmitting || formData.areasOfHelp.length === 0}
              >
                {isSubmitting ? (
                  "Submitting..."
                ) : (
                  <>
                    Submit project brief
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
