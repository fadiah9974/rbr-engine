const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const formDataMiddleware = require("./middleware/formDataMiddleware");

const authRoutes = require("./routes/authRoutes");
const superAdminRoutes = require("./routes/superAdminRoutes");
const variableRoutes = require("./routes/variableRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const organizationRoutes = require("./routes/organizationRoutes");
const ruleRoutes = require("./routes/ruleRoutes");
const caseRoutes = require("./routes/caseRoutes");

const app = express();

/**
 * CORS harus diletakkan sebelum semua route API.
 * Frontend Vercel kamu sekarang berjalan di:
 * https://web-rbr.vercel.app
 */
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://web-rbr.vercel.app",
  "https://rbr-engine.vercel.app",
];

const corsOptions = {
  origin: function (origin, callback) {
    // Izinkan request tanpa origin seperti Postman, curl, server-to-server
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(formDataMiddleware);

app.use(helmet());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({
    message: "RBR Engine API is running",
    status: "success",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    message: "Backend connected successfully",
    status: "ok",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/superadmin", superAdminRoutes);
app.use("/api/variables", variableRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/rules", ruleRoutes);
app.use("/api/cases", caseRoutes);
app.use("/api/organizations", organizationRoutes);

module.exports = app;