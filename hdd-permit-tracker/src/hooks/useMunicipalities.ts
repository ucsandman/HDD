import { useState, useEffect } from 'react';
import type { Municipality } from '../types';
import { loadMunicipalities, saveMunicipalities } from '../utils/storage';

export function useMunicipalities() {
  const [municipalities, setMunicipalities] = useState<Municipality[]>(() =>
    loadMunicipalities()
  );

  useEffect(() => {
    saveMunicipalities(municipalities);
  }, [municipalities]);

  const addMunicipality = (
    municipality: Omit<Municipality, 'id'>
  ): Municipality => {
    const newMunicipality: Municipality = {
      ...municipality,
      id: Date.now().toString(),
    };
    setMunicipalities([...municipalities, newMunicipality]);
    return newMunicipality;
  };

  const updateMunicipality = (
    id: string,
    updates: Partial<Municipality>
  ): void => {
    setMunicipalities(
      municipalities.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
  };

  const deleteMunicipality = (id: string): void => {
    if (
      window.confirm(
        'Delete this municipality? This will not affect existing permits.'
      )
    ) {
      setMunicipalities(municipalities.filter((m) => m.id !== id));
    }
  };

  const getMunicipalityById = (id: string): Municipality | undefined => {
    return municipalities.find((m) => m.id === id);
  };

  const getMunicipalityByName = (name: string): Municipality | undefined => {
    return municipalities.find(
      (m) => m.name.toLowerCase() === name.toLowerCase()
    );
  };

  return {
    municipalities,
    addMunicipality,
    updateMunicipality,
    deleteMunicipality,
    getMunicipalityById,
    getMunicipalityByName,
  };
}
