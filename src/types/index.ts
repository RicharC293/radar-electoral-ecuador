export type PollStatus = "draft" | "live" | "paused" | "closed" | "archived";
export type ElectionType = "presidencia" | "prefectura" | "alcaldia";
export type VoteSentiment = "positive" | "negative";

/**
 * Poll document — lives at `polls/{pollId}`.
 * Stats are embedded directly (no separate `stats/current` subcollection).
 */
export interface Poll {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  electionType: ElectionType;
  province: string | null;
  status: PollStatus;
  isPublic: boolean;
  startsAt: Date | null;
  endsAt: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  allowNegativeVote: boolean;
  /* ── Embedded stats ── */
  totalVotes: number;
  totalVotersToday: number;
  uniqueProvinces: number;
  lastVoteCity: string | null;
  lastVoteAt: Date | null;
  lastVoteCandidateId: string | null;
}

/**
 * Candidate document — lives at `polls/{pollId}/candidates/{candidateId}`.
 * Vote data is embedded directly (no separate `voteCounts` subcollection).
 */
export interface Candidate {
  id: string;
  fullName: string;
  party: string;
  photoUrl: string;
  color: string;
  sortOrder: number;
  biography: string;
  isActive: boolean;
  createdAt: Date | null;
  /* ── Embedded vote data ── */
  totalVotes: number;
  percentage: number;
  positiveVotes: number;
  negativeVotes: number;
  positivePercentage: number;
  negativePercentage: number;
  lastVoteAt: Date | null;
}

export interface CandidateRequest {
  id: string;
  pollId: string | null;
  requesterName: string;
  requesterContact: string;
  candidateName: string;
  candidateParty: string;
  notes: string;
  status: "pending" | "approved" | "rejected";
  createdAt: Date | null;
}

export interface RegisterVoteInput {
  pollId: string;
  candidateId: string;
  sentiment: VoteSentiment;
  fingerprint: string;
  city?: string | null;
  province?: string | null;
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface RegisterVoteResult {
  success: true;
  totalVotes: number;
  candidateTotal: number;
  isUpdate?: boolean;
}
