// src/data/campusLocations.js

export const CAMPUS_AREAS = {
  OLD_SITE: 'Old Site (Southern Campus)',
  NEW_SITE: 'New Site (Northern Campus / Science)',
};

export const VERIFICATION_STATUS = {
  VERIFIED: 'verified',
  APPROXIMATE: 'approximate', // Used when exact survey coordinates are unavailable
};

// Helper to create consistent data structures
const createLocation = (data) => ({
  verificationStatus: VERIFICATION_STATUS.APPROXIMATE,
  architecturalProfile: { width: 10, depth: 8, height: 4, wallColor: '#E0E0E0', roofColor: '#718096' },
  ...data
});

export const campusLocations = [
  // ==========================================
  // OLD SITE (SOUTHERN CAMPUS) - Centered around Z: 0
  // ==========================================
  createLocation({
    id: 'old_admin_block',
    officialName: 'Old Administration Block',
    commonName: 'Old Admin',
    campusArea: CAMPUS_AREAS.OLD_SITE,
    coordinates: { x: 0, y: 0, z: 0 },
    architecturalProfile: { width: 14, depth: 10, height: 6, wallColor: '#F7FAFC', roofColor: '#2D3748' },
    description: 'The historic central administration building of UCC.',
  }),
  createLocation({
    id: 'oguaa_hall',
    officialName: 'Oguaa Hall',
    commonName: 'Oguaa',
    campusArea: CAMPUS_AREAS.OLD_SITE,
    coordinates: { x: -25, y: 0, z: 15 }, // West of Old Admin
    architecturalProfile: { width: 12, depth: 12, height: 10, wallColor: '#C53030', roofColor: '#742A2A' }, // Tall, red
    description: 'A prominent female hall of residence.',
  }),
  createLocation({
    id: 'adehye_hall',
    officialName: 'Adehye Hall',
    commonName: 'Adehye',
    campusArea: CAMPUS_AREAS.OLD_SITE,
    coordinates: { x: -25, y: 0, z: -15 }, // Near Oguaa
    architecturalProfile: { width: 12, depth: 12, height: 10, wallColor: '#9B2C2C', roofColor: '#742A2A' },
    description: 'Female hall of residence.',
  }),

  // ==========================================
  // NEW SITE / SCIENCE (NORTHERN CAMPUS) - Centered around Z: -250
  // ==========================================
  createLocation({
    id: 'sam_jonah_library',
    officialName: 'Sam Jonah Library',
    commonName: 'Sam Jonah Library',
    campusArea: CAMPUS_AREAS.NEW_SITE,
    coordinates: { x: 0, y: 0, z: -250 }, // The heart of the New Site
    architecturalProfile: { width: 20, depth: 14, height: 8, wallColor: '#F8F9FA', roofColor: '#1A365D' }, // Wide, white, blue roof
    description: 'The main university library. Opposite the Science Shuttle Station.',
  }),
  createLocation({
    id: 'new_admin_block',
    officialName: 'New Administration Block',
    commonName: 'New Admin',
    campusArea: CAMPUS_AREAS.NEW_SITE,
    coordinates: { x: 0, y: 0, z: -230 }, // Opposite Sam Jonah
    architecturalProfile: { width: 16, depth: 12, height: 12, wallColor: '#EDF2F7', roofColor: '#2D3748' },
    description: 'The main administrative hub for the New Site.',
  }),
  createLocation({
    id: 'llt',
    officialName: 'S. K. Adjepong Lecture Theatre (LLT)',
    commonName: 'LLT',
    campusArea: CAMPUS_AREAS.NEW_SITE,
    coordinates: { x: 25, y: 0, z: -250 }, // Beside Sam Jonah Library
    architecturalProfile: { width: 10, depth: 16, height: 6, wallColor: '#E2E8F0', roofColor: '#4A5568' },
    description: 'Large Lecture Theatre, located beside Sam Jonah Library.',
  }),
  createLocation({
    id: 'nlt',
    officialName: 'New Lecture Theatre (NLT)',
    commonName: 'NLT',
    campusArea: CAMPUS_AREAS.NEW_SITE,
    coordinates: { x: -30, y: 0, z: -280 }, // Relocated! Near CoDE and School of Business
    architecturalProfile: { width: 14, depth: 10, height: 8, wallColor: '#CBD5E0', roofColor: '#2D3748' },
    description: 'New Lecture Theatre. Located near CoDE and the School of Business. Contains clinical skills lab on top floor.',
  }),
  createLocation({
    id: 'code',
    officialName: 'College of Distance Education (CoDE)',
    commonName: 'CoDE',
    campusArea: CAMPUS_AREAS.NEW_SITE,
    coordinates: { x: -30, y: 0, z: -300 }, // Adjacent to NLT
    architecturalProfile: { width: 12, depth: 12, height: 6, wallColor: '#A0AEC0', roofColor: '#4A5568' },
    description: 'College of Distance Education.',
  }),
  createLocation({
    id: 'science_shuttle_terminal',
    officialName: 'Science Shuttle Station',
    commonName: 'Science Shuttle Terminal',
    campusArea: CAMPUS_AREAS.NEW_SITE,
    coordinates: { x: 0, y: 0, z: -270 }, // Opposite Sam Jonah
    architecturalProfile: { width: 8, depth: 6, height: 3, wallColor: '#718096', roofColor: '#2D3748' },
    description: 'Main shuttle stop connecting Old and New Sites.',
  }),
];