import express from "express";
import "dotenv/config";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 10000;
const VTUGATE_API_KEY = process.env.VTUGATE_API_KEY;
const VTUGATE_BASE_URL = "https://api.vtugate.com/api/v1";

app.get("/", (req, res) => {
  res.json({
    status: true,
    message: "K2 Data Sub Backend is running"
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: true,
    message: "K2 backend is healthy"
  });
});

// Duba ko API key yana nan ba tare da bayyana shi ba
app.get("/check-config", (req, res) => {
  res.json({
    status: true,
    api_key_configured: Boolean(VTUGATE_API_KEY),
    message: VTUGATE_API_KEY
      ? "API key is configured"
      : "API key is missing"
  });
});

// Karɓo jerin services daga VTUGATE
app.get("/services", async (req, res) => {
  if (!VTUGATE_API_KEY) {
    return res.status(500).json({
      status: false,
      message: "VTUGATE_API_KEY is missing in Render"
    });
  }

  try {
    const response = await fetch(
      `${VTUGATE_BASE_URL}/fetchallservices`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${VTUGATE_API_KEY}`,
          Accept: "application/json"
        },
        signal: AbortSignal.timeout(20000)
      }
    );

    const data = await response.json();

    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(502).json({
      status: false,
      message: "Could not connect to VTUGATE",
      error: error.message
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`K2 backend running on port ${PORT}`);
});
