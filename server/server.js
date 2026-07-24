import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";

import connectDB from "./configs/db.js";
import connectCloudinary from "./configs/cloudinary.js";

import authRoutes from "./routes/authRoute.js";
import postRoutes from "./routes/postRoute.js";
import donationRoutes from "./routes/donationRoute.js";
import verificationRoutes from "./routes/verificationRoute.js";
import proofOfWorkRoutes from "./routes/proofOfWorkRoute.js";
import moderationRoutes from "./routes/moderationRoute.js";

import { errorHandler } from "./middleware/errorHandler.js";

// ======================================================
// Load Environment Variables
// ======================================================
dotenv.config();

// ======================================================
// Initialize Express App
// ======================================================
const app = express();
const PORT = process.env.PORT || 5000;

// ======================================================
// Allowed Frontend Origins
// ======================================================
const allowedOrigins = [
  "http://localhost:5173", // Vite dev server
  // add the production client origin here once deployed
];

// ======================================================
// Connect to MongoDB + Cloudinary
// ======================================================
await connectDB();
await connectCloudinary();

// ======================================================
// Global Middlewares
// ======================================================
app.use(helmet());
app.use(compression());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// ======================================================
// Health Check Route
// ======================================================
app.get("/", (req, res) => {
  res.json({ status: "ok", service: "ayuda-server" });
});

// ======================================================
// API Routes
// ======================================================
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/verification", verificationRoutes);
app.use("/api/proof-of-work", proofOfWorkRoutes);
app.use("/api/moderation", moderationRoutes);

// ======================================================
// 404 + Error Handling (must be mounted last)
// ======================================================
app.use((req, res) => {
  res.status(404).json({ error: { code: "NOT_FOUND", message: "Route not found" } });
});
app.use(errorHandler);

// ======================================================
// Start Server
// ======================================================
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
