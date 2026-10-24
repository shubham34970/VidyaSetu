export type VerificationStatus =
  | 'VERIFIED_OFFICIAL'
  | 'CACHED_PORTAL'
  | 'DEMO_DATA'
  | 'UNVERIFIED';

export type DeadlineUrgency = 'CRITICAL' | 'UPCOMING' | 'OPEN' | 'EXPIRED';

export type EligibilityVerdict =
  | 'ELIGIBLE'
  | 'POTENTIALLY_ELIGIBLE'
  | 'INELIGIBLE'
  | 'INSUFFICIENT_INFO';

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
}

export interface ScholarshipScheme {
  id: string;
  name: string;
  authority: string;
  portalName: string;
  sourceUrl: string;
  benefitAmountFormatted: string;
  benefitType: string;
  applicationDeadline: string;
  deadlineStatus: DeadlineUrgency;
  verificationStatus: VerificationStatus;
  lastChecked: string;
  criteria: SchemeRuleCriteria;
  requiredDocuments: string[];
  description: string;
  officialCircularNotice: string;
  isExtensionAnnounced?: boolean;
  previousDeadline?: string;
}

export interface EligibilityEvaluation {
  schemeId: string;
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
  daysRemaining: number;
  status: DeadlineUrgency;
  wasExtended: boolean;
  previousDate?: string;
  lastChecked: string;
  extensionCircularRef?: string;
}
