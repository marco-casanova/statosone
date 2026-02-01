"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Card, Badge, useToast } from "@stratos/ui";
import {
  FileText,
  Download,
  CheckCircle,
  Clock,
  Eye,
  PenTool,
} from "lucide-react";
import { Sidebar, Header } from "@/components/dashboard";
import { signContract, getContractText } from "@/actions/contracts";
import type { KellerProfile, Contract } from "@/types";

interface ContractsPageProps {
  profile: KellerProfile;
  contracts: Contract[];
}

export function ContractsPage({ profile, contracts }: ContractsPageProps) {
  const toast = useToast();
  const [selectedContract, setSelectedContract] = useState<Contract | null>(
    null,
  );
  const [signing, setSigning] = useState(false);

  const isRenter = profile.user_type === "renter";

  async function handleSign(contractId: string) {
    setSigning(true);
    // In a real app, you'd collect a proper signature
    const signature = `${profile.full_name} - ${new Date().toISOString()}`;

    const result = await signContract(contractId, signature);
    setSigning(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Contract signed successfully!");
      // Refresh the page to show updated contract
      window.location.reload();
    }
  }

  async function handleDownload(contract: Contract) {
    const result = await getContractText(contract.id);

    if ("error" in result) {
      toast.error(result.error);
      return;
    }

    // Create and download text file
    const blob = new Blob([result.text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contract-${contract.id.slice(0, 8)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function getContractStatus(contract: Contract) {
    const isFullySigned =
      contract.renter_signature && contract.searcher_signature;
    const mySignature = isRenter
      ? contract.renter_signature
      : contract.searcher_signature;
    const otherSignature = isRenter
      ? contract.searcher_signature
      : contract.renter_signature;

    if (isFullySigned)
      return {
        status: "signed",
        label: "Fully Signed",
        variant: "success" as const,
      };
    if (mySignature && !otherSignature)
      return {
        status: "waiting",
        label: "Awaiting Other Party",
        variant: "warning" as const,
      };
    if (!mySignature && otherSignature)
      return {
        status: "action",
        label: "Your Signature Needed",
        variant: "danger" as const,
      };
    return {
      status: "pending",
      label: "Pending Signatures",
      variant: "default" as const,
    };
  }

  return (
    <>
      <Sidebar userType={profile.user_type} />

      <div style={styles.mainContent}>
        <Header
          title="My Contracts"
          subtitle="View and manage your rental agreements"
        />

        <main style={styles.main}>
          {contracts.length === 0 ? (
            <Card padding="lg" style={styles.emptyCard}>
              <FileText size={48} color="#9ca3af" />
              <h3 style={styles.emptyTitle}>No contracts yet</h3>
              <p style={styles.emptyText}>
                Contracts will appear here once you start a rental agreement.
              </p>
              <Link href={isRenter ? "/app/searchers" : "/app/browse"}>
                <Button>{isRenter ? "Find Renters" : "Browse Spaces"}</Button>
              </Link>
            </Card>
          ) : (
            <div style={styles.contractsGrid}>
              {contracts.map((contract) => {
                const { status, label, variant } = getContractStatus(contract);
                const needsMySignature =
                  status === "action" || status === "pending";

                return (
                  <Card
                    key={contract.id}
                    padding="lg"
                    style={styles.contractCard}
                  >
                    <div style={styles.contractHeader}>
                      <div style={styles.contractIcon}>
                        <FileText size={24} color="#6b7280" />
                      </div>
                      <Badge variant={variant}>{label}</Badge>
                    </div>

                    <h3 style={styles.contractTitle}>Rental Agreement</h3>
                    <p style={styles.contractId}>
                      Contract #KS-{contract.id.slice(0, 8).toUpperCase()}
                    </p>

                    <div style={styles.contractDetails}>
                      <div style={styles.detailRow}>
                        <span style={styles.detailLabel}>Property</span>
                        <span style={styles.detailValue}>
                          {contract.space_address}
                        </span>
                      </div>
                      <div style={styles.detailRow}>
                        <span style={styles.detailLabel}>Size</span>
                        <span style={styles.detailValue}>
                          {contract.size_m2} m²
                        </span>
                      </div>
                      <div style={styles.detailRow}>
                        <span style={styles.detailLabel}>Monthly Rent</span>
                        <span style={styles.detailValue}>
                          €{contract.monthly_price}
                        </span>
                      </div>
                      <div style={styles.detailRow}>
                        <span style={styles.detailLabel}>Period</span>
                        <span style={styles.detailValue}>
                          {new Date(contract.start_date).toLocaleDateString()} -{" "}
                          {new Date(contract.end_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div style={styles.signatures}>
                      <div style={styles.signatureItem}>
                        <span style={styles.signatureLabel}>Landlord</span>
                        <span style={styles.signatureName}>
                          {contract.renter_name}
                        </span>
                        {contract.renter_signature ? (
                          <Badge variant="success" size="sm">
                            <CheckCircle size={12} /> Signed
                          </Badge>
                        ) : (
                          <Badge variant="default" size="sm">
                            <Clock size={12} /> Pending
                          </Badge>
                        )}
                      </div>
                      <div style={styles.signatureItem}>
                        <span style={styles.signatureLabel}>Tenant</span>
                        <span style={styles.signatureName}>
                          {contract.searcher_name}
                        </span>
                        {contract.searcher_signature ? (
                          <Badge variant="success" size="sm">
                            <CheckCircle size={12} /> Signed
                          </Badge>
                        ) : (
                          <Badge variant="default" size="sm">
                            <Clock size={12} /> Pending
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div style={styles.contractActions}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedContract(contract)}
                      >
                        <Eye size={16} /> View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(contract)}
                      >
                        <Download size={16} /> Download
                      </Button>
                      {needsMySignature && (
                        <Button
                          size="sm"
                          onClick={() => handleSign(contract.id)}
                          loading={signing}
                        >
                          <PenTool size={16} /> Sign
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Contract Preview Modal */}
          {selectedContract && (
            <div style={styles.modal} onClick={() => setSelectedContract(null)}>
              <div
                style={styles.modalContent}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={styles.modalHeader}>
                  <h2 style={styles.modalTitle}>Contract Preview</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedContract(null)}
                  >
                    ✕
                  </Button>
                </div>
                <pre style={styles.contractPreview}>
                  {selectedContract.terms}
                </pre>
                <div style={styles.modalActions}>
                  <Button
                    variant="outline"
                    onClick={() => handleDownload(selectedContract)}
                  >
                    <Download size={18} /> Download
                  </Button>
                  <Button onClick={() => setSelectedContract(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
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
    maxWidth: "1400px",
  },
  emptyCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    gap: "1rem",
    padding: "3rem",
  },
  emptyTitle: {
    fontSize: "1.125rem",
    fontWeight: 600,
    color: "#111827",
    margin: 0,
  },
  emptyText: {
    fontSize: "0.875rem",
    color: "#6b7280",
    maxWidth: "300px",
    margin: 0,
  },
  contractsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
    gap: "1.5rem",
  },
  contractCard: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  contractHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  contractIcon: {
    padding: "0.5rem",
    backgroundColor: "#f3f4f6",
    borderRadius: "8px",
  },
  contractTitle: {
    fontSize: "1.125rem",
    fontWeight: 600,
    color: "#111827",
    margin: 0,
  },
  contractId: {
    fontSize: "0.8rem",
    color: "#6b7280",
    margin: 0,
    fontFamily: "monospace",
  },
  contractDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    padding: "1rem",
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
  },
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.875rem",
  },
  detailLabel: {
    color: "#6b7280",
  },
  detailValue: {
    color: "#111827",
    fontWeight: 500,
  },
  signatures: {
    display: "flex",
    gap: "1rem",
  },
  signatureItem: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
    padding: "0.75rem",
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
  },
  signatureLabel: {
    fontSize: "0.7rem",
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  signatureName: {
    fontSize: "0.875rem",
    fontWeight: 500,
    color: "#111827",
  },
  contractActions: {
    display: "flex",
    gap: "0.5rem",
    paddingTop: "1rem",
    borderTop: "1px solid #e5e7eb",
  },
  modal: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "1.5rem",
    maxWidth: "800px",
    width: "90%",
    maxHeight: "90vh",
    overflow: "auto",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
  },
  modalTitle: {
    fontSize: "1.25rem",
    fontWeight: 600,
    color: "#111827",
    margin: 0,
  },
  contractPreview: {
    backgroundColor: "#f9fafb",
    padding: "1rem",
    borderRadius: "8px",
    fontSize: "0.75rem",
    lineHeight: 1.6,
    whiteSpace: "pre-wrap",
    fontFamily: "monospace",
    maxHeight: "400px",
    overflow: "auto",
    margin: 0,
  },
  modalActions: {
    display: "flex",
    gap: "0.75rem",
    justifyContent: "flex-end",
    marginTop: "1rem",
    paddingTop: "1rem",
    borderTop: "1px solid #e5e7eb",
  },
};
