import { useState, useEffect } from 'react';
import type { Permit, PermitStatus, Inspection, PermitDocument } from '../types';
import { loadPermits, savePermits } from '../utils/storage';
import { getTodayISO } from '../utils/dates';

export function usePermits() {
  const [permits, setPermits] = useState<Permit[]>(() => loadPermits());

  useEffect(() => {
    savePermits(permits);
  }, [permits]);

  const addPermit = (
    permit: Omit<Permit, 'id' | 'createdAt' | 'updatedAt' | 'statusHistory' | 'documents' | 'inspections'>
  ): Permit => {
    const now = getTodayISO();
    const newPermit: Permit = {
      ...permit,
      id: Date.now().toString(),
      statusHistory: [{ status: permit.status, timestamp: now }],
      documents: [],
      inspections: [],
      createdAt: now,
      updatedAt: now,
    };
    setPermits([newPermit, ...permits]);
    return newPermit;
  };

  const updatePermit = (id: string, updates: Partial<Permit>): void => {
    setPermits(
      permits.map((permit) =>
        permit.id === id
          ? { ...permit, ...updates, updatedAt: getTodayISO() }
          : permit
      )
    );
  };

  const updatePermitStatus = (id: string, status: PermitStatus, notes?: string): void => {
    const permit = permits.find((p) => p.id === id);
    if (!permit) return;

    const now = getTodayISO();
    const statusUpdate = { status, timestamp: now, notes };

    const updates: Partial<Permit> = {
      status,
      statusHistory: [...permit.statusHistory, statusUpdate],
      updatedAt: now,
    };

    // Auto-set dates based on status
    if (status === 'approved' && !permit.approvalDate) {
      updates.approvalDate = now;
    }

    setPermits(
      permits.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const deletePermit = (id: string): void => {
    if (window.confirm('Delete this permit? This cannot be undone.')) {
      setPermits(permits.filter((permit) => permit.id !== id));
    }
  };

  // Inspection management
  const addInspection = (
    permitId: string,
    inspection: Omit<Inspection, 'id'>
  ): void => {
    const permit = permits.find((p) => p.id === permitId);
    if (!permit) return;

    const newInspection: Inspection = {
      ...inspection,
      id: Date.now().toString(),
    };

    updatePermit(permitId, {
      inspections: [...permit.inspections, newInspection],
    });
  };

  const updateInspection = (
    permitId: string,
    inspectionId: string,
    updates: Partial<Inspection>
  ): void => {
    const permit = permits.find((p) => p.id === permitId);
    if (!permit) return;

    updatePermit(permitId, {
      inspections: permit.inspections.map((insp) =>
        insp.id === inspectionId ? { ...insp, ...updates } : insp
      ),
    });
  };

  const deleteInspection = (permitId: string, inspectionId: string): void => {
    const permit = permits.find((p) => p.id === permitId);
    if (!permit) return;

    updatePermit(permitId, {
      inspections: permit.inspections.filter((insp) => insp.id !== inspectionId),
    });
  };

  // Document management
  const addDocument = (
    permitId: string,
    document: Omit<PermitDocument, 'id' | 'uploadedAt'>
  ): void => {
    const permit = permits.find((p) => p.id === permitId);
    if (!permit) return;

    const newDocument: PermitDocument = {
      ...document,
      id: Date.now().toString(),
      uploadedAt: getTodayISO(),
    };

    updatePermit(permitId, {
      documents: [...permit.documents, newDocument],
    });
  };

  const deleteDocument = (permitId: string, documentId: string): void => {
    const permit = permits.find((p) => p.id === permitId);
    if (!permit) return;

    updatePermit(permitId, {
      documents: permit.documents.filter((doc) => doc.id !== documentId),
    });
  };

  return {
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
  };
}
