"use server";

import { createServerClient, getUser, getProfile } from "@/lib/supabase/server";
import type { Contract, Rental, Space, KellerProfile } from "@/types";

/**
 * Generate a rental contract
 */
export async function generateContract(rentalId: string) {
  const user = await getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const supabase = await createServerClient();

  // Get rental with all related data
  const { data: rental, error: rentalError } = await supabase
    .from("rentals")
    .select(
      `
      *,
      space:spaces(*),
      renter:keller_profiles!renter_id(*),
      searcher:keller_profiles!searcher_id(*)
    `,
    )
    .eq("id", rentalId)
    .single();

  if (rentalError || !rental) {
    return { error: "Rental not found" };
  }

  // Check if user is part of this rental
  if (rental.renter_id !== user.id && rental.searcher_id !== user.id) {
    return { error: "Unauthorized" };
  }

  // Generate contract content
  const contractContent = generateContractContent(
    rental as Rental & {
      space: Space;
      renter: KellerProfile;
      searcher: KellerProfile;
    },
  );

  // Create contract record
  const { data: contract, error: contractError } = await supabase
    .from("contracts")
    .insert({
      rental_id: rentalId,
      renter_name: rental.renter.full_name,
      searcher_name: rental.searcher.full_name,
      space_address: `${rental.space.address}, ${rental.space.postal_code} ${rental.space.city}`,
      space_description: rental.space.description,
      size_m2: rental.space.size_m2,
      monthly_price: rental.monthly_price,
      start_date: rental.start_date,
      end_date: rental.end_date,
      terms: contractContent,
    })
    .select()
    .single();

  if (contractError) {
    console.error("Error creating contract:", contractError);
    return { error: "Failed to create contract" };
  }

  return { contract };
}

/**
 * Sign a contract
 */
export async function signContract(contractId: string, signature: string) {
  const user = await getUser();
  const profile = await getProfile();

  if (!user || !profile) {
    return { error: "Unauthorized" };
  }

  const supabase = await createServerClient();

  // Get contract
  const { data: contract, error: contractError } = await supabase
    .from("contracts")
    .select("*, rental:rentals(*)")
    .eq("id", contractId)
    .single();

  if (contractError || !contract) {
    return { error: "Contract not found" };
  }

  // Determine if user is renter or searcher
  const isRenter = contract.rental.renter_id === user.id;
  const isSearcher = contract.rental.searcher_id === user.id;

  if (!isRenter && !isSearcher) {
    return { error: "Unauthorized" };
  }

  // Update contract with signature
  const updates: Record<string, string> = {};

  if (isRenter) {
    updates.renter_signature = signature;
    updates.renter_signed_at = new Date().toISOString();
  } else {
    updates.searcher_signature = signature;
    updates.searcher_signed_at = new Date().toISOString();
  }

  const { data: updatedContract, error: updateError } = await supabase
    .from("contracts")
    .update(updates)
    .eq("id", contractId)
    .select()
    .single();

  if (updateError) {
    console.error("Error signing contract:", updateError);
    return { error: "Failed to sign contract" };
  }

  return { contract: updatedContract };
}

/**
 * Get contract by rental ID
 */
export async function getContractByRental(
  rentalId: string,
): Promise<Contract | null> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("contracts")
    .select("*")
    .eq("rental_id", rentalId)
    .single();

  if (error) {
    console.error("Error fetching contract:", error);
    return null;
  }

  return data;
}

/**
 * Get all contracts for current user
 */
export async function getMyContracts(): Promise<Contract[]> {
  const user = await getUser();

  if (!user) {
    return [];
  }

  const supabase = await createServerClient();

  // Get rentals where user is either renter or searcher
  const { data: rentals, error: rentalsError } = await supabase
    .from("rentals")
    .select("id")
    .or(`renter_id.eq.${user.id},searcher_id.eq.${user.id}`);

  if (rentalsError || !rentals?.length) {
    return [];
  }

  const rentalIds = rentals.map((r) => r.id);

  const { data: contracts, error: contractsError } = await supabase
    .from("contracts")
    .select("*")
    .in("rental_id", rentalIds)
    .order("created_at", { ascending: false });

  if (contractsError) {
    console.error("Error fetching contracts:", contractsError);
    return [];
  }

  return contracts || [];
}

/**
 * Generate contract content
 */
function generateContractContent(
  rental: Rental & {
    space: Space;
    renter: KellerProfile;
    searcher: KellerProfile;
  },
): string {
  const startDate = new Date(rental.start_date).toLocaleDateString("de-DE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const endDate = new Date(rental.end_date).toLocaleDateString("de-DE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `
MIETVERTRAG FÜR LAGERRAUM / STORAGE SPACE RENTAL AGREEMENT

Vertragsnummer / Contract Number: KS-${rental.id.slice(0, 8).toUpperCase()}
Erstellungsdatum / Date Created: ${new Date().toLocaleDateString("de-DE")}

═══════════════════════════════════════════════════════════════

VERTRAGSPARTEIEN / CONTRACTING PARTIES

VERMIETER / LANDLORD:
Name: ${rental.renter.full_name}
(nachfolgend „Vermieter" genannt / hereinafter referred to as "Landlord")

MIETER / TENANT:
Name: ${rental.searcher.full_name}
(nachfolgend „Mieter" genannt / hereinafter referred to as "Tenant")

═══════════════════════════════════════════════════════════════

MIETOBJEKT / RENTAL PROPERTY

Adresse / Address: ${rental.space.address}
                   ${rental.space.postal_code} ${rental.space.city}

Art des Raumes / Type of Space: ${rental.space.type}
Größe / Size: ${rental.space.size_m2} m²

Beschreibung / Description:
${rental.space.description}

Ausstattung / Amenities:
${rental.space.amenities?.join(", ") || "Keine speziellen Ausstattungen / No special amenities"}

═══════════════════════════════════════════════════════════════

MIETDAUER / RENTAL PERIOD

Beginn / Start Date: ${startDate}
Ende / End Date: ${endDate}

═══════════════════════════════════════════════════════════════

MIETZINS / RENTAL FEE

Monatliche Miete / Monthly Rent: €${rental.monthly_price.toFixed(2)}
Preis pro m² / Price per m²: €${rental.space.price_per_m2.toFixed(2)}

Die Miete ist jeweils zum 1. eines jeden Monats fällig.
Rent is due on the 1st of each month.

═══════════════════════════════════════════════════════════════

ALLGEMEINE BEDINGUNGEN / GENERAL TERMS AND CONDITIONS

1. NUTZUNG / USE
Der Mieter darf den Raum ausschließlich zur Lagerung von Gegenständen nutzen.
The Tenant may use the space exclusively for storage purposes.

Folgende Gegenstände dürfen NICHT gelagert werden:
The following items may NOT be stored:
- Gefährliche Stoffe / Hazardous materials
- Verderbliche Waren / Perishable goods
- Illegale Gegenstände / Illegal items
- Lebende Tiere / Live animals
- Explosivstoffe / Explosives

2. ZUGANG / ACCESS
Der Mieter hat Zugang zum Mietobjekt während der vereinbarten Zeiten.
The Tenant has access to the rental property during agreed hours.

3. HAFTUNG / LIABILITY
Der Vermieter haftet nicht für Verlust oder Beschädigung der gelagerten Gegenstände,
es sei denn, dies ist auf grobe Fahrlässigkeit oder Vorsatz zurückzuführen.
The Landlord is not liable for loss or damage to stored items unless caused by 
gross negligence or intent.

4. KÜNDIGUNG / TERMINATION
Beide Parteien können den Vertrag mit einer Frist von 30 Tagen kündigen.
Either party may terminate the contract with 30 days notice.

5. SCHLÜSSEL/ZUGANG / KEYS/ACCESS
Der Mieter erhält Zugang zum Mietobjekt. Verlorene Schlüssel sind dem Vermieter 
unverzüglich zu melden.
The Tenant receives access to the property. Lost keys must be reported immediately.

═══════════════════════════════════════════════════════════════

ZAHLUNGSBEDINGUNGEN / PAYMENT TERMS

Die Zahlung erfolgt über die KellerSharer-Plattform mittels sicherer Überweisung.
Payment is processed through the KellerSharer platform via secure transfer.

═══════════════════════════════════════════════════════════════

UNTERSCHRIFTEN / SIGNATURES

Mit ihrer Unterschrift bestätigen beide Parteien, die oben genannten Bedingungen 
gelesen, verstanden und akzeptiert zu haben.

By signing, both parties confirm that they have read, understood, and accepted 
the above terms and conditions.


VERMIETER / LANDLORD:
Name: ${rental.renter.full_name}
Datum / Date: _________________
Unterschrift / Signature: _________________


MIETER / TENANT:
Name: ${rental.searcher.full_name}
Datum / Date: _________________
Unterschrift / Signature: _________________


═══════════════════════════════════════════════════════════════

Dieser Vertrag wurde über KellerSharer erstellt.
This contract was generated through KellerSharer.

Bei Fragen oder Streitigkeiten wenden Sie sich bitte an: support@kellersharer.com
For questions or disputes, please contact: support@kellersharer.com
`.trim();
}

/**
 * Download contract as text (placeholder for PDF generation)
 */
export async function getContractText(
  contractId: string,
): Promise<{ text: string } | { error: string }> {
  const user = await getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const supabase = await createServerClient();

  const { data: contract, error } = await supabase
    .from("contracts")
    .select("*")
    .eq("id", contractId)
    .single();

  if (error || !contract) {
    return { error: "Contract not found" };
  }

  return { text: contract.terms };
}
