import { createHash, randomUUID } from "crypto";
import { mkdir, appendFile } from "fs/promises";
import path from "path";
import { BookingLeadPayload, BookingLeadRecord } from "@/lib/booking/types";

interface LeadPersistenceAdapter {
  save: (lead: BookingLeadRecord) => Promise<void>;
}

class JsonlLeadPersistenceAdapter implements LeadPersistenceAdapter {
  private readonly filePath: string;

  constructor() {
    this.filePath = path.join(process.cwd(), "apps/studio/.data/studio-leads.jsonl");
  }

  async save(lead: BookingLeadRecord): Promise<void> {
    await mkdir(path.dirname(this.filePath), { recursive: true });
    await appendFile(this.filePath, `${JSON.stringify(lead)}\n`, "utf8");
  }
}

const defaultAdapter = new JsonlLeadPersistenceAdapter();

export async function persistBookingLead(
  payload: BookingLeadPayload,
  ipAddress: string,
  userAgent: string
): Promise<BookingLeadRecord> {
  const lead: BookingLeadRecord = {
    ...payload,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    ipHash: createHash("sha256").update(ipAddress || "unknown").digest("hex").slice(0, 24),
    userAgent: userAgent || "unknown",
  };

  await defaultAdapter.save(lead);

  // TODO: Replace JSONL adapter with CRM or email integration:
  // - HubSpot / Zoho CRM
  // - transactional email alert to studio team
  // - central DB insertion
  return lead;
}
