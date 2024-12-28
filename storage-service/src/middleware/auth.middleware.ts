import axios from "axios";
import { Request, Response, NextFunction } from "express";
import logEvent from "../utils/log.util";

// URL of the User Service validate endpoint
const USER_SERVICE_URL = process.env.USER_SERVICE_URL;

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Extract the token from the cookies
    const token = req.cookies.token;

    if (!token) {
      logEvent("warn", "Unauthorized access attempt: No token provided", {
        ip: req.ip,
      });
      res.status(401).json({ error: "Unauthorized: No token provided" });
      return;
    }

    // Validate the token by calling the User Service
    let response;
    try {
      response = await axios.get(`${USER_SERVICE_URL}/validate`, {
        // Pass the token as a cookie
        headers: { Cookie: `token=${token}` },
      });
    } catch (error) {
      throw new Error(`Failed to call User Service: ${error.message}`);
    }

    // Extract user ID from the response
    const { userId } = response.data;

    if (!userId) {
      logEvent("warn", "Unauthorized access attempt: Invalid token", {
        ip: req.ip,
      });
      res.status(401).json({ error: "Unauthorized: Invalid token" });
      return;
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
    return;
  }
};
