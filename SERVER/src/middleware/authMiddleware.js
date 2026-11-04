import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/user.model.js";

export const AuthProtect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const bearerToken =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null;
    const token = req.cookies?.Oreo || bearerToken;

    if (!token) {
      const error = new Error("Session Expired");
      error.statusCode = 401;
      return next(error);
    }
    const decode = await jwt.verify(token, process.env.JWT_SECRET);
    if (!decode) {
      const error = new Error("Invalid Token");
      error.statusCode = 401;
      return next(error);
    }

    let verifiedUser = null;
    if (mongoose.connection.readyState === 1) {
      try {
        verifiedUser = await User.findById(decode.id);
      } catch (dbErr) {
        console.warn("⚠️ User DB lookup skipped:", dbErr.message);
      }
    }

    req.user = verifiedUser || { _id: decode.id };
    next();
  } catch (error) {
    console.log("Error In AuthProtect Middleware: ", error.message);
    if (error.name === "TokenExpiredError" || error.name === "JsonWebTokenError") {
      error.statusCode = 401;
      error.message = "Session Expired";
    }
    next(error);
  }
};

export const OTPAuthProtect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const bearerToken =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null;
    const token = req.cookies?.kitkat || bearerToken;

    if (!token) {
      const error = new Error("Session Expired");
      error.statusCode = 401;
      return next(error);
    }

    const decode = await jwt.verify(token, process.env.JWT_SECRET);
    if (!decode) {
      const error = new Error("Session Expired");
      error.statusCode = 401;
      return next(error);
    }

    let verifiedUser = null;
    if (mongoose.connection.readyState === 1) {
      try {
        verifiedUser = await User.findById(decode.id);
      } catch (dbErr) {
        console.warn("⚠️ User DB lookup skipped:", dbErr.message);
      }
    }
    req.user = verifiedUser || { _id: decode.id };
    next();

  } catch (error) {
    console.log("Error In OTPAuthProtect Middleware: ", error.message);
    if (error.name === "TokenExpiredError" || error.name === "JsonWebTokenError") {
      error.statusCode = 401;
      error.message = "Session Expired";
    }
    next(error);
  }
};
