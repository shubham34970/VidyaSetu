import React, { useState } from 'react';
import {
  User,
  GraduationCap,
  IndianRupee,
  CheckCircle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Building,
  Info,
} from 'lucide-react';
import type { StudentProfile } from '../types';
import { PRESET_PROFILES } from '../data/verifiedSchemes';

interface ProfileWizardViewProps {
  profile: StudentProfile;
  onSaveProfile: (updated: StudentProfile) => void;
  onComplete: () => void;
}

const INDIAN_STATES = [
  'Uttar Pradesh',
  'Delhi',
  'Bihar',
  'Rajasthan',
  'Madhya Pradesh',
  'Haryana',
  'Maharashtra',
  'Uttarakhand',
  'Punjab',
  'West Bengal',
  'Other State / UT',
];

export const ProfileWizardView: React.FC<ProfileWizardViewProps> = ({
  profile,
  onSaveProfile,
  onComplete,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState<StudentProfile>(profile);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleChange = <K extends keyof StudentProfile>(key: K, value: StudentProfile[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyPreset = (preset: StudentProfile) => {
    setFormData(preset);
    onSaveProfile(preset);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    onComplete();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-300 border border-teal-500/20 mb-2">
            <User className="w-3.5 h-3.5" />
            <span>Student Profile Intake</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Configure Entitlement Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Deterministic matching compares these criteria against official scheme rules.
          </p>
        </div>

        {/* Quick Presets Bar */}
        <div className="flex flex-col items-start sm:items-end">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center">
            <Sparkles className="w-3 h-3 text-teal-400 mr-1" /> Quick Persona Presets
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESET_PROFILES.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(p.profile)}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                title={p.description}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {savedNotice && (
        <div className="p-3 rounded-xl bg-teal-500/15 border border-teal-500/40 text-teal-300 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-teal-400" />
          <span>Preset profile applied and synchronized!</span>
        </div>
      )}

      {/* Progress Steps Header */}
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => setStep(1)}
          className={`p-3 rounded-xl border text-left transition-all ${
            step === 1
              ? 'bg-teal-950/60 border-teal-500/50 text-white'
              : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="text-[10px] font-mono uppercase text-teal-400">Step 01</div>
          <div className="text-xs font-bold mt-0.5">Demographics & Domicile</div>
        </button>

        <button
          type="button"
          onClick={() => setStep(2)}
          className={`p-3 rounded-xl border text-left transition-all ${
            step === 2
              ? 'bg-teal-950/60 border-teal-500/50 text-white'
              : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="text-[10px] font-mono uppercase text-teal-400">Step 02</div>
          <div className="text-xs font-bold mt-0.5">Academic Record</div>
        </button>

        <button
          type="button"
          onClick={() => setStep(3)}
          className={`p-3 rounded-xl border text-left transition-all ${
            step === 3
              ? 'bg-teal-950/60 border-teal-500/50 text-white'
              : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="text-[10px] font-mono uppercase text-teal-400">Step 03</div>
          <div className="text-xs font-bold mt-0.5">Income & Bank Seeding</div>
        </button>
      </div>

      {/* Wizard Form */}
      <form onSubmit={handleFinalSubmit} className="space-y-6">
        <div className="p-6 sm:p-8 rounded-2xl bg-navy-900/70 border border-slate-800 shadow-xl">
          {/* STEP 1: DEMOGRAPHICS */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <User className="w-4 h-4 text-teal-400" />
                <span>Personal & Domicile Information</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Full Name (As on High School Certificate)
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-teal-500"
                    placeholder="e.g. Aarav Sharma"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Permanent State Domicile
                  </label>
                  <select
                    value={formData.stateDomicile}
                    onChange={(e) => handleChange('stateDomicile', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-teal-500"
                  >
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Social Category (Caste / Welfare Group)
                  </label>
                  <select
                    value={formData.socialCategory}
                    onChange={(e) =>
                      handleChange(
                        'socialCategory',
                        e.target.value as StudentProfile['socialCategory']
                      )
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-teal-500"
                  >
                    <option value="GENERAL">General (Unreserved)</option>
                    <option value="OBC">Other Backward Classes (OBC-NCL)</option>
                    <option value="SC">Scheduled Castes (SC)</option>
                    <option value="ST">Scheduled Tribes (ST)</option>
                    <option value="EWS">Economically Weaker Section (EWS)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Gender Identity
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) =>
                      handleChange('gender', e.target.value as StudentProfile['gender'])
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-teal-500"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female (Qualifies for Pragati & Special Grants)</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: ACADEMICS */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-cyan-400" />
                <span>Academic Enrollment & Past Merit</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Course & Degree Title
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.courseDegree}
                    onChange={(e) => handleChange('courseDegree', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-teal-500"
                    placeholder="e.g. B.Tech Computer Science & Engineering"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Academic Level
                  </label>
                  <select
                    value={formData.academicLevel}
                    onChange={(e) =>
                      handleChange(
                        'academicLevel',
                        e.target.value as StudentProfile['academicLevel']
                      )
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-teal-500"
                  >
                    <option value="UNDERGRADUATE">Undergraduate (B.Tech, B.Sc, B.Com, BA)</option>
                    <option value="POSTGRADUATE">Postgraduate (M.Tech, MBA, M.Sc, MA)</option>
                    <option value="DIPLOMA">Polytechnic / Technical Diploma</option>
                    <option value="HIGHER_SECONDARY">Class 11 - 12 (Post-Matric)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Current Year of Study
                  </label>
                  <select
                    value={formData.yearOfStudy}
                    onChange={(e) => handleChange('yearOfStudy', Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-teal-500"
                  >
                    <option value={1}>1st Year (Fresh Admission)</option>
                    <option value={2}>2nd Year (Renewal / Lateral)</option>
                    <option value={3}>3rd Year (Renewal)</option>
                    <option value={4}>4th Year (Renewal)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Prior Qualifying Marks / Percentage (% aggregate)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    required
                    value={formData.marksPercentage}
                    onChange={(e) => handleChange('marksPercentage', parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-teal-500"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    NSP CSSS cutoff requires &ge; 80%; UP Post-Matric requires &ge; 50%.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Institution Affiliation Type
                  </label>
                  <select
                    value={formData.institutionType}
                    onChange={(e) =>
                      handleChange(
                        'institutionType',
                        e.target.value as StudentProfile['institutionType']
                      )
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-teal-500"
                  >
                    <option value="GOVERNMENT">Government University / College</option>
                    <option value="GOVT_AIDED">Government-Aided College (e.g. AKTU / Affiliated)</option>
                    <option value="PRIVATE">Private Self-Financed Institution</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: FINANCIAL & PREREQUISITES */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-emerald-400" />
                <span>Financial Ceilings & Aadhaar-Bank Seeding</span>
              </h2>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-slate-300">
                      Annual Family Gross Income (INR ₹)
                    </label>
                    <span className="text-sm font-bold text-teal-400 font-mono">
                      ₹{formData.annualFamilyIncome.toLocaleString('en-IN')} / year
                    </span>
                  </div>

                  <input
                    type="range"
                    min={50000}
                    max={1000000}
                    step={10000}
                    value={formData.annualFamilyIncome}
                    onChange={(e) => handleChange('annualFamilyIncome', Number(e.target.value))}
                    className="w-full accent-teal-400 bg-slate-800 rounded-lg cursor-pointer h-2"
                  />

                  <div className="flex justify-between text-[11px] text-slate-500 mt-1 font-mono">
                    <span>₹50,000</span>
                    <span>₹2.0L (UP OBC/Gen Cap)</span>
                    <span>₹2.5L (UP SC/ST)</span>
                    <span>₹4.5L (NSP CSSS)</span>
                    <span>₹8.0L (AICTE Pragati)</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="seedingCheck"
                      checked={formData.hasAadhaarBankSeeding}
                      onChange={(e) => handleChange('hasAadhaarBankSeeding', e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-slate-700 text-teal-500 focus:ring-teal-500/20 bg-slate-800"
                    />
                    <label htmlFor="seedingCheck" className="text-xs text-slate-300 cursor-pointer">
                      <span className="font-semibold text-white block">
                        My Bank Account is Active and Mapped to Aadhaar (NPCI Direct Benefit Transfer)
                      </span>
                      <span className="text-slate-400 text-[11px] block mt-0.5">
                        Mandatory prerequisite across PFMS, NSP, and UP Dashmottar portals to receive fee reimbursements.
                      </span>
                    </label>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-start gap-2.5 text-xs text-slate-300">
                  <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Privacy Assurance:</strong> VidyaSetu processes eligibility parameters locally and server-side in memory. We never ask for or store Aadhaar numbers, PAN, or bank account credentials.
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Navigation Footer */}
        <div className="flex items-center justify-between pt-2">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => ((s - 1) as 1 | 2 | 3))}
              className="inline-flex items-center px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              Previous Step
            </button>
          ) : (
            <div></div>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => {
                onSaveProfile(formData);
                setStep((s) => ((s + 1) as 1 | 2 | 3));
              }}
              className="inline-flex items-center px-5 py-2.5 rounded-xl text-xs font-semibold bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold shadow-md shadow-teal-500/20"
            >
              Next Step
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </button>
          ) : (
            <button
              type="submit"
              className="inline-flex items-center px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 shadow-lg shadow-teal-500/25"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Save Profile & Discover Schemes
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
