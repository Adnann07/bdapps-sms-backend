const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/sms', (req, res) => {
  console.log('📩 Received SMS:', req.body);
  res.status(200).send('SMS Received');
});

app.get('/', (req, res) => {
  res.send('🟢 BDApps SMS Webhook is Live!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
