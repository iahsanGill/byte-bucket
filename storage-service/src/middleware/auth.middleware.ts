import axios from "axios";
import { Request, Response, NextFunction } from "express";
import { subscriber } from "../../../shared/redis.util";

// URL of the User Service validate endpoint
const USER_SERVICE_URL = process.env.USER_SERVICE_URL;

const logEvent = (
  level: string,
  message: string,
  meta: Record<string, any> = {}
) => {
  const log = JSON.stringify({ level, message, meta });
  subscriber.publish("logging-channel", log);
};

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Extract the token from the Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      logEvent("warn", "Unauthorized access attempt: No token provided", {
        ip: req.ip,
      });
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
      logEvent("warn", "Unauthorized access attempt: Invalid token", {
        ip: req.ip,
      });
      res.status(401).json({ error: "Unauthorized: Invalid token" });
    }

    // Attach user ID to the request object
    req.params.userId = userId;

    // Log successful authentication
    logEvent("info", "User authenticated successfully", { userId, ip: req.ip });

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    logEvent("error", "Authentication error", {
      message: error.message,
      ip: req.ip,
    });
    res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};
