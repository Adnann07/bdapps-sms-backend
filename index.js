const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;

// Root route
app.get('/', (req, res) => {
  res.send('BDApps subscription server is running.');
});

app.post('/subscribe', async (req, res) => {
  const { mobile } = req.body;
  if (!mobile) {
    return res.status(400).json({ status: 'error', message: 'Mobile number is required' });
  }

  const payload = {
    applicationId: process.env.APP_ID,
    password: process.env.APP_PASSWORD,
    subscriberId: `tel:${mobile}`,
    amount: "2",
    externalTrxId: `TXN_${Date.now()}`,
  };

  try {
    const response = await axios.post(
      'https://developer.bdapps.com/caas/direct/debit',
      payload,
      { headers: { 'Content-Type': 'application/json' } }
    );

    const result = response.data;

    if (result.statusCode === "S1000") {
      res.json({ status: "success", message: "Purchase successful!" });
    } else {
      res.json({ status: "fail", message: result.statusDetail || "Unknown error" });
    }

  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({
      status: "error",
      message: error.response?.data || error.message,
    });
  }
});


app.listen(PORT, () => {
  console.log(`✅ BDApps Subscription API running on port ${PORT}`);
});

