require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

// Allowed origins
const allowedOrigins = [
  "https://learning-management-system-ztyd.onrender.com",
  "http://localhost:3000",
  "http://localhost:5173",
  process.env.FRONTEND_URL
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin) || process.env.NODE_ENV !== "production") {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Explicit header fallback middleware for all requests and preflights
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

app.use(express.json());

const connectMongo = require("./config/mongo");
const pool = require("./config/postgres");
connectMongo();

app.get("/", (req, res) => {
  res.send("LMS API is running...");
});

app.use("/auth", require("./modules/auth/auth.routes"));
app.use("/courses", require("./modules/courses/courses.routes"));
app.use("/lessons", require("./modules/lessons/lessons.routes"));
app.use("/progress", require("./modules/progress/progress.routes"));
app.use("/users", require("./modules/users/users.routes"));
app.use("/audit", require("./modules/audit/audit.routes"));

// Global Error Handling Middleware with CORS headers
app.use((err, req, res, next) => {
  console.error("Global Server Error:", err);
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error"
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});