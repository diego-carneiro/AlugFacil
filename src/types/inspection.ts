export type InspectionType = "check_in" | "check_out";

export interface Inspection {
  id: string;
  bookingId: string;
  consultoryId: string;
  createdById: string;
  createdByName: string;
  type: InspectionType;
  findingsJson: string;
  issueCount: number;
  photoKeys: string[];
  inspectedAt: string;
}
