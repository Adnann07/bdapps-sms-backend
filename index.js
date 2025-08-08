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

    // Validate mobile number format
    if (!/^8801[3-9]\d{8}$/.test(mobile)) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Invalid Bangladeshi mobile number format' 
      });
    }

    const payload = {
      applicationId: process.env.APP_ID,
      password: process.env.APP_PASSWORD,
      subscriberId: `tel:${mobile}`.replace(/\s+/g, ''), // Ensure no whitespace
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
        timeout: 10000 // 10 seconds timeout
      }
    );

    const result = response.data;

    if (result.statusCode === "S1000") {
      return res.json({ 
        status: "success", 
        message: "Subscription successful! BDT 2 charged." 
      });
    } else {
      return res.json({ 
        status: "fail", 
        message: result.statusDetail || "Payment processing failed" 
      });
    }

  } catch (error) {
    console.error('BDApps API Error:', error.response?.data || error.message);
    
    let errorMessage = "Payment service unavailable";
    if (error.response) {
      errorMessage = error.response.data?.statusDetail || 
                    error.response.data?.message || 
                    "Payment gateway error";
    } else if (error.request) {
      errorMessage = "No response from payment gateway";
    }

    return res.status(500).json({
      status: "error",
      message: errorMessage,
    });
  }
});

app.listen(PORT, () => {
  console.log(`✅ BDApps Subscription API running on port ${PORT}`);
});
