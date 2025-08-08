const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 80;

// Improved error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ status: 'error', message: 'Internal server error' });
});

app.get('/', (req, res) => {
  res.send('BDApps subscription server is running.');
});

app.post('/subscribe', async (req, res) => {
  try {
    const { mobile } = req.body;
    
    if (!mobile) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Mobile number is required' 
      });
    }

    if (!/^8801[3-9]\d{8}$/.test(mobile)) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Invalid Bangladeshi mobile number format' 
      });
    }

    const payload = {
      applicationId: process.env.APP_ID,
      password: process.env.APP_PASSWORD,
      subscriberId: `tel:${mobile}`.replace(/\s+/g, ''),
      amount: "2",
      externalTrxId: `TXN_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      paymentInstrumentName: "Mobile Account",
      currency: "BDT"
    };

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
        message: "Subscription successful! BDT 2 charged.",
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
