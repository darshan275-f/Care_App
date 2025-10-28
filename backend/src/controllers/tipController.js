const tips = [
  'Take a 10-minute walk to refresh your mind and body.',
  'Drink a glass of water now and stay hydrated.',
  'Practice 5 deep breaths: inhale 4s, hold 4s, exhale 6s.',
  'Aim for 7-8 hours of sleep tonight for recovery.',
  'Celebrate small wins—progress over perfection!',
  'Stretch your neck and shoulders to relieve tension.',
  'Include a serving of fruit or veggies in your next meal.',
  'Take a short break from your screen and blink consciously.',
  'Write down one thing you’re grateful for today.',
  'Maintain consistent medication times for best results.',
];

exports.getDailyTip = (req, res) => {
  const index = Math.floor(Math.random() * tips.length);
  res.json({ success: true, data: { tip: tips[index] } });
};


