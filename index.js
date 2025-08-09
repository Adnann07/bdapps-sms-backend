const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 80;

// Custom log to confirm new server version is running
console.log('🚀 NEW SERVER VERSION RUNNING - BDApps subscription server starting...');

app.get('/', (req, res) => {
  res.send('BDApps subscription server is running.');
});

app.post('/subscribe', async (req, res) => {
  try {
    const payload = req.body;

    if (!payload.subscriberId || !payload.accountId) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: subscriberId or accountId'
      });
    }

    if (typeof payload.subscriberId === 'string') {
      payload.subscriberId = payload.subscriberId.replace(/\s+/g, '');
    }

    console.log('Received from Flutter:', JSON.stringify(payload, null, 2));

    const response = await axios.post(
      'https://developer.bdapps.com/caas/direct/debit',
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 10000
      }
    );

    console.log("BDApps full response:", JSON.stringify(response.data, null, 2));
    const result = response.data;

    if (result.statusCode === "S1000") {
      return res.json({
        status: "success",
        message: "Subscription successful!",
        bdapps_raw: result
      });
    } else {
      return res.json({
        status: "fail",
        message: result.statusDetail || "Payment processing failed",
        bdapps_raw: result
      });
    }

  } catch (error) {
    console.error('BDApps API Error:', error.response?.data || error.message);

    return res.status(500).json({
      status: "error",
      message: error.response?.data?.statusDetail ||
               error.response?.data?.message ||
               "Payment gateway error",
      bdapps_raw: error.response?.data || error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`✅ BDApps Subscription API running on port ${PORT}`);
});
