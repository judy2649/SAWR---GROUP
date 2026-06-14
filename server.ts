import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import "dotenv/config";

// In-Memory caches for Pesapal Token & IPN callback logs
let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

interface IpnLog {
  timestamp: string;
  query: any;
  body: any;
}
const ipnLogs: IpnLog[] = [];

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Use JSON body parser
  app.use(express.json());

  // API Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // --- PESAPAL V3 API INTEGRATION PROXIES ---
  
  // Helper to fetch/refresh OAuth Token from Pesapal V3
  async function getPesapalToken(baseUrl: string, consumerKey: string, consumerSecret: string): Promise<string> {
    if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
      return cachedToken;
    }
    
    const url = `${baseUrl.replace(/\/$/, "")}/api/Auth/RequestToken`;
    console.log(`[Pesapal Auth] Fetching fresh token from ${url}`);
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        consumer_key: consumerKey,
        consumer_secret: consumerSecret
      })
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Authentication with Pesapal failed (${response.status}): ${text}`);
    }

    const data: any = await response.json();
    if (data.token) {
      cachedToken = data.token;
      // Tokens are typically valid for 30 minutes, prune cache 5 min early
      tokenExpiry = Date.now() + 25 * 60 * 1000;
      console.log("[Pesapal Auth] Token received and cached successfully.");
      return data.token;
    }
    
    throw new Error(`Token key not present in response: ${JSON.stringify(data)}`);
  }

  // 1. Authenticate -> Request OAuth Token
  app.post("/api/pesapal/auth", async (req, res) => {
    try {
      const baseUrl = req.body.baseUrl || process.env.PESAPAL_BASE_URL || "https://cyb.pesapal.com/pesapalv3";
      const key = req.body.consumerKey || process.env.PESAPAL_CONSUMER_KEY || "2JqeVDwDRH4V/vQc1KRfvzcZbDFmHTzE";
      const secret = req.body.consumerSecret || process.env.PESAPAL_CONSUMER_SECRET || "P3kcwRAOckwPFqdM6DldUWjcdZ4=";
      
      const token = await getPesapalToken(baseUrl, key, secret);
      res.json({
        success: true,
        token,
        baseUrlUsed: baseUrl,
        message: "Successfully authenticated with Pesapal V3."
      });
    } catch (error: any) {
      console.error("[Pesapal Auth Proxy Error]:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // 2. Register IPN URL -> Tell Pesapal where to send payment notifications
  app.post("/api/pesapal/register-ipn", async (req, res) => {
    try {
      const baseUrl = req.body.baseUrl || process.env.PESAPAL_BASE_URL || "https://cyb.pesapal.com/pesapalv3";
      const key = req.body.consumerKey || process.env.PESAPAL_CONSUMER_KEY || "2JqeVDwDRH4V/vQc1KRfvzcZbDFmHTzE";
      const secret = req.body.consumerSecret || process.env.PESAPAL_CONSUMER_SECRET || "P3kcwRAOckwPFqdM6DldUWjcdZ4=";
      
      let ipnUrl = req.body.ipnUrl;
      // Auto-fallback to public host if not provided
      if (!ipnUrl) {
        const host = req.get("host") || "ais-dev-pko5nvfxqsukir4exclxtv-756500152085.europe-west2.run.app";
        const protocol = req.secure || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
        ipnUrl = `${protocol}://${host}/api/pesapal/ipn`;
      }

      console.log(`[Pesapal IPN] Registering IPN URL: ${ipnUrl}`);
      const token = await getPesapalToken(baseUrl, key, secret);
      
      const registerUrl = `${baseUrl.replace(/\/$/, "")}/api/Services/RegisterIPN`;
      const response = await fetch(registerUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          url: ipnUrl,
          ipn_notification_type: "GET" // Pesapal sends status updates via GET
        })
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Register IPN failed (${response.status}): ${text}`);
      }

      const ipnData = await response.json();
      res.json({
        success: true,
        ipnData,
        registeredUrl: ipnUrl
      });
    } catch (error: any) {
      console.error("[Pesapal Register IPN Proxy Error]:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // 3. Submit Order Request -> Create a checkout session
  app.post("/api/pesapal/submit-order", async (req, res) => {
    try {
      const baseUrl = req.body.baseUrl || process.env.PESAPAL_BASE_URL || "https://cyb.pesapal.com/pesapalv3";
      const key = req.body.consumerKey || process.env.PESAPAL_CONSUMER_KEY || "2JqeVDwDRH4V/vQc1KRfvzcZbDFmHTzE";
      const secret = req.body.consumerSecret || process.env.PESAPAL_CONSUMER_SECRET || "P3kcwRAOckwPFqdM6DldUWjcdZ4=";
      
      const order = req.body.order;
      if (!order) {
        return res.status(400).json({ success: false, error: "Missing 'order' payload in request body." });
      }

      console.log(`[Pesapal Order] Submitting order reference: ${order.id}`);
      const token = await getPesapalToken(baseUrl, key, secret);
      
      const submitUrl = `${baseUrl.replace(/\/$/, "")}/api/Transactions/SubmitOrderRequest`;
      const response = await fetch(submitUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(order)
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Submit order failed (${response.status}): ${text}`);
      }

      const submitData = await response.json();
      res.json({
        success: true,
        submitData
      });
    } catch (error: any) {
      console.error("[Pesapal Submit Order Proxy Error]:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // 4. Get Transaction Status -> Verify payment
  app.get("/api/pesapal/transaction-status", async (req, res) => {
    try {
      const baseUrl = req.query.baseUrl as string || process.env.PESAPAL_BASE_URL || "https://cyb.pesapal.com/pesapalv3";
      const key = req.query.consumerKey as string || process.env.PESAPAL_CONSUMER_KEY || "2JqeVDwDRH4V/vQc1KRfvzcZbDFmHTzE";
      const secret = req.query.consumerSecret as string || process.env.PESAPAL_CONSUMER_SECRET || "P3kcwRAOckwPFqdM6DldUWjcdZ4=";
      const orderTrackingId = req.query.orderTrackingId as string;
      
      if (!orderTrackingId) {
        return res.status(400).json({ success: false, error: "Missing 'orderTrackingId' query parameter." });
      }

      console.log(`[Pesapal Status] Querying order tracking status: ${orderTrackingId}`);
      const token = await getPesapalToken(baseUrl, key, secret);
      
      const statusUrl = `${baseUrl.replace(/\/$/, "")}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`;
      const response = await fetch(statusUrl, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Fetch transaction status failed (${response.status}): ${text}`);
      }

      const statusData = await response.json();
      res.json({
        success: true,
        statusData
      });
    } catch (error: any) {
      console.error("[Pesapal Transaction Status Proxy Error]:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // 5. IPN Endpoint -> Pesapal webhooks
  app.all("/api/pesapal/ipn", (req, res) => {
    console.log("[Pesapal IPN Webhook Hit] Received payload:", { query: req.query, body: req.body });
    
    const logItem: IpnLog = {
      timestamp: new Date().toISOString(),
      query: req.query || {},
      body: req.body || {}
    };
    
    ipnLogs.unshift(logItem);
    if (ipnLogs.length > 50) {
      ipnLogs.pop(); // Keep log tidy
    }

    // Return exact status success expected by Pesapal to acknowledge IPN
    res.status(200).json({
      received: true,
      status: "200",
      ipnNotificationId: req.query.OrderTrackingId || req.body.OrderTrackingId || "unknown"
    });
  });

  // 6. Expose IPN local logs for testing visualizers
  app.get("/api/pesapal/ipn-logs", (req, res) => {
    res.json({
      success: true,
      logs: ipnLogs
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
