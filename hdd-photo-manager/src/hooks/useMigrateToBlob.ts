import { useState, useEffect } from 'react';
import { isBase64DataUrl, migratePhotoToBlob } from '../utils/blobStorage';

interface Project {
  id: string;
  name: string;
  date: string;
  type: string;
  material: string;
  neighborhood: string;
  beforePhotos: string[];
  afterPhotos: string[];
  notes: string;
}

/**
 * Hook to migrate legacy base64 photos to Vercel Blob storage
 * Runs once on mount if migration hasn't been completed
 */
export function useMigrateToBlob(
  projects: Project[],
  setProjects: (projects: Project[]) => void
) {
  const [migrationStatus, setMigrationStatus] = useState<{
    isComplete: boolean;
    isRunning: boolean;
    progress: number;
    total: number;
  }>({
    isComplete: false,
    isRunning: false,
    progress: 0,
    total: 0,
  });

  useEffect(() => {
    const migrationComplete = localStorage.getItem('hdd-blob-migration-complete');

    if (migrationComplete === 'true') {
      setMigrationStatus(prev => ({ ...prev, isComplete: true }));
      return;
    }

    // Check if any projects have base64 photos
    const needsMigration = projects.some(
      p =>
        p.beforePhotos.some(isBase64DataUrl) ||
        p.afterPhotos.some(isBase64DataUrl)
    );

    if (!needsMigration) {
      localStorage.setItem('hdd-blob-migration-complete', 'true');
      setMigrationStatus(prev => ({ ...prev, isComplete: true }));
      return;
    }

    // Start migration
    async function startMigration() {
      setMigrationStatus(prev => ({ ...prev, isRunning: true }));

      // Calculate total photos to migrate
      let total = 0;
      projects.forEach(p => {
        total += p.beforePhotos.filter(isBase64DataUrl).length;
        total += p.afterPhotos.filter(isBase64DataUrl).length;
      });

      setMigrationStatus(prev => ({ ...prev, total }));

      let progress = 0;
      const migratedProjects = [...projects];

      for (let i = 0; i < migratedProjects.length; i++) {
        const project = migratedProjects[i];

        // Migrate before photos
        const newBeforePhotos: string[] = [];
        for (let j = 0; j < project.beforePhotos.length; j++) {
          const photo = project.beforePhotos[j];
          if (isBase64DataUrl(photo)) {
            try {
              const blobUrl = await migratePhotoToBlob(photo, j);
              newBeforePhotos.push(blobUrl);
              progress++;
              setMigrationStatus(prev => ({ ...prev, progress }));
            } catch (error) {
              console.error('Failed to migrate before photo:', error);
              // Keep original if migration fails
              newBeforePhotos.push(photo);
            }
          } else {
            newBeforePhotos.push(photo);
          }
        }

        // Migrate after photos
        const newAfterPhotos: string[] = [];
        for (let j = 0; j < project.afterPhotos.length; j++) {
          const photo = project.afterPhotos[j];
          if (isBase64DataUrl(photo)) {
            try {
              const blobUrl = await migratePhotoToBlob(photo, j);
              newAfterPhotos.push(blobUrl);
              progress++;
              setMigrationStatus(prev => ({ ...prev, progress }));
            } catch (error) {
              console.error('Failed to migrate after photo:', error);
              // Keep original if migration fails
              newAfterPhotos.push(photo);
            }
          } else {
            newAfterPhotos.push(photo);
          }
        }

        migratedProjects[i] = {
          ...project,
          beforePhotos: newBeforePhotos,
          afterPhotos: newAfterPhotos,
        };
      }

      // Save migrated projects
      setProjects(migratedProjects);
      localStorage.setItem('hdd-blob-migration-complete', 'true');
      setMigrationStatus({
        isComplete: true,
        isRunning: false,
        progress,
        total,
      });
    }

    startMigration();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount - projects and setProjects are intentionally omitted

  return migrationStatus;
}
