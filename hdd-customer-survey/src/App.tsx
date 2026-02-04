import { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { SurveyList } from './components/SurveyList';
import { SurveyForm } from './components/SurveyForm';
import { SurveyDetail } from './components/SurveyDetail';
import { SurveyPreview } from './components/SurveyPreview';
import { CustomerSurveyView } from './components/CustomerSurveyView';
import { useSurveys } from './hooks/useSurveys';
import { exportToCSV } from './utils/storage';
import type { Survey, SurveyStatus, SurveyResponse } from './types';

type ViewMode = 'list' | 'create' | 'detail';

function App() {
  const {
    surveys,
    stats,
    loading,
    createSurvey,
    sendSurvey,
    submitResponse,
    updateStatus,
    deleteSurvey,
    getSurveyByAccessCode,
  } = useSurveys();

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [filterStatus, setFilterStatus] = useState<SurveyStatus | 'all'>('all');
  const [showPreview, setShowPreview] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoSurvey, setDemoSurvey] = useState<Survey | null>(null);

  // Check for access code in URL (customer view)
  const customerSurvey = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const accessCode = params.get('code');
    if (accessCode) {
      const survey = getSurveyByAccessCode(accessCode);
      if (survey && (survey.status === 'sent' || survey.status === 'pending')) {
        return survey;
      }
    }
    return null;
  }, [getSurveyByAccessCode]);

  const handleCreateSurvey = (data: {
    customerId: string;
    customerName: string;
    customerEmail: string;
    projectName: string;
  }) => {
    createSurvey(data);
    setViewMode('list');
  };

  const handleSelectSurvey = (survey: Survey) => {
    setSelectedSurvey(survey);
    setViewMode('detail');
  };

  const handleCloseDetail = () => {
    setSelectedSurvey(null);
    setViewMode('list');
  };

  const handleSendSurvey = () => {
    if (selectedSurvey) {
      sendSurvey(selectedSurvey.id);
      // Refresh selected survey
      const updated = surveys.find((s) => s.id === selectedSurvey.id);
      if (updated) {
        setSelectedSurvey({ ...updated, status: 'sent', sentAt: new Date().toISOString() });
      }
    }
  };

  const handleExpireSurvey = () => {
    if (selectedSurvey) {
      updateStatus(selectedSurvey.id, 'expired');
      const updated = surveys.find((s) => s.id === selectedSurvey.id);
      if (updated) {
        setSelectedSurvey({ ...updated, status: 'expired' });
      }
    }
  };

  const handleDeleteSurvey = () => {
    if (selectedSurvey && confirm('Are you sure you want to delete this survey?')) {
      deleteSurvey(selectedSurvey.id);
      handleCloseDetail();
    }
  };

  const handlePreviewSurvey = () => {
    if (selectedSurvey) {
      setShowPreview(true);
    }
  };

  const handleExportCSV = () => {
    const csv = exportToCSV(surveys);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hdd-surveys-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDemoMode = () => {
    if (isDemoMode) {
      setIsDemoMode(false);
      setDemoSurvey(null);
    } else {
      // Create a demo survey for preview
      const demo: Survey = {
        id: 'demo',
        customerId: 'demo-customer',
        customerName: 'John Smith',
        customerEmail: 'john@example.com',
        projectName: 'Cedar Deck - 123 Main St',
        status: 'sent',
        sentAt: new Date().toISOString(),
        completedAt: null,
        responses: [],
        npsScore: null,
        accessCode: 'DEMO1234',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setDemoSurvey(demo);
      setIsDemoMode(true);
    }
  };

  const handleDemoSubmit = () => {
    // In demo mode, just show the thank you and exit
    setTimeout(() => {
      setIsDemoMode(false);
      setDemoSurvey(null);
    }, 2000);
  };

  const handleCustomerSubmit = (responses: SurveyResponse[]) => {
    if (customerSurvey) {
      submitResponse(customerSurvey.id, responses);
      // Clear URL params
      window.history.replaceState({}, '', window.location.pathname);
    }
  };

  // Customer view (accessed via link)
  if (customerSurvey) {
    if (customerSurvey.status === 'completed') {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">
              Survey Already Completed
            </h2>
            <p className="text-slate-600">
              Thank you! You have already submitted your feedback for this survey.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <CustomerSurveyView
              survey={customerSurvey}
              onSubmit={handleCustomerSubmit}
            />
          </div>
        </div>
      </div>
    );
  }

  // Demo mode (customer view preview)
  if (isDemoMode && demoSurvey) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <span className="text-sm text-yellow-800 font-medium">
              Demo Mode - Customer View Preview
            </span>
            <button
              onClick={handleDemoMode}
              className="text-sm text-yellow-800 hover:text-yellow-900 font-medium"
            >
              Exit Demo
            </button>
          </div>
        </div>
        <div className="py-8 px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <CustomerSurveyView
                survey={demoSurvey}
                onSubmit={handleDemoSubmit}
                isPreview={true}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Admin view
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header onDemoMode={handleDemoMode} isDemoMode={isDemoMode} />

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats Bar */}
        <div className="mb-8">
          <StatsBar stats={stats} />
        </div>

        {/* Export Button */}
        {surveys.length > 0 && viewMode === 'list' && (
          <div className="mb-4 flex justify-end">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Export to CSV
            </button>
          </div>
        )}

        {/* View: List */}
        {viewMode === 'list' && (
          <SurveyList
            surveys={surveys}
            filterStatus={filterStatus}
            onFilterChange={setFilterStatus}
            onSelectSurvey={handleSelectSurvey}
            onCreateNew={() => setViewMode('create')}
          />
        )}

        {/* View: Create */}
        {viewMode === 'create' && (
          <div className="max-w-xl mx-auto">
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-800 mb-6">
                Create New Survey
              </h2>
              <SurveyForm
                onSubmit={handleCreateSurvey}
                onCancel={() => setViewMode('list')}
              />
            </div>
          </div>
        )}
      </main>

      {/* Detail Modal */}
      {viewMode === 'detail' && selectedSurvey && (
        <SurveyDetail
          survey={selectedSurvey}
          onClose={handleCloseDetail}
          onSend={handleSendSurvey}
          onDelete={handleDeleteSurvey}
          onExpire={handleExpireSurvey}
          onPreview={handlePreviewSurvey}
        />
      )}

      {/* Preview Modal */}
      {showPreview && selectedSurvey && (
        <SurveyPreview
          survey={selectedSurvey}
          onClose={() => setShowPreview(false)}
        />
      )}

      <footer className="text-center py-6 text-sm text-slate-500">
        Hickory Dickory Decks Customer Survey Tool
      </footer>
    </div>
  );
}

export default App;
