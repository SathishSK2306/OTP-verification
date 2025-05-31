import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect("mongodb://127.0.0.1:27017/myDatabase");
mongoose.connection.on("connected", () => console.log("MongoDB connected"));
mongoose.connection.on("error", (err) => console.log("MongoDB error:", err));

const userSchema = new mongoose.Schema({
  mobile: { type: String, required: true, unique: true },
  otp: { type: String },
  createdAt: { type: Date, default: Date.now, expires: 300 },
});

const User = mongoose.model("User", userSchema);

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

app.post("/api/v1/auth/login/send-otp", async (req, res) => {
  const { mobile } = req.body;
  if (!mobile || !/^\d{10}$/.test(mobile)) {
    return res.status(400).json({ error: "Invalid mobile number" });
  }

  const otp = generateOTP();

  try {
    let user = await User.findOne({ mobile });
    if (user) {
      user.otp = otp;
      user.createdAt = new Date();
      await user.save();
      console.log(`Updated OTP for ${mobile}: ${otp}`);
    } else {
      await User.create({ mobile, otp });
      console.log(`Created OTP for ${mobile}: ${otp}`);
    }
    res.json({ otp });
  } catch (err) {
    console.error("Error saving OTP:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/v1/auth/login/verify-otp", async (req, res) => {
  const { otp } = req.body;
  if (!otp) return res.status(400).json({ error: "OTP is required" });

  try {
    const user = await User.findOne({ otp });
    if (user) {
      return res.json({ message: "OTP verified successfully" });
    } else {
      return res.status(401).json({ error: "Invalid or expired OTP" });
    }
  } catch (err) {
    console.error("Error verifying OTP:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default app;
