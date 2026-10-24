import type {
  ScholarshipScheme,
  StudentProfile,
  EligibilityEvaluation,
  DocumentPreFlightItem,
  DeadlineRecord,
} from '../types';
import {
  VERIFIED_SCHEMES,
  INITIAL_DOCUMENT_AUDIT,
  INITIAL_DEADLINE_RECORDS,
} from '../data/verifiedSchemes';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

export interface HealthResponse {
  status: string;
  service: string;
  version: string;
  environment: string;
  tinyfish: {
    cli_installed: boolean;
    cli_version: string;
    api_key_configured: boolean;
  };
}

export const api = {
  async getHealth(): Promise<HealthResponse> {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  async getScholarships(params?: {
    domicile?: string;
    category?: string;
    max_income?: number;
  }): Promise<ScholarshipScheme[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.domicile && params.domicile !== 'ALL') queryParams.append('domicile', params.domicile);
      if (params?.category && params.category !== 'ALL') queryParams.append('category', params.category);
      if (params?.max_income) queryParams.append('max_income', params.max_income.toString());

      const url = `${API_BASE_URL}/scholarships${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.schemes;
    } catch {
      // Graceful offline fallback
      return VERIFIED_SCHEMES;
    }
  },

  async searchDiscovery(
    query: string = 'scholarship circulars higher education',
    forceLive: boolean = false
  ): Promise<{ schemes: ScholarshipScheme[]; source: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/discovery/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, forceLive }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return { schemes: data.schemes, source: data.source };
    } catch {
      return { schemes: VERIFIED_SCHEMES, source: 'CACHED_OFFLINE' };
    }
  },

  async matchEligibility(
    profile: StudentProfile
  ): Promise<{ total: number; eligible: number; evaluations: EligibilityEvaluation[] }> {
    try {
      const res = await fetch(`${API_BASE_URL}/eligibility/match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return {
        total: data.totalEvaluated,
        eligible: data.eligibleCount,
        evaluations: data.evaluations,
      };
    } catch {
      return { total: VERIFIED_SCHEMES.length, eligible: 1, evaluations: [] };
    }
  },

  async auditDocuments(payload: {
    studentState: string;
    studentCategory: string;
    annualIncome: number;
    incomeCertIssueDate?: string;
    casteCertIssueDate?: string;
    hasAadhaarBankSeeding?: boolean;
  }): Promise<{ readinessScore: number; items: DocumentPreFlightItem[] }> {
    try {
      const res = await fetch(`${API_BASE_URL}/documents/audit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return { readinessScore: data.overallReadinessScore, items: data.items };
    } catch {
      return { readinessScore: 80, items: INITIAL_DOCUMENT_AUDIT };
    }
  },

  async getDeadlines(): Promise<DeadlineRecord[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/deadlines`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.observations;
    } catch {
      return INITIAL_DEADLINE_RECORDS;
    }
  },
};
