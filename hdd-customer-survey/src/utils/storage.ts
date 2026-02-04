import type { Survey, SurveyStats, NPSCategory, SurveyResponse } from '../types';

const STORAGE_KEY = 'hdd_surveys';

// Only log errors in development mode
const logError = (message: string, error: unknown) => {
  if (import.meta.env.DEV) {
    console.error(message, error);
  }
};

// Load all surveys from localStorage
export function loadSurveys(): Survey[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    logError('Failed to load surveys:', error);
    return [];
  }
}

// Save all surveys to localStorage
export function saveSurveys(surveys: Survey[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(surveys));
  } catch (error) {
    logError('Failed to save surveys:', error);
  }
}

// Save a single survey
export function saveSurvey(survey: Survey): void {
  const surveys = loadSurveys();
  const index = surveys.findIndex((s) => s.id === survey.id);

  if (index >= 0) {
    surveys[index] = { ...survey, updatedAt: new Date().toISOString() };
  } else {
    surveys.push(survey);
  }

  saveSurveys(surveys);
}

// Delete a survey
export function deleteSurvey(surveyId: string): void {
  const surveys = loadSurveys();
  const filtered = surveys.filter((s) => s.id !== surveyId);
  saveSurveys(filtered);
}

// Get a single survey by ID
export function getSurvey(surveyId: string): Survey | null {
  const surveys = loadSurveys();
  return surveys.find((s) => s.id === surveyId) || null;
}

// Get survey by access code (for customer view)
export function getSurveyByAccessCode(accessCode: string): Survey | null {
  const surveys = loadSurveys();
  return surveys.find((s) => s.accessCode === accessCode) || null;
}

// Categorize NPS score
export function categorizeNPS(score: number): NPSCategory {
  if (score >= 9) return 'promoter';
  if (score >= 7) return 'passive';
  return 'detractor';
}

// Calculate NPS score from a set of individual scores
// NPS = (% Promoters - % Detractors) * 100
export function calculateNPS(scores: number[]): number | null {
  if (scores.length === 0) return null;

  const promoters = scores.filter((s) => s >= 9).length;
  const detractors = scores.filter((s) => s <= 6).length;

  const promoterPercentage = promoters / scores.length;
  const detractorPercentage = detractors / scores.length;

  return Math.round((promoterPercentage - detractorPercentage) * 100);
}

// Get NPS score from survey responses
export function getNPSFromResponses(responses: SurveyResponse[]): number | null {
  const npsResponse = responses.find((r) => r.questionId === 'nps');
  if (npsResponse && typeof npsResponse.value === 'number') {
    return npsResponse.value;
  }
  return null;
}

// Calculate survey statistics
export function calculateStats(surveys: Survey[]): SurveyStats {
  const sentSurveys = surveys.filter((s) => s.status !== 'pending');
  const completedSurveys = surveys.filter((s) => s.status === 'completed');

  const npsScores = completedSurveys
    .map((s) => s.npsScore)
    .filter((score): score is number => score !== null);

  const promoters = npsScores.filter((s) => s >= 9).length;
  const passives = npsScores.filter((s) => s >= 7 && s <= 8).length;
  const detractors = npsScores.filter((s) => s <= 6).length;

  return {
    totalSent: sentSurveys.length,
    completed: completedSurveys.length,
    responseRate: sentSurveys.length > 0
      ? Math.round((completedSurveys.length / sentSurveys.length) * 100)
      : 0,
    npsScore: calculateNPS(npsScores),
    promoters,
    passives,
    detractors,
  };
}

// Export surveys to CSV
export function exportToCSV(surveys: Survey[]): string {
  const headers = [
    'Customer Name',
    'Customer Email',
    'Project Name',
    'Status',
    'Sent At',
    'Completed At',
    'NPS Score',
    'NPS Category',
    'Quality Rating',
    'Communication Rating',
    'Timeline Rating',
    'Would Use Again',
    'What Went Well',
    'Improvements',
  ];

  const escapeCSV = (value: string | number | boolean | null | undefined): string => {
    if (value === null || value === undefined) return '';
    const str = String(value);
    // Prevent CSV injection
    if (/^[=+\-@\t\r]/.test(str)) {
      return `"'${str.replace(/"/g, '""')}"`;
    }
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const getResponseValue = (
    responses: SurveyResponse[],
    questionId: string
  ): string | number | boolean | null => {
    const response = responses.find((r) => r.questionId === questionId);
    return response ? response.value : null;
  };

  const rows = surveys.map((survey) => {
    const npsScore = survey.npsScore;
    const npsCategory = npsScore !== null ? categorizeNPS(npsScore) : '';

    return [
      escapeCSV(survey.customerName),
      escapeCSV(survey.customerEmail),
      escapeCSV(survey.projectName),
      escapeCSV(survey.status),
      escapeCSV(survey.sentAt),
      escapeCSV(survey.completedAt),
      escapeCSV(npsScore),
      escapeCSV(npsCategory),
      escapeCSV(getResponseValue(survey.responses, 'quality')),
      escapeCSV(getResponseValue(survey.responses, 'communication')),
      escapeCSV(getResponseValue(survey.responses, 'timeline')),
      escapeCSV(getResponseValue(survey.responses, 'use_again')),
      escapeCSV(getResponseValue(survey.responses, 'what_went_well')),
      escapeCSV(getResponseValue(survey.responses, 'improvements')),
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

// Generate a unique access code
export function generateAccessCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
