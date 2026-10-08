import express from "express";
import "dotenv/config";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 10000;
const VTUGATE_API_KEY = process.env.VTUGATE_API_KEY;

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

app.get("/services", async (req, res) => {
  try {
    const response = await fetch(
      "https://api.vtugate.com/api/v1/fetchallservices",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${VTUGATE_API_KEY}`,
          Accept: "application/json"
        }
      }
    );

    const data = await response.json();

    res.json(data);
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Failed to connect to VTUGATE",
      error: error.message
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`K2 backend running on port ${PORT}`);
});
