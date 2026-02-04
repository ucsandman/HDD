import { useState } from 'react';
import { usePermits } from './hooks/usePermits';
import { useMunicipalities } from './hooks/useMunicipalities';
import type { Permit, PermitStatus } from './types';
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { PermitList } from './components/PermitList';
import { PermitForm } from './components/PermitForm';
import { PermitDetail } from './components/PermitDetail';
import { MunicipalityManager } from './components/MunicipalityManager';

type View = 'list' | 'create' | 'detail' | 'municipalities';

export default function App() {
  const [view, setView] = useState<View>('list');
  const [selectedPermitId, setSelectedPermitId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<PermitStatus | 'all'>('all');

  const {
    permits,
    addPermit,
    updatePermit,
    updatePermitStatus,
    deletePermit,
    addInspection,
    updateInspection,
    deleteInspection,
    addDocument,
    deleteDocument,
  } = usePermits();

  const {
    municipalities,
    addMunicipality,
    updateMunicipality,
    deleteMunicipality,
    getMunicipalityById,
  } = useMunicipalities();

  const selectedPermit = selectedPermitId
    ? permits.find((p) => p.id === selectedPermitId)
    : null;

  const filteredPermits =
    statusFilter === 'all'
      ? permits
      : permits.filter((p) => p.status === statusFilter);

  const handleViewPermit = (permit: Permit) => {
    setSelectedPermitId(permit.id);
    setView('detail');
  };

  const handleCreatePermit = (
    data: Omit<
      Permit,
      'id' | 'createdAt' | 'updatedAt' | 'statusHistory' | 'documents' | 'inspections'
    >
  ) => {
    addPermit(data);
    setView('list');
  };

  const handleBack = () => {
    setSelectedPermitId(null);
    setView('list');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        onCreateNew={() => setView('create')}
        onManageMunicipalities={() => setView('municipalities')}
        showBackButton={view !== 'list'}
        onBack={handleBack}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'list' && (
          <>
            <StatsBar permits={permits} municipalities={municipalities} />
            <PermitList
              permits={filteredPermits}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              onViewPermit={handleViewPermit}
              getMunicipalityById={getMunicipalityById}
            />
          </>
        )}

        {view === 'create' && (
          <PermitForm
            municipalities={municipalities}
            onSubmit={handleCreatePermit}
            onCancel={handleBack}
          />
        )}

        {view === 'detail' && selectedPermit && (
          <PermitDetail
            permit={selectedPermit}
            municipality={getMunicipalityById(selectedPermit.municipality)}
            onUpdatePermit={(updates) => updatePermit(selectedPermit.id, updates)}
            onUpdateStatus={(status, notes) =>
              updatePermitStatus(selectedPermit.id, status, notes)
            }
            onDelete={() => {
              deletePermit(selectedPermit.id);
              handleBack();
            }}
            onAddInspection={(inspection) =>
              addInspection(selectedPermit.id, inspection)
            }
            onUpdateInspection={(inspectionId, updates) =>
              updateInspection(selectedPermit.id, inspectionId, updates)
            }
            onDeleteInspection={(inspectionId) =>
              deleteInspection(selectedPermit.id, inspectionId)
            }
            onAddDocument={(document) => addDocument(selectedPermit.id, document)}
            onDeleteDocument={(documentId) =>
              deleteDocument(selectedPermit.id, documentId)
            }
            onBack={handleBack}
          />
        )}

        {view === 'municipalities' && (
          <MunicipalityManager
            municipalities={municipalities}
            onAdd={addMunicipality}
            onUpdate={updateMunicipality}
            onDelete={deleteMunicipality}
            onBack={handleBack}
          />
        )}
      </main>
    </div>
  );
}
