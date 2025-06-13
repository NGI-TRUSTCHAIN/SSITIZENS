import { NextFunction, Request, Response } from "express";
import { ForbiddenError, InternalServerError, UnauthorizedError } from "../classes/errors.js";
import { JWTPayload } from "jose";

export const AUTHORIZATION_HEADER = "Authorization";
export const BEARER_TOKEN_PREFIX = "Bearer ";

export type AuthorizedWithApiKey = {
  type: "ApiKey";
  apiKey: string;
};

export type AuthorizedWithJwt = {
  type: "JWT";
  jwtPayload: JWTPayload;
};

export type AuthorizationType = AuthorizedWithApiKey | AuthorizedWithJwt;

export type Authorized = {
  type: "AuthorizedState";
  authorized: true;
  authorizationType: AuthorizationType;
};

export type Unauthorized = {
  type: "UnauthorizedState";
  authorized: false;
};

export type Forbidden = {
  type: "ForbiddenState";
  authorized: false;
};

export type AuthorizationState = Authorized | Unauthorized | Forbidden;

export const UNAUTHORIZED: Unauthorized = {
  type: "UnauthorizedState",
  authorized: false,
};

export const FORBIDDEN: Forbidden = {
  type: "ForbiddenState",
  authorized: false,
};

export type AuthMethod = ((req: Request, res: Response) => Promise<AuthorizationState>);

export function ProtectWith(
  authMethods: AuthMethod | AuthMethod[]
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!Array.isArray(authMethods)) {
      authMethods = [authMethods];
    }
    let isForbiddenState = false;
    for (const authMethod of authMethods) {
      try {
        const authState = await authMethod(req, res);
        if (authState.authorized) {
          res.locals.authorizationState = authState;
          next();
          return;
        } else if (authState.type === "ForbiddenState") {
          isForbiddenState = true;
        }
      } catch (error) {
        next(error);
      }
    }
    if (isForbiddenState) {
      next(new ForbiddenError());
    } else {
      next(new UnauthorizedError());
    }
  };
}

export function getAuthHeader(
  req: Request,
  authHeaderName: string,
  type?: string
): string | null {
  if (!authHeaderName) {
    return null;
  }

  let authHeader = req.headers[authHeaderName.toLowerCase()];
  if (!authHeader) {
    return null;
  }

  // Si se recibe una lista de headers, devolvemos el primero
  authHeader = Array.isArray(authHeader) ? authHeader[0] : authHeader;

  if (type) {
    if (!authHeader.startsWith(type)) return null;
    return authHeader.split(" ")[1];
  }

  return authHeader;
}

export function getAuthorizationState(res: Response): AuthorizationState {
  const authState = res.locals.authorizationState;
  if (!authState) {
    return UNAUTHORIZED;
  } else {
    return authState;
  }
}

export function isAuthorized(res: Response): boolean {
  const authState = getAuthorizationState(res);
  return authState.authorized;
}

export function getAuthorization(res: Response): AuthorizationType {
  const authState = getAuthorizationState(res);
  if (!authState.authorized) {
    throw new InternalServerError("Not controlled Unauthorized");
  }
  return authState.authorizationType;
}