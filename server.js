import express from "express";
import "dotenv/config";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 10000;
const VTUGATE_API_KEY = process.env.VTUGATE_API_KEY;
const VTUGATE_BASE_URL = "https://api.vtugate.com/api/v1";

async function vtugateRequest(endpoint, params = {}) {
  if (!VTUGATE_API_KEY) {
    throw new Error("VTUGATE_API_KEY is missing in Render");
  }

  const response = await fetch(`${VTUGATE_BASE_URL}/${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${VTUGATE_API_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json"
    },
    body: new URLSearchParams(params),
    signal: AbortSignal.timeout(20000)
  });

  const data = await response.json();

  return {
    httpStatus: response.status,
    data
  };
}

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

app.get("/check-config", (req, res) => {
  res.json({
    status: true,
    api_key_configured: Boolean(VTUGATE_API_KEY),
    message: VTUGATE_API_KEY
      ? "API key is configured"
      : "API key is missing"
  });
});

app.get("/services", async (req, res) => {
  try {
    const result = await vtugateRequest("fetchallservices");

    res.status(result.httpStatus).json(result.data);
  } catch (error) {
    res.status(502).json({
      status: false,
      message: "Could not fetch services from VTUGATE",
      error: error.message
    });
  }
});

app.get("/dataplans", async (req, res) => {
  const serviceId = req.query.service_id;

  if (!serviceId || !/^\d+$/.test(String(serviceId))) {
    return res.status(400).json({
      status: false,
      message: "Please provide a valid service_id"
    });
  }

  try {
    const result = await vtugateRequest("fetchdataplans", {
      service_id: String(serviceId)
    });

    res.status(result.httpStatus).json(result.data);
  } catch (error) {
    res.status(502).json({
      status: false,
      message: "Could not fetch data plans from VTUGATE",
      error: error.message
    });
  }
});app.post("/buydata", async (req, res) => {
  const { service_id, plan_code, phone } = req.body;

  if (
    !service_id ||
    !/^\d+$/.test(String(service_id)) ||
    !plan_code ||
    !/^[a-zA-Z0-9_-]+$/.test(String(plan_code)) ||
    !phone ||
    !/^0\d{10}$/.test(String(phone))
  ) {
    return res.status(400).json({
      status: false,
      message: "Provide valid service_id, plan_code and 11-digit phone"
    });
  }

  try {
    const result = await vtugateRequest("buydata", {
      service_id: String(service_id),
      plan_code: String(plan_code),
      phone: String(phone)
    });

    return res.status(result.httpStatus).json(result.data);
  } catch (error) {
    return res.status(502).json({
      status: false,
      message: "Could not complete VTUGATE data request",
      error: error.message
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`K2 backend running on port ${PORT}`);
});
