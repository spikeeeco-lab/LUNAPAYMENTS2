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

    // required parameters
    const params = {
      api_key: merchantId,
      project_code: projectCode,
      amount,
      merchant_order_no: orderNo,
      currency: "INR",
      goods_name: "Test Payment",
      notify_url: notifyUrl,
      return_url: returnUrl,
    };

    // sign generation
    const sorted = Object.keys(params).sort();
    const paramString = sorted.map(k => `${k}=${params[k]}`).join("&");
    const sign = crypto.createHash("md5").update(paramString + apiSecret).digest("hex").toUpperCase();

    const payload = { ...params, sign };

    // send to LPay
    const response = await fetch("https://www.lpay.win/api/v1/pay/in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log("LPay Response:", data);

    return res.status(200).json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}
