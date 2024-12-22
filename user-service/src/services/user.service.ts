import * as argon2 from "argon2";
import { User } from "../models/user.model";
import { generateToken } from "../utils/jwt.util";
import logEvent from "../utils/log.util";

export const registerUser = async (
  username: string,
  email: string,
  password: string
) => {
  if (!username || !email || !password) {
    logEvent("error", "Registration failed: missing fields", {
      username,
      email,
    });
    throw new Error("All fields are required");
  }

  try {
    const hashedPassword = await argon2.hash(password);
    const user = new User({ username, email, password: hashedPassword });
    const savedUser = await user.save();
    logEvent("info", "User registered successfully", {
      userId: savedUser._id.toString(),
    });
    return savedUser;
  } catch (error) {
    logEvent("error", "Registration failed", {
      username,
      email,
      error: error.message,
    });
    throw new Error(`${error.message}`);
  }
};

export const loginUser = async (
  email: string,
  password: string
): Promise<string | null> => {
  try {
    const user = await User.findOne({ email });
    if (user && (await argon2.verify(user.password, password))) {
      const token = generateToken(user._id.toString());
      logEvent("info", "User logged in successfully", {
        userId: user._id.toString(),
      });
      return token;
    }
    logEvent("error", "Login failed: invalid credentials", { email });
    return null;
  } catch (error) {
    logEvent("error", "Login failed", { email, error: error.message });
    throw new Error(`${error.message}`);
  }
};
