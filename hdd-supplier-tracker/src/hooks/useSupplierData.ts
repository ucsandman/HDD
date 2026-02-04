import { useState, useEffect, useCallback } from 'react';
import type {
  Supplier,
  Material,
  PriceEntry,
  PriceHistory,
  MaterialCategory,
  UnitType,
  MaterialFilters,
} from '../types';
import {
  generateId,
  initializeDefaults,
  loadSuppliers,
  saveSuppliers,
  loadMaterials,
  saveMaterials,
  loadPrices,
  savePrices,
  loadPriceHistory,
  savePriceHistory,
} from '../utils/storage';

export function useSupplierData() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [prices, setPrices] = useState<PriceEntry[]>([]);
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize and load data
  useEffect(() => {
    initializeDefaults();
    setSuppliers(loadSuppliers());
    setMaterials(loadMaterials());
    setPrices(loadPrices());
    setPriceHistory(loadPriceHistory());
    setLoading(false);
  }, []);

  // Auto-save on changes
  useEffect(() => {
    if (!loading) {
      saveSuppliers(suppliers);
    }
  }, [suppliers, loading]);

  useEffect(() => {
    if (!loading) {
      saveMaterials(materials);
    }
  }, [materials, loading]);

  useEffect(() => {
    if (!loading) {
      savePrices(prices);
    }
  }, [prices, loading]);

  useEffect(() => {
    if (!loading) {
      savePriceHistory(priceHistory);
    }
  }, [priceHistory, loading]);

  // Supplier CRUD
  const createSupplier = useCallback((
    data: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>
  ): Supplier => {
    const now = new Date().toISOString();
    const newSupplier: Supplier = {
      ...data,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    setSuppliers(prev => [...prev, newSupplier]);
    return newSupplier;
  }, []);

  const updateSupplier = useCallback((
    id: string,
    updates: Partial<Omit<Supplier, 'id' | 'createdAt'>>
  ): void => {
    setSuppliers(prev => prev.map(s => {
      if (s.id !== id) return s;
      return { ...s, ...updates, updatedAt: new Date().toISOString() };
    }));
  }, []);

  const deleteSupplier = useCallback((id: string): void => {
    setSuppliers(prev => prev.filter(s => s.id !== id));
    // Also delete associated prices
    setPrices(prev => prev.filter(p => p.supplierId !== id));
  }, []);

  // Material CRUD
  const createMaterial = useCallback((
    data: Omit<Material, 'id' | 'createdAt' | 'updatedAt'>
  ): Material => {
    const now = new Date().toISOString();
    const newMaterial: Material = {
      ...data,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    setMaterials(prev => [...prev, newMaterial]);
    return newMaterial;
  }, []);

  const updateMaterial = useCallback((
    id: string,
    updates: Partial<Omit<Material, 'id' | 'createdAt'>>
  ): void => {
    setMaterials(prev => prev.map(m => {
      if (m.id !== id) return m;
      return { ...m, ...updates, updatedAt: new Date().toISOString() };
    }));
  }, []);

  const deleteMaterial = useCallback((id: string): void => {
    setMaterials(prev => prev.filter(m => m.id !== id));
    // Also delete associated prices
    setPrices(prev => prev.filter(p => p.materialId !== id));
  }, []);

  // Price CRUD
  const addPrice = useCallback((
    materialId: string,
    supplierId: string,
    price: number,
    effectiveDate: string,
    notes?: string,
    minQuantity?: number,
    expiresAt?: string
  ): PriceEntry => {
    const now = new Date().toISOString();

    // Check for existing price and record history
    const existingPrice = prices.find(
      p => p.materialId === materialId && p.supplierId === supplierId
    );

    if (existingPrice && existingPrice.price !== price) {
      const changePercent = ((price - existingPrice.price) / existingPrice.price) * 100;
      const historyEntry: PriceHistory = {
        id: generateId(),
        materialId,
        supplierId,
        oldPrice: existingPrice.price,
        newPrice: price,
        changePercent,
        recordedAt: now,
      };
      setPriceHistory(prev => [...prev, historyEntry]);
    }

    const newPrice: PriceEntry = {
      id: generateId(),
      materialId,
      supplierId,
      price,
      effectiveDate,
      notes,
      minQuantity,
      expiresAt,
      createdAt: now,
      updatedAt: now,
    };

    // Remove old price entries for this material/supplier combo and add new
    setPrices(prev => [
      ...prev.filter(p => !(p.materialId === materialId && p.supplierId === supplierId)),
      newPrice,
    ]);

    return newPrice;
  }, [prices]);

  const updatePrice = useCallback((
    id: string,
    updates: Partial<Omit<PriceEntry, 'id' | 'createdAt'>>
  ): void => {
    setPrices(prev => prev.map(p => {
      if (p.id !== id) return p;

      // Record price change history if price changed
      if (updates.price !== undefined && updates.price !== p.price) {
        const changePercent = ((updates.price - p.price) / p.price) * 100;
        const historyEntry: PriceHistory = {
          id: generateId(),
          materialId: p.materialId,
          supplierId: p.supplierId,
          oldPrice: p.price,
          newPrice: updates.price,
          changePercent,
          recordedAt: new Date().toISOString(),
        };
        setPriceHistory(prev => [...prev, historyEntry]);
      }

      return { ...p, ...updates, updatedAt: new Date().toISOString() };
    }));
  }, []);

  const deletePrice = useCallback((id: string): void => {
    setPrices(prev => prev.filter(p => p.id !== id));
  }, []);

  // Get current price for a material at a supplier
  const getCurrentPrice = useCallback((
    materialId: string,
    supplierId: string
  ): PriceEntry | null => {
    const supplierPrices = prices
      .filter(p => p.materialId === materialId && p.supplierId === supplierId)
      .sort((a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime());
    return supplierPrices[0] || null;
  }, [prices]);

  // Filter materials
  const filterMaterials = useCallback((filters: MaterialFilters): Material[] => {
    return materials.filter(material => {
      if (filters.category && material.category !== filters.category) {
        return false;
      }

      if (filters.search) {
        const search = filters.search.toLowerCase();
        const searchFields = [
          material.name,
          material.description || '',
          material.sku || '',
        ].map(f => f.toLowerCase());

        if (!searchFields.some(f => f.includes(search))) {
          return false;
        }
      }

      if (filters.supplierId) {
        const hasPrice = prices.some(
          p => p.materialId === material.id && p.supplierId === filters.supplierId
        );
        if (!hasPrice) return false;
      }

      return true;
    });
  }, [materials, prices]);

  // Get supplier by ID
  const getSupplier = useCallback((id: string): Supplier | undefined => {
    return suppliers.find(s => s.id === id);
  }, [suppliers]);

  // Get material by ID
  const getMaterial = useCallback((id: string): Material | undefined => {
    return materials.find(m => m.id === id);
  }, [materials]);

  return {
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
    updatePrice,
    deletePrice,
    getCurrentPrice,
  };
}
