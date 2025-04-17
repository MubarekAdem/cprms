import { connectToDB } from "./mongodb";
import OTP from "@/models/OTP";
import { sendOTPEmail } from "./email";

export const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

export const sendVerificationOTP = async (email) => {
  await connectToDB();

  // Delete any existing OTP for this email
  await OTP.deleteMany({ email });

  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

  await OTP.create({
    email,
    otp,
    expiresAt,
  });

  const emailSent = await sendOTPEmail(email, otp);
  if (!emailSent) {
    throw new Error("Failed to send OTP email");
  }

  return true;
};

export const verifyOTP = async (email, otp) => {
  await connectToDB();

  const otpRecord = await OTP.findOne({
    email,
    otp,
    expiresAt: { $gt: new Date() },
  });

  if (!otpRecord) {
    throw new Error("Invalid or expired OTP");
  }

  // Delete the used OTP
  await OTP.deleteOne({ _id: otpRecord._id });

  return true;
};
