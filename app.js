const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

dotenv.config({
  path: path.join(__dirname, "config", "config.env")
});

const app = express();
app.set("trust proxy", 1);

// const allowedOrigins = [
//   "https://alphaegifts.com",
//   "https://www.alphaegifts.com",
//   "http://159.198.40.81",
//   "http://localhost:8000",
//   "http://localhost:5173"
// ];

app.use(cors({
  origin: function (origin, callback) {

    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("Blocked by CORS:", origin);
      callback(null, false);
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));

app.options(/.*/, cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use('/eCom', require('./routes/userRoutes'));


console.log("MONGO_URI:", process.env.MONGO_URI);
console.log("PORT:", process.env.PORT);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });


app.get("/s", (req, res) => {
  res.json({ message: "Backendfg running " });
});

// Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION ", err);
});

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED PROMISE REJECTION ", err);
});
