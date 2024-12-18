import axios from "axios";
import { Request, Response, NextFunction } from "express";

// URL of the User Service validate endpoint
const USER_SERVICE_URL = process.env.USER_SERVICE_URL;

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Extract the token from the Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];

    // Validate the token by calling the User Service
    const response = await axios.get(`${USER_SERVICE_URL}/validate`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Extract user ID from the response
    const { userId } = response.data;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized: Invalid token" });
    }

    // Attach user ID to the request object
    req.params.userId = userId;

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error("Authentication error:", error.message);
    res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};
