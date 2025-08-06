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

// Handle Subscription (Direct Debit)
app.post('/subscribe', async (req, res) => {
  const { externalTrxId, amount, subscriberId, accountId } = req.body;

  try {
    const response = await axios.post(
      'https://developer.bdapps.com/caas/direct/debit',
      {
        externalTrxId,
        amount,
        applicationId: process.env.APP_ID,
        password: process.env.APP_PASSWORD,
        subscriberId: `tel:${subscriberId}`,
        currency: "BDT",
        accountId,
        paymentInstrumentName: "Mobile Account"
      }
    );

    res.json({ success: true, data: response.data });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data || error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`✅ BDApps Subscription API running on port ${PORT}`);
});
