const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

// Replace with your Klaviyo Private API Key
const KLAVIYO_API_KEY = "Ypk_dcda3f8dbd600429ab129e83e7712f8278";

// Helper function to send events to Klaviyo
async function sendToKlaviyo(eventName, customerEmail, eventProperties) {
    try {
        const response = await axios.post(
            'https://a.klaviyo.com/api/events/',
            {
                data: {
                    type: "event",
                    attributes: {
                        profile: { email: customerEmail },
                        metric: { name: eventName },
                        properties: eventProperties,
                        time: new Date().toISOString()
                    }
                }
            },
            {
                headers: {
                    'Authorization': `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        console.log(`✅ Sent ${eventName} to Klaviyo for ${customerEmail}`);
    } catch (err) {
        console.error(`❌ Error sending event:`, err.response?.data || err.message);
    }
}

// Shopify webhook: Order Created
app.post('/order-created', async (req, res) => {
    const order = req.body;
    await sendToKlaviyo("Order Created", order.email, {
        orderId: order.id,
        total: order.total_price,
        currency: order.currency,
        items: order.line_items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price
        }))
    });
    res.sendStatus(200);
});

// Shopify webhook: Order Cancelled
app.post('/order-cancelled', async (req, res) => {
    const order = req.body;
    await sendToKlaviyo("Order Cancelled", order.email, {
        orderId: order.id,
        cancelledAt: order.cancelled_at,
        reason: order.cancel_reason
    });
    res.sendStatus(200);
});
// url of the server    :

app.listen(3000, () => console.log("🚀 Server running on port 3000"));
