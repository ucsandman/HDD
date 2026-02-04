import { useState, useCallback } from 'react';
import type { Survey, SurveyStatus, SurveyResponse, SurveyStats } from '../types';
import {
  loadSurveys,
  saveSurvey,
  deleteSurvey as deleteFromStorage,
  calculateStats,
  generateId,
  generateAccessCode,
  getNPSFromResponses,
} from '../utils/storage';

export function useSurveys() {
  const [surveys, setSurveys] = useState<Survey[]>(() => loadSurveys());
  const loading = false;

  // Calculate stats
  const stats: SurveyStats = calculateStats(surveys);

  // Create a new survey
  const createSurvey = useCallback(
    (data: {
      customerId: string;
      customerName: string;
      customerEmail: string;
      projectName: string;
    }) => {
      const now = new Date().toISOString();
      const newSurvey: Survey = {
        id: generateId(),
        customerId: data.customerId,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        projectName: data.projectName,
        status: 'pending',
        sentAt: null,
        completedAt: null,
        responses: [],
        npsScore: null,
        accessCode: generateAccessCode(),
        createdAt: now,
        updatedAt: now,
      };

      setSurveys((prev) => {
        const updated = [...prev, newSurvey];
        saveSurvey(newSurvey);
        return updated;
      });

      return newSurvey;
    },
    []
  );

  // Update survey
  const updateSurvey = useCallback(
    (surveyId: string, updates: Partial<Survey>) => {
      setSurveys((prev) => {
        const survey = prev.find((s) => s.id === surveyId);
        if (!survey) return prev;

        const updated = {
          ...survey,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        const newSurveys = prev.map((s) => (s.id === surveyId ? updated : s));
        saveSurvey(updated);
        return newSurveys;
      });
    },
    []
  );

  // Mark survey as sent
  const sendSurvey = useCallback((surveyId: string) => {
    setSurveys((prev) => {
      const survey = prev.find((s) => s.id === surveyId);
      if (!survey) return prev;

      const now = new Date().toISOString();
      const updated: Survey = {
        ...survey,
        status: 'sent',
        sentAt: now,
        updatedAt: now,
      };

      const newSurveys = prev.map((s) => (s.id === surveyId ? updated : s));
      saveSurvey(updated);
      return newSurveys;
    });
  }, []);

  // Submit survey response (customer action)
  const submitResponse = useCallback(
    (surveyId: string, responses: SurveyResponse[]) => {
      setSurveys((prev) => {
        const survey = prev.find((s) => s.id === surveyId);
        if (!survey) return prev;

        const now = new Date().toISOString();
        const npsScore = getNPSFromResponses(responses);

        const updated: Survey = {
          ...survey,
          status: 'completed',
          completedAt: now,
          responses,
          npsScore,
          updatedAt: now,
        };

        const newSurveys = prev.map((s) => (s.id === surveyId ? updated : s));
        saveSurvey(updated);
        return newSurveys;
      });
    },
    []
  );

  // Update survey status
  const updateStatus = useCallback(
    (surveyId: string, status: SurveyStatus) => {
      setSurveys((prev) => {
        const survey = prev.find((s) => s.id === surveyId);
        if (!survey) return prev;

        const now = new Date().toISOString();
        const updates: Partial<Survey> = {
          status,
          updatedAt: now,
        };

        if (status === 'sent' && !survey.sentAt) {
          updates.sentAt = now;
        }

        const updated = { ...survey, ...updates };
        const newSurveys = prev.map((s) => (s.id === surveyId ? updated : s));
        saveSurvey(updated);
        return newSurveys;
      });
    },
    []
  );

  // Delete survey
  const deleteSurvey = useCallback((surveyId: string) => {
    setSurveys((prev) => {
      const filtered = prev.filter((s) => s.id !== surveyId);
      deleteFromStorage(surveyId);
      return filtered;
    });
  }, []);

  // Get survey by ID
  const getSurvey = useCallback(
    (surveyId: string) => {
      return surveys.find((s) => s.id === surveyId) || null;
    },
    [surveys]
  );

  // Get survey by access code
  const getSurveyByAccessCode = useCallback(
    (accessCode: string) => {
      return surveys.find((s) => s.accessCode === accessCode) || null;
    },
    [surveys]
  );

  return {
    surveys,
    stats,
    loading,
    createSurvey,
    updateSurvey,
    sendSurvey,
    submitResponse,
    updateStatus,
    deleteSurvey,
    getSurvey,
    getSurveyByAccessCode,
  };
}
