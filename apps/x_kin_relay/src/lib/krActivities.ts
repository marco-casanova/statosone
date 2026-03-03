import type { SupabaseClient } from "@supabase/supabase-js";

type KrActivityInsertPayload = Record<string, any>;

const KR_ACTIVITIES_TABLE = "kr_activities";

export function extractMissingKrActivitiesColumn(
  message: string | undefined,
): string | null {
  if (!message) {
    return null;
  }

  const schemaCacheMatch = message.match(
    /Could not find the '([^']+)' column of 'kr_activities' in the schema cache/i,
  );
  if (schemaCacheMatch) {
    return schemaCacheMatch[1];
  }

  const relationMatch = message.match(
    /column "?([a-zA-Z0-9_]+)"? of relation "?kr_activities"? does not exist/i,
  );
  if (relationMatch) {
    return relationMatch[1];
  }

  const genericMatch = message.match(/column "?([a-zA-Z0-9_]+)"? does not exist/i);
  if (genericMatch) {
    return genericMatch[1];
  }

  return null;
}

function moveColumnToDetails(
  payload: KrActivityInsertPayload,
  column: string,
  value: unknown,
) {
  const next = { ...payload };
  delete next[column];

  if (value == null) {
    return next;
  }

  const details =
    next.details && typeof next.details === "object" && !Array.isArray(next.details)
      ? { ...next.details }
      : {};

  if (details.activity_subtype == null && typeof value === "string") {
    details.activity_subtype = value;
  }
  if (details[column] == null) {
    details[column] = value;
  }

  next.details = details;
  return next;
}

export function adaptKrActivitiesPayloadForMissingColumn(
  payload: KrActivityInsertPayload,
  missingColumn: string,
) {
  if (!(missingColumn in payload)) {
    return null;
  }

  const value = payload[missingColumn];

  if (missingColumn === "subtype_observation") {
    const next = { ...payload };
    delete next.subtype_observation;
    if (value != null) {
      next.subtype_health = value;
    }
    return next;
  }

  if (missingColumn.startsWith("subtype_")) {
    return moveColumnToDetails(payload, missingColumn, value);
  }

  if (missingColumn === "created_by" || missingColumn === "caregiver_id") {
    const next = { ...payload };
    delete next[missingColumn];
    return next;
  }

  if (missingColumn === "recorded_by") {
    return moveColumnToDetails(payload, missingColumn, value);
  }

  if (missingColumn === "details") {
    const next = { ...payload };
    delete next.details;
    if (next.value == null && value != null) {
      next.value = value;
    }
    return next;
  }

  return null;
}

export async function insertKrActivity(
  supabase: SupabaseClient,
  payload: KrActivityInsertPayload,
) {
  let nextPayload = { ...payload };
  const seenPayloads = new Set<string>();
  let lastError: { message?: string } | null = null;

  for (let attempt = 0; attempt < 6; attempt += 1) {
    const payloadKey = JSON.stringify(nextPayload);
    if (seenPayloads.has(payloadKey)) {
      break;
    }
    seenPayloads.add(payloadKey);

    const { error } = await supabase.from(KR_ACTIVITIES_TABLE).insert(nextPayload);
    if (!error) {
      return { error: null };
    }
    lastError = error;

    const missingColumn = extractMissingKrActivitiesColumn(error.message);
    if (!missingColumn) {
      return { error };
    }

    const adaptedPayload = adaptKrActivitiesPayloadForMissingColumn(
      nextPayload,
      missingColumn,
    );
    if (!adaptedPayload) {
      return { error };
    }

    nextPayload = adaptedPayload;
  }

  return { error: lastError };
}
