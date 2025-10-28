import axios from 'axios';

const BACKEND_URL = 'http://10.100.235.52:5000'; // change to your backend IP if using device

export const extractMedicineInfoFromBackend = async (ocrText) => {
  try {
    const response = await axios.post(`${BACKEND_URL}/extract-medicine`, { ocrText });
    console.log('Backend response:', response.data);
    console.log('Medicine info:', response.data.medicineInfo);
    return response.data.medicineInfo;
  } catch (err) {
    console.error('Backend extraction error:', err.response?.data || err.message);
    return null;
  }
};
