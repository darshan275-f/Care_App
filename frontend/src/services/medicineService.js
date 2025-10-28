export const getMedicineInfo = async (medicineName) => {
  try {
    const res = await fetch(
      `https://api.fda.gov/drug/label.json?search=openfda.generic_name:${medicineName}&limit=1`
    );
    const data = await res.json();
    if (!data.results || data.results.length === 0) return null;

    const result = data.results[0];

    return {
      brandName: result.openfda.brand_name?.[0] || medicineName,
      genericName: result.openfda.generic_name?.[0] || medicineName,
      manufacturer: result.openfda.manufacturer_name?.[0] || 'Unknown',
      dosageForm: result.openfda.dosage_form?.[0] || 'Unknown',
      route: result.openfda.route?.[0] || 'Unknown',
      purpose: result.purpose?.[0] || 'No info',
      warnings: result.warnings?.[0] || 'No warnings listed'
    };
  } catch (err) {
    console.error('getMedicineInfo error:', err);
    return null;
  }
};
