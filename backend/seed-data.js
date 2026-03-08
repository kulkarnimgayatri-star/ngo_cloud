// Seeding disabled - removed dummy data to avoid accidental writes.
export async function seedInitialData() {
    console.warn('seedInitialData() called but seeding is disabled in this environment.');
    alert('Seeding is disabled. No dummy data will be added.');
    return;
}
