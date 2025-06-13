import { Request } from "express";
import { JSONPath } from "jsonpath-plus";
import { JWTVerifyOptions, jwtVerify, createRemoteJWKSet } from "jose";
import {
  Authorized,
  AuthorizationState,
  FORBIDDEN,
  getAuthHeader,
  UNAUTHORIZED,
  AUTHORIZATION_HEADER,
  BEARER_TOKEN_PREFIX,
  AuthMethod,
} from "../index.js";
import { FRAMEWORK_SETTINGS } from "../../settings/index.js";

export type ClaimValue = string | number | boolean;

export type ClaimCondition = {
  jsonPath: string;
  anyOf: ClaimValue | ClaimValue[];
};

// TODO: dar soporte a otros mecanismos a parte de URL, por ejemplo, si ya lo tenemos,
// o una función para resolverlo
export function BearerToken(
  jwksUrl: string | URL | null | undefined,
  claimsConditions?: ClaimCondition | ClaimCondition[],
  verifyOptions?: JWTVerifyOptions
): AuthMethod {
  if (!jwksUrl) {
    return async () => UNAUTHORIZED;
  }

  if (typeof jwksUrl === "string") {
    jwksUrl = new URL(jwksUrl);
  }
  // TODO: usar otra configuración para esta caché, habitualmente más larga
  const jwksCacheTTLms = FRAMEWORK_SETTINGS.cache.default.ttl * 1000;
  const jwks = createRemoteJWKSet(jwksUrl, { cacheMaxAge: jwksCacheTTLms });

  return async (req: Request): Promise<AuthorizationState> => {
    const token = getAuthHeader(req, AUTHORIZATION_HEADER, BEARER_TOKEN_PREFIX);

    if (!token) {
      return UNAUTHORIZED;
    }

    try {
      const verifiedToken = await jwtVerify(token, jwks, verifyOptions);
      const payload = verifiedToken.payload;
      const jsonString = JSON.stringify(payload);
      const json = JSON.parse(jsonString);
      if (claimsConditions) {
        if (!claimsAreValid(json, claimsConditions)) {
          return FORBIDDEN;
        }
      }
      const result: Authorized = {
        type: "AuthorizedState",
        authorized: true,
        authorizationType: {
          type: "JWT",
          jwtPayload: payload,
        },
      };
      return result;
    } catch (err: unknown) {
      return FORBIDDEN;
    }
  };
}

function claimsAreValid(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  json: any,
  claimsConditions: ClaimCondition | ClaimCondition[]
): boolean {
  if (Array.isArray(claimsConditions)) {
    return claimsConditions.every((claimCondition) =>
      testClaimCondition(json, claimCondition)
    );
  } else {
    return testClaimCondition(json, claimsConditions);
  }
}

function testClaimCondition(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  json: any,
  claimCondition: ClaimCondition
): boolean {
  const result = JSONPath({
    json,
    path: claimCondition.jsonPath,
  });
  if (Array.isArray(claimCondition.anyOf)) {
    return containsAny(result, claimCondition.anyOf);
  } else {
    return containsAny(result, [claimCondition.anyOf]);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function containsAny(arr1: any[], arr2: ClaimValue[]) {
  return arr1.some(item => arr2.includes(item));
}
