import { useState } from 'react';
import type { PriceEntry } from './types';
import { useSupplierData } from './hooks/useSupplierData';
import { calculateDashboardStats } from './utils/storage';
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { PriceComparisonTable } from './components/PriceComparisonTable';
import { SupplierList } from './components/SupplierList';
import { MaterialList } from './components/MaterialList';
import { PriceForm } from './components/PriceForm';

type ViewType = 'prices' | 'materials' | 'suppliers';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('prices');
  const [priceFormData, setPriceFormData] = useState<{
    materialId: string | null;
    supplierId: string | null;
    existingPrice: PriceEntry | null;
  } | null>(null);

  const {
    suppliers,
    materials,
    prices,
    priceHistory,
    loading,
    // Suppliers
    createSupplier,
    updateSupplier,
    deleteSupplier,
    getSupplier,
    // Materials
    createMaterial,
    updateMaterial,
    deleteMaterial,
    getMaterial,
    filterMaterials,
    // Prices
    addPrice,
    deletePrice,
  } = useSupplierData();

  const stats = calculateDashboardStats(materials, suppliers, prices, priceHistory);

  // Open price form for adding new price
  const handleAddPrice = (materialId: string, supplierId: string) => {
    setPriceFormData({
      materialId,
      supplierId,
      existingPrice: null,
    });
  };

  // Open price form for editing existing price
  const handleEditPrice = (price: PriceEntry) => {
    setPriceFormData({
      materialId: price.materialId,
      supplierId: price.supplierId,
      existingPrice: price,
    });
  };

  // Handle price form submission
  const handlePriceSubmit = (
    materialId: string,
    supplierId: string,
    price: number,
    effectiveDate: string,
    notes?: string,
    minQuantity?: number,
    expiresAt?: string
  ) => {
    addPrice(materialId, supplierId, price, effectiveDate, notes, minQuantity, expiresAt);
    setPriceFormData(null);
  };

  // Handle price deletion
  const handlePriceDelete = (priceId: string) => {
    deletePrice(priceId);
    setPriceFormData(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  // Get material and supplier for price form
  const priceFormMaterial = priceFormData?.materialId
    ? getMaterial(priceFormData.materialId) || null
    : null;
  const priceFormSupplier = priceFormData?.supplierId
    ? getSupplier(priceFormData.supplierId) || null
    : null;

  return (
    <div className="min-h-screen bg-gray-100">
      <Header currentView={currentView} onNavigate={setCurrentView} />

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Bar */}
        <StatsBar stats={stats} />

        {/* Main Content */}
        {currentView === 'prices' && (
          <PriceComparisonTable
            materials={materials}
            suppliers={suppliers}
            prices={prices}
            onAddPrice={handleAddPrice}
            onEditPrice={handleEditPrice}
            filterMaterials={filterMaterials}
          />
        )}

        {currentView === 'materials' && (
          <MaterialList
            materials={materials}
            onCreate={createMaterial}
            onUpdate={updateMaterial}
            onDelete={deleteMaterial}
          />
        )}

        {currentView === 'suppliers' && (
          <SupplierList
            suppliers={suppliers}
            onCreate={createSupplier}
            onUpdate={updateSupplier}
            onDelete={deleteSupplier}
          />
        )}

        {/* Price Form Modal */}
        {priceFormData && (
          <PriceForm
            material={priceFormMaterial}
            supplier={priceFormSupplier}
            existingPrice={priceFormData.existingPrice}
            onSubmit={handlePriceSubmit}
            onDelete={handlePriceDelete}
            onClose={() => setPriceFormData(null)}
          />
        )}
      </main>
    </div>
  );
}

export default App;
