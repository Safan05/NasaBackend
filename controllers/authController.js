import userQueries from "../models/userQueries.js";
import bcrypt from "bcrypt";
import signToken from "../utils/jwtAuthToken.js";
import { sendMail } from "../utils/mailer.js";

function generateSixDigitCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

const UserRegisterController = async (req, res) => {
    try {
        const { email, password, name, age } = req.body;
        if (!email || !password || !name || !age) {
            return res.status(400).json({ message: "Email, password, name, and age are required" });
        }
        const exists = await userQueries.checkEmailExists(email);
        if (exists) {
            return res.status(409).json({ message: "Email already in use" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const userUuid = await userQueries.registerUser(email, hashedPassword, name, age);

        const code = generateSixDigitCode();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        await userQueries.setVerificationCode(email, code, expiresAt);

        try {
            await sendMail({
                to: email,
                subject: "Your verification code",
                text: `Your Elmasna3 verification code is ${code}. It expires in 10 minutes.`,
                html: `<p>Your Elmasna3 verification code is <b>${code}</b>. It expires in 10 minutes.</p>`
            });
        } catch (mailErr) {
            console.error("Failed to send verification email:", mailErr.message);
            // Still created user; allow resending later
        }

        return res.status(201).json({ message: "User registered. Verification code sent to email.", uuid: userUuid });
    } catch (err) {
        console.error("Error registering user:", err.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const ResendCodeController = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Email is required" });
        const user = await userQueries.getUserByEmail(email);
        if (!user) return res.status(404).json({ message: "User not found" });
        if (user.role !== 'none') return res.status(400).json({ message: "User already verified" });
        const code = generateSixDigitCode();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await userQueries.setVerificationCode(email, code, expiresAt);
        await sendMail({
            to: email,
            subject: "Your verification code",
            text: `Your Elmasna3 verification code is ${code}. It expires in 10 minutes.`,
            html: `<p>Your Elmasna3 verification code is <b>${code}</b>. It expires in 10 minutes.</p>`
        });
        return res.status(200).json({ message: "Verification code resent" });
    } catch (err) {
        console.error("Error resending code:", err.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const VerifyController = async (req, res) => {
    try {
        const { email, code } = req.body;
        if (!email || !code) return res.status(400).json({ message: "Email and code are required" });
        const user = await userQueries.getUserByEmail(email);
        if (!user) return res.status(404).json({ message: "User not found" });
        if (user.role !== 'none') return res.status(400).json({ message: "User already verified" });
        const age = user.age;
        const result = await userQueries.verifyCodeAndPromote(email, code,age);
        if (!result) return res.status(400).json({ message: "Invalid or expired code" });
        return res.status(200).json({ message: "Email verified. Role updated to customer" });
    } catch (err) {
        console.error("Error verifying code:", err.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const LoginController = (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }
    userQueries.getUserByEmail(email)
        .then(async (user) => {
            if (!user) {
                return res.status(401).json({ message: "Invalid email or password" });
            }
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                return res.status(401).json({ message: "Invalid email or password" });
            }
            const token = signToken(user.uuid, user.role, user.email);
            res.cookie("auth_token", token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'Strict' });
            res.status(200).json({ message: "Login successful", token });
        })
        .catch((err) => {
            console.error("Error during login:", err.message);
            res.status(500).json({ message: "Internal server error" });
        });
};
export const getMe = (req, res) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  res.status(200).json({ 
    uuid:user._id,
    email:user._email,
    role:user._role
   });
};

export default { UserRegisterController, LoginController, VerifyController, ResendCodeController, getMe };