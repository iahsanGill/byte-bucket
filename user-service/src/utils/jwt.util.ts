import jwt from "jsonwebtoken";
import logEvent from "./log.util";

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

export const generateToken = (userId: string): string => {
  try {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "1h" });
  } catch (err) {
    logEvent("error", "Token generation failed", { userId });
    throw new Error("Token generation failed");
  }
};

export const verifyToken = (token: string): { userId: string } | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch (err) {
    logEvent("error", "Token verification failed", { token });
    return null;
  }
};
