import { Request, Response } from "express";
import { Authorized, AuthorizationState, FORBIDDEN, getAuthHeader, UNAUTHORIZED, AuthMethod } from "../index.js";

export const API_KEY_HEADER_NAME = "x-api-key";

export function ApiKey(expectedApiKey?: string, headerName?: string): AuthMethod {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return async (req: Request, res: Response): Promise<AuthorizationState> => {
    headerName = headerName || API_KEY_HEADER_NAME;

    if (!expectedApiKey) {
      return UNAUTHORIZED;
    }

    const receivedApiKey = getAuthHeader(req, headerName);
    if (!receivedApiKey) {
      return UNAUTHORIZED;
    }

    // TODO: cambiar esto por una función externa
    if (receivedApiKey !== expectedApiKey) {
      return FORBIDDEN
    }

    const result : Authorized = {
      type: "AuthorizedState",
      authorized: true,
      authorizationType: {
        type: "ApiKey",
        apiKey: receivedApiKey
      }
    };
    return result;

  };
}
