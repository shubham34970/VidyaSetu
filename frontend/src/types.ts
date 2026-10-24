// VidyaSetu — Frontend Type Definitions
// Round 2: Extended with schemeType, isRenewable, applicationMode, openingDate,
//          year-of-study range, institution-type, disability, minority, and sorting types.

export type VerificationStatus =
  | 'VERIFIED_OFFICIAL'
  | 'CACHED_PORTAL'
  | 'DEMO_DATA'
  | 'UNVERIFIED';

export type DeadlineUrgency = 'CRITICAL' | 'UPCOMING' | 'OPEN' | 'EXPIRED' | 'UNKNOWN' | 'URGENT';

export type EligibilityVerdict =
  | 'ELIGIBLE'
  | 'POTENTIALLY_ELIGIBLE'
  | 'INELIGIBLE'
  | 'INSUFFICIENT_INFO';

export type SchemeType =
  | 'MERIT'
  | 'MEANS'
  | 'MERIT_CUM_MEANS'
  | 'CATEGORY_SPECIFIC'
  | 'GENDER_SPECIFIC'
  | 'DISABILITY'
  | 'MINORITY'
  | 'FELLOWSHIP';

export type SortOption =
  | 'relevance'
  | 'deadline'
  | 'benefit_desc'
  | 'name'
  | 'recently_verified';

export interface StudentProfile {
  fullName: string;
  stateDomicile: string;
  socialCategory: 'GENERAL' | 'OBC' | 'SC' | 'ST' | 'EWS';
  annualFamilyIncome: number;
  courseDegree: string;
  academicLevel: 'UNDERGRADUATE' | 'POSTGRADUATE' | 'DIPLOMA' | 'HIGHER_SECONDARY';
  yearOfStudy: number;
  marksPercentage: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  institutionType: 'GOVERNMENT' | 'GOVT_AIDED' | 'PRIVATE';
  hasAadhaarBankSeeding: boolean;
}

export interface SchemeRuleCriteria {
  minMarksPercentage?: number;
  maxFamilyIncome?: number;
  allowedDomiciles?: string[];
  allowedCategories?: string[];
  allowedGenders?: string[];
  allowedLevels?: string[];
  // Round 2 additions
  minYearOfStudy?: number;
  maxYearOfStudy?: number;
  allowedInstitutionTypes?: string[];
  isDisabilityScheme?: boolean;
  isMinorityScheme?: boolean;
  allowedCourseKeywords?: string[];
  notes?: string;
}

export interface ScholarshipScheme {
  id: string;
  name: string;
  authority: string;
  portalName: string;
  sourceUrl: string;
  applicationUrl?: string;
  benefitAmountFormatted: string;
  benefitType: string;
  applicationDeadline: string;
  openingDate?: string;
  deadlineStatus: DeadlineUrgency;
  verificationStatus: VerificationStatus;
  lastChecked: string;
  schemeType?: SchemeType;
  isRenewable?: boolean;
  applicationMode?: string;
  criteria: SchemeRuleCriteria;
  requiredDocuments: string[];
  description: string;
  officialCircularNotice: string;
  isExtensionAnnounced?: boolean;
  previousDeadline?: string;
  tags?: string[];
}

export interface EligibilityEvaluation {
  schemeId: string;
  schemeName?: string;
  verdict: EligibilityVerdict;
  matchScore: number; // 0 to 100
  satisfiedConditions: string[];
  conflictingConditions: string[];
  missingConditions: string[];
  sourceCitations: string[];
}

export interface DocumentPreFlightItem {
  id: string;
  name: string;
  category: 'IDENTITY' | 'INCOME' | 'ACADEMIC' | 'DOMICILE' | 'BANK';
  status: 'PASS' | 'WARNING' | 'FAIL' | 'PENDING';
  issueDate?: string;
  validUntil?: string;
  issuingAuthority?: string;
  findings: string;
  actionRequired?: string;
  officialRuleSource: string;
}

export interface DeadlineRecord {
  schemeId: string;
  schemeName: string;
  portalName: string;
  officialUrl: string;
  closingDate: string;
  daysRemaining: number | null;
  status: DeadlineUrgency;
  wasExtended: boolean;
  previousDate?: string;
  lastChecked: string;
  extensionCircularRef?: string;
  // Round 2 additions
  changeType?: 'NEW' | 'UNCHANGED' | 'CHANGED' | 'WITHDRAWN' | 'UNKNOWN' | 'FETCH_FAILED';
  changeNote?: string;
  observationCount?: number;
  isStale?: boolean;
  verificationStatus?: VerificationStatus;
}

// ── Advanced search filter state ──────────────────────────────────────────────

export interface SearchFilters {
  query: string;
  domicile: string;
  category: string;
  level: string;
  gender: string;
  institutionType: string;
  yearOfStudy: string;
  maxIncome: string;
  minMarks: string;
  schemeType: string;
  deadlineStatus: string;
  isOpen: boolean;
  isDisability: boolean;
  isMinority: boolean;
  isRenewable: string;
  verificationStatus: string;
  sort: SortOption;
  onlyEligible: boolean;
}

export const EMPTY_FILTERS: SearchFilters = {
  query: '',
  domicile: 'ALL',
  category: 'ALL',
  level: 'ALL',
  gender: 'ALL',
  institutionType: 'ALL',
  yearOfStudy: 'ALL',
  maxIncome: '',
  minMarks: '',
  schemeType: 'ALL',
  deadlineStatus: 'ALL',
  isOpen: false,
  isDisability: false,
  isMinority: false,
  isRenewable: 'ALL',
  verificationStatus: 'ALL',
  sort: 'relevance',
  onlyEligible: false,
};

export function hasActiveFilters(f: SearchFilters): boolean {
  return (
    f.query !== '' ||
    f.domicile !== 'ALL' ||
    f.category !== 'ALL' ||
    f.level !== 'ALL' ||
    f.gender !== 'ALL' ||
    f.institutionType !== 'ALL' ||
    f.yearOfStudy !== 'ALL' ||
    f.maxIncome !== '' ||
    f.minMarks !== '' ||
    f.schemeType !== 'ALL' ||
    f.deadlineStatus !== 'ALL' ||
    f.isOpen ||
    f.isDisability ||
    f.isMinority ||
    f.isRenewable !== 'ALL' ||
    f.verificationStatus !== 'ALL' ||
    f.onlyEligible
  );
}
