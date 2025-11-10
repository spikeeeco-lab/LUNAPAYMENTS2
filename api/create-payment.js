import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST allowed" });
  }

  try {
    const { amount } = req.body;

    const merchantId = process.env.MERCHANT_ID;
    const projectCode = process.env.PROJECT_CODE;
    const apiSecret = process.env.API_SECRET;

    const orderNo = "ORD" + Date.now();
    const notifyUrl = "https://lunapayments2.vercel.app/api/payment-callback";
    const returnUrl = "https://lunapayments2.vercel.app/success";

    // ✅ Step 1: Required parameters for India
    const params = {
      api_key: merchantId,                   // Merchant ID
      amount: parseFloat(amount).toFixed(2), // Amount in decimal format
      code: "in_upi",                        // <-- Replace with your real channel code from LPay
      merchant_order_no: orderNo,            // Unique order ID
      notify_url: notifyUrl,                 // Server notification URL
      return_url: returnUrl,                 // Redirect after payment
    };

    // ✅ Step 2: Sort parameters alphabetically for signing
    const sortedKeys = Object.keys(params).sort();
    const paramString = sortedKeys.map(k => `${k}=${params[k]}`).join("&");

    // ✅ Step 3: Generate MD5 signature
    const sign = crypto
      .createHash("md5")
      .update(paramString + apiSecret)
      .digest("hex")
      .toUpperCase();

    // ✅ Step 4: Final payload (add sign)
    const payload = { ...params, sign };

    // ✅ Step 5: Send request to LPay
    const response = await fetch("https://www.lpay.win/api/v1/pay/in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log("LPay Response:", data);

    // ✅ Step 6: Return LPay response to browser
    return res.status(200).json({
      success: false,
      message: JSON.stringify(data),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}
