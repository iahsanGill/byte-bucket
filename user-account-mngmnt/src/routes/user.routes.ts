import { Request, Response, Router } from "express";
import { loginUser, registerUser } from "../services/user.service";
import { verifyToken } from "../utils/jwt.util";

const router = Router();

router.post("/register", async (req: Request, res: Response) => {
  const { username, email, password } = req.body;
  try {
    const user = await registerUser(username, email, password);
    res
      .status(201)
      .json({ message: "User registered successfully", userId: user._id });
  } catch (error) {
    res
      .status(400)
      .json({ error: "Registration failed", details: error.message });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const token = await loginUser(email, password);
    if (token) {
      res
        .setHeader("Authorization", `Bearer ${token}`)
        .status(200)
        .json({ message: "Login successful" });
    } else {
      res.status(401).json({ error: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ error: "Login failed", details: error.message });
  }
});

router.get("/validate", (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(" ")[1];
  try {
    if (token) {
      const user = verifyToken(token);
      if (user) {
        res.status(200).json({ userId: user.userId });
      } else {
        res.status(401).json({ error: "Invalid token" });
      }
    } else {
      res.status(401).json({ error: "Token not found" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: "Token validation failed", details: error.message });
  }
});

export default router;
