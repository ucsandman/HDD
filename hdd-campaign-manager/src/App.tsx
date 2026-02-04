import { useState } from 'react';
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { TemplateLibrary } from './components/TemplateLibrary';
import { CampaignList } from './components/CampaignList';
import { CampaignForm } from './components/CampaignForm';
import { CampaignDetail } from './components/CampaignDetail';
import { CalendarView } from './components/CalendarView';
import { useCampaigns } from './hooks/useCampaigns';
import { exportCampaignsCSV } from './utils/storage';
import type { Campaign, CampaignTemplate } from './types';

type Tab = 'campaigns' | 'templates' | 'calendar';

function App() {
  const {
    campaigns,
    templates,
    stats,
    addCampaign,
    updateCampaign,
    deleteCampaign,
    markAsSent,
    markAsCompleted,
    deleteCustomTemplate,
    getTemplateById,
  } = useCampaigns();

  const [activeTab, setActiveTab] = useState<Tab>('campaigns');
  const [selectedTemplate, setSelectedTemplate] = useState<CampaignTemplate | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  const handleUseTemplate = (template: CampaignTemplate) => {
    setSelectedTemplate(template);
  };

  const handleCreateCampaign = (campaignData: Omit<Campaign, 'id'>) => {
    addCampaign(campaignData);
    setSelectedTemplate(null);
    setActiveTab('campaigns');
  };

  const handleSelectCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
  };

  const handleExportCSV = () => {
    exportCampaignsCSV(campaigns, templates);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'campaigns' && (
          <>
            <StatsBar stats={stats} />

            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-slate-800">
                Your Campaigns
              </h2>
              <div className="flex gap-2">
                {campaigns.length > 0 && (
                  <button
                    onClick={handleExportCSV}
                    className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-300"
                  >
                    Export CSV
                  </button>
                )}
                <button
                  onClick={() => setActiveTab('templates')}
                  className="px-4 py-2 bg-[#2F5233] hover:bg-[#234025] text-white text-sm font-medium rounded-lg transition-colors"
                >
                  + New Campaign
                </button>
              </div>
            </div>

            <CampaignList
              campaigns={campaigns}
              templates={templates}
              onSelectCampaign={handleSelectCampaign}
            />
          </>
        )}

        {activeTab === 'templates' && (
          <>
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-1">
                Template Library
              </h2>
              <p className="text-sm text-slate-600">
                Browse pre-built marketing templates by season and type. Click "Use" to create a campaign.
              </p>
            </div>

            <TemplateLibrary
              templates={templates}
              onUseTemplate={handleUseTemplate}
              onDeleteTemplate={deleteCustomTemplate}
            />
          </>
        )}

        {activeTab === 'calendar' && (
          <>
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-1">
                Campaign Calendar
              </h2>
              <p className="text-sm text-slate-600">
                View your scheduled campaigns in calendar format. Click on a campaign to view details.
              </p>
            </div>

            <CalendarView
              campaigns={campaigns}
              templates={templates}
              onSelectCampaign={handleSelectCampaign}
            />
          </>
        )}
      </main>

      {/* Create Campaign Modal */}
      {selectedTemplate && (
        <CampaignForm
          template={selectedTemplate}
          onSubmit={handleCreateCampaign}
          onCancel={() => setSelectedTemplate(null)}
        />
      )}

      {/* Campaign Detail Modal */}
      {selectedCampaign && (
        <CampaignDetail
          campaign={selectedCampaign}
          template={getTemplateById(selectedCampaign.templateId)}
          onClose={() => setSelectedCampaign(null)}
          onUpdate={(id, updates) => {
            updateCampaign(id, updates);
            setSelectedCampaign({ ...selectedCampaign, ...updates });
          }}
          onMarkAsSent={(id) => {
            markAsSent(id);
            setSelectedCampaign({
              ...selectedCampaign,
              status: 'sent',
              sentAt: new Date().toISOString(),
            });
          }}
          onMarkAsCompleted={(id) => {
            markAsCompleted(id);
            setSelectedCampaign({ ...selectedCampaign, status: 'completed' });
          }}
          onDelete={(id) => {
            deleteCampaign(id);
            setSelectedCampaign(null);
          }}
        />
      )}

      <footer className="text-center py-6 text-sm text-slate-500">
        Hickory Dickory Decks Seasonal Campaign Manager
      </footer>
    </div>
  );
}

export default App;
