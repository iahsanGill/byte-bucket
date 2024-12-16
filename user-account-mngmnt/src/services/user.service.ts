import * as argon2 from "argon2";
import { User } from "../models/user.model";
import { generateToken } from "../utils/jwt.util";

export const registerUser = async (
  username: string,
  email: string,
  password: string
) => {
  if (!username || !email || !password) {
    throw new Error("All fields are required");
  }

  try {
    const hashedPassword = await argon2.hash(password);
    const user = new User({ username, email, password: hashedPassword });
    const savedUser = await user.save();
    return savedUser;
  } catch (error) {
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
      return generateToken(user._id.toString());
    }
    return null;
  } catch (error) {
    throw new Error(`${error.message}`);
  }
};
