const HealthData = require('../models/HealthData');

const formatDate = (d) => {
  const date = d instanceof Date ? d : new Date(d);
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const generateMock = () => {
  const heartRate = Math.floor(60 + Math.random() * 40); // 60-100 bpm
  const steps = Math.floor(3000 + Math.random() * 7000); // 3k-10k
  return { heartRate, steps };
};

exports.getToday = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId is required' });
    }

    const today = formatDate(new Date());
    let record = await HealthData.findOne({ userId, date: today });

    if (!record) {
      const mock = generateMock();
      record = await HealthData.create({ userId, date: today, ...mock });
    }

    res.json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch health data' });
  }
};


