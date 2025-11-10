import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ message: 'Method not allowed' });

  const { amount } = req.body;
  const merchantId = process.env.MERCHANT_ID;
  const projectCode = process.env.PROJECT_CODE;
  const apiSecret = process.env.API_SECRET;

  const orderNo = "ORD" + Date.now();
  const notifyUrl = "https://lunapayments2.vercel.app/api/payment-callback"; // optional
  const returnUrl = "https://lunapayments2.vercel.app/success"; // redirect page

  const params = {
    amount: amount,
    api_key: merchantId,
    merchant_order_no: orderNo,
    notify_url: notifyUrl,
    return_url: returnUrl,
    currency: "INR"
  };

  const sortedKeys = Object.keys(params).sort();
  const paramString = sortedKeys.map(k => `${k}=${params[k]}`).join('&');
  const signString = paramString + apiSecret;
  const sign = crypto.createHash('md5').update(signString).digest('hex').toUpperCase();

  const payload = { ...params, sign };

  try {
    const response = await fetch('https://www.lpay.win/api/v1/pay/in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Payment API error' });
  }
}
