import { asynchandler } from "../utils/globalErrorHandling/index.js";
import { verifytoken } from "./../utils/token/verifyToken.js";
import userModel from "../DB/models/user.model.js";
import { tokenTypes } from "../middleware/enum.js";

export const decodedToken = async ({ authorization, tokenType, next }) => {
  if (!authorization) {
    return next(new Error("Authorization header is missing", { cause: 401 }));
  }

  const token = authorization;

  if (!token) {
    return next(new Error("Invalid token", { cause: 401 }));
  }

  const decoded = await verifytoken({
    token,
    SIGNATURE:
      tokenType === tokenTypes.access
        ? process.env.ACCESS_SIGNATURE
        : process.env.REFRESH_SIGNATURE,
  });

  if (!decoded?.id) {
    return next(new Error("Invalid token payload", { cause: 403 }));
  }

  const user = await userModel.findById(decoded.id);

  if (!user) {
    return next(new Error("User not founddddd", { cause: 404 }));
  }

  if (user?.isdeleted) {
    return next(new Error("User is deleted", { cause: 403 }));
  }

  const credentialsChangedAt = new Date(user.changeCredentialsTime).getTime();
  if (decoded.iat * 1000 < credentialsChangedAt) {
    return next(new Error("Token expired, please login again", { cause: 401 }));
  }

  if (user?.isbanned) {
    return next(new Error("User is banned", { cause: 403 }));
  }

  return user;
};

export const authenticate = asynchandler(async (req, res, next) => {
  const { authorization } = req.headers;

  const user = await decodedToken({
    authorization,
    tokenType: tokenTypes.access,
    next,
  });

  if (!user) {
    return next(new Error("Authentication failed", { cause: 401 }));
  }

  req.user = user;
  next();
});

export const authorization = (accessrole = []) => {
  return asynchandler(async (req, res, next) => {
    if (!accessrole.includes(req.user.role)) {
      return next(new Error("Access denied", { cause: 403 }));
    }
    next();
  });
};
