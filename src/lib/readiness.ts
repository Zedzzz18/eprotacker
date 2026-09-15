const SCORE_MAP: Record<string, number> = {
  "not started": 0,
  draft: 10,
  "in progress": 50,
  "in review": 70,
  proposed: 40,
  tbd: 30,
  pending: 30,
  ready: 100,
  approved: 100,
  completed: 100,
  published: 100,
  signed: 100,
  active: 100,
};

export function areaScore(status: string | null | undefined): number {
  if (!status) return 0;
  return SCORE_MAP[status.toLowerCase()] ?? 50;
}

export const READINESS_AREAS = [
  { key: "partnerStatus", label: "Partner" },
  { key: "offerStatus", label: "Offer" },
  { key: "legalStatus", label: "Legal" },
  { key: "webStatus", label: "Web" },
  { key: "crmStatus", label: "CRM" },
  { key: "communicationStatus", label: "Communication" },
  { key: "documentationStatus", label: "Documentation" },
  { key: "trainingStatus", label: "Training" },
] as const;

export function countryReadiness(country: Record<string, unknown>) {
  const breakdown = READINESS_AREAS.map((a) => ({
    label: a.label,
    status: country[a.key] as string,
    score: areaScore(country[a.key] as string),
  }));
  const overall = Math.round(breakdown.reduce((sum, a) => sum + a.score, 0) / breakdown.length);
  return { overall, breakdown };
}
