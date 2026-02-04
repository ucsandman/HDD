import { useState, useEffect, useMemo } from 'react';
import type { Campaign, CampaignTemplate, Season, CampaignStatus } from '../types';
import { DEFAULT_TEMPLATES } from '../types';
import {
  loadCampaigns,
  saveCampaigns,
  loadCustomTemplates,
  saveCustomTemplates,
} from '../utils/storage';

export function useCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => loadCampaigns());
  const [customTemplates, setCustomTemplates] = useState<CampaignTemplate[]>(() =>
    loadCustomTemplates()
  );

  // All templates (default + custom)
  const templates = useMemo(
    () => [...DEFAULT_TEMPLATES, ...customTemplates],
    [customTemplates]
  );

  // Persist campaigns
  useEffect(() => {
    saveCampaigns(campaigns);
  }, [campaigns]);

  // Persist custom templates
  useEffect(() => {
    saveCustomTemplates(customTemplates);
  }, [customTemplates]);

  // Campaign CRUD
  const addCampaign = (
    campaign: Omit<Campaign, 'id'>
  ): Campaign => {
    const newCampaign: Campaign = {
      ...campaign,
      id: Date.now().toString(),
    };
    setCampaigns([newCampaign, ...campaigns]);
    return newCampaign;
  };

  const updateCampaign = (id: string, updates: Partial<Campaign>) => {
    setCampaigns(
      campaigns.map((campaign) =>
        campaign.id === id ? { ...campaign, ...updates } : campaign
      )
    );
  };

  const deleteCampaign = (id: string) => {
    if (window.confirm('Delete this campaign? This cannot be undone.')) {
      setCampaigns(campaigns.filter((campaign) => campaign.id !== id));
    }
  };

  const markAsSent = (id: string) => {
    updateCampaign(id, {
      status: 'sent',
      sentAt: new Date().toISOString(),
    });
  };

  const markAsCompleted = (id: string) => {
    updateCampaign(id, { status: 'completed' });
  };

  // Template management
  const addCustomTemplate = (
    template: Omit<CampaignTemplate, 'id'>
  ): CampaignTemplate => {
    const newTemplate: CampaignTemplate = {
      ...template,
      id: `custom-${Date.now()}`,
    };
    setCustomTemplates([...customTemplates, newTemplate]);
    return newTemplate;
  };

  const updateCustomTemplate = (id: string, updates: Partial<CampaignTemplate>) => {
    setCustomTemplates(
      customTemplates.map((template) =>
        template.id === id ? { ...template, ...updates } : template
      )
    );
  };

  const deleteCustomTemplate = (id: string) => {
    // Only allow deleting custom templates
    if (!id.startsWith('custom-')) {
      return;
    }
    if (window.confirm('Delete this template? This cannot be undone.')) {
      setCustomTemplates(customTemplates.filter((template) => template.id !== id));
    }
  };

  // Filtering helpers
  const filterCampaignsBySeason = (season: Season | 'all'): Campaign[] => {
    if (season === 'all') return campaigns;
    return campaigns.filter((c) => c.season === season);
  };

  const filterCampaignsByStatus = (status: CampaignStatus | 'all'): Campaign[] => {
    if (status === 'all') return campaigns;
    return campaigns.filter((c) => c.status === status);
  };

  const filterTemplatesBySeason = (season: Season | 'all'): CampaignTemplate[] => {
    if (season === 'all') return templates;
    return templates.filter((t) => t.season === season);
  };

  const filterTemplatesByType = (type: string | 'all'): CampaignTemplate[] => {
    if (type === 'all') return templates;
    return templates.filter((t) => t.type === type);
  };

  // Get template by ID
  const getTemplateById = (id: string): CampaignTemplate | undefined => {
    return templates.find((t) => t.id === id);
  };

  // Stats
  const stats = useMemo(() => {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const draft = campaigns.filter((c) => c.status === 'draft').length;
    const scheduled = campaigns.filter((c) => c.status === 'scheduled').length;
    const sent = campaigns.filter((c) => c.status === 'sent').length;
    const completed = campaigns.filter((c) => c.status === 'completed').length;

    const upcoming = campaigns.filter((c) => {
      if (c.status !== 'scheduled') return false;
      const scheduledDate = new Date(c.scheduledDate);
      return scheduledDate >= now && scheduledDate <= nextWeek;
    }).length;

    return {
      total: campaigns.length,
      draft,
      scheduled,
      sent,
      completed,
      upcoming,
    };
  }, [campaigns]);

  return {
    campaigns,
    templates,
    customTemplates,
    stats,
    addCampaign,
    updateCampaign,
    deleteCampaign,
    markAsSent,
    markAsCompleted,
    addCustomTemplate,
    updateCustomTemplate,
    deleteCustomTemplate,
    filterCampaignsBySeason,
    filterCampaignsByStatus,
    filterTemplatesBySeason,
    filterTemplatesByType,
    getTemplateById,
  };
}
