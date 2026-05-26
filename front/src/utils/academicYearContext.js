/** In-memory + localStorage sync for x-academic-year-id (axios reads this on every request). */
let activeAcademicYearId = null;

export function getActiveAcademicYearId() {
  if (activeAcademicYearId) return activeAcademicYearId;
  if (typeof window !== 'undefined') {
    return localStorage.getItem('activeAcademicYearId');
  }
  return null;
}

export function setActiveAcademicYearId(id) {
  activeAcademicYearId = id ? String(id) : null;
  if (typeof window === 'undefined') return;
  if (activeAcademicYearId) {
    localStorage.setItem('activeAcademicYearId', activeAcademicYearId);
  } else {
    localStorage.removeItem('activeAcademicYearId');
  }
}

export function normalizeYearId(id) {
  return id == null ? '' : String(id);
}
