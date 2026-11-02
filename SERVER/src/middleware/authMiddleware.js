import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/user.model.js";

export const AuthProtect = async (req, res, next) => {
  try {
    const token = req.cookies.Oreo;
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
    next(error);
  }
};

export const OTPAuthProtect = async (req, res, next) => {
  try {
    const token = req.cookies.kitkat;
    if (!token) {
      const error = new Error("Session Expired");
      error.statusCode = 401;
      return next(error);
    }

    // console.log("Token From MiddleWare : ", token);

    const decode = await jwt.verify(token, process.env.JWT_SECRET);
    if (!decode) {
      const error = new Error("Session Expired");
      error.statusCode = 401;
      return next(error);
    }

    // console.log("Decode:", decode);

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
    console.log(error.message);
    next(error);
  }
};