export async function initializePayment(req, res) {
  const { email, amount } = req.body;

  // Basic guard — amount comes from the frontend but we validate it here
  if (!email || !amount || amount <= 0) {
    return res
      .status(400)
      .json({ error: "Email and a valid amount are required." });
  }

  try {
    // FIXED: Point to your actual Netlify frontend instead of the Render backend URL
    const FRONTEND_URL = "https://noskiprecords.netlify.app";

    // Call Paystack to create a payment session
    const response = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          amount: Math.round(amount * 100), // Paystack works in cents/subunits (e.g. 100 KES = 10000 cents)
          currency: "KES", // 🔥 CHANGED: Updated from USD to Kenya Shillings
          callback_url: `${FRONTEND_URL}/success.html`,
        }),
      },
    );

    const data = await response.json();

    // CRITICAL FIX: If Paystack rejects it, log the real message to Render logs so you can see it
    if (!data.status) {
      console.error("Paystack API Rejected Request:", data.message || data);
      return res.status(500).json({
        error: "Payment initialization failed.",
        details: data.message,
      });
    }

    // Return the reference and authorization URL to the frontend
    res.json({
      reference: data.data.reference,
      authorizationUrl: data.data.authorization_url,
    });
  } catch (err) {
    console.error("Payment init error:", err.message);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}

export async function verifyPayment(req, res) {
  const { reference } = req.params;

  if (!reference) {
    return res.status(400).json({ error: "Reference is required." });
  }

  try {
    // Ask Paystack if this payment actually went through
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      },
    );

    const data = await response.json();

    if (!data.status || data.data.status !== "success") {
      return res.status(400).json({ error: "Payment not verified." });
    }

    // Payment confirmed — return the details to frontend
    res.json({
      success: true,
      amount: data.data.amount / 100, // convert back from cents/subunits
      email: data.data.customer.email,
    });
  } catch (err) {
    console.error("Payment verify error:", err.message);
    res.status(500).json({ error: "Verification failed." });
  }
}
