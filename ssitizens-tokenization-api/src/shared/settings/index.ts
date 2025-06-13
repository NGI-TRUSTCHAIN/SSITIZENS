import './load.js';
import {
  getBoolean,
  getNumber,
  getOptionalString,
  getString,
  getStringArray,
} from './utils.js';

export const FRAMEWORK_SETTINGS = {
  port: getNumber('port'),
  api: {
    path: getOptionalString('api:path'),
  },
  request: {
    sizeLimit: getString('request:sizelimit'),
  },
  cache: {
    default: {
      ttl: getNumber('cache:default:ttl'),
      checkPeriod: getNumber('cache:default:checkperiod'),
    },
  },
  redis: {
    url: getOptionalString('redis:url'),
  },
  logs: {
    console: {
      active: getBoolean('logs:console:active'),
      level: getString('logs:console:level'),
    },
    file: {
      active: getBoolean('logs:file:active'),
      level: getString('logs:file:level'),
      path: getString('logs:file:path'),
    },
  },
  language: {
    allowed: getStringArray('language:allowed'),
    default: getString('language:default'),
    location: getString('language:location'),
  },
};
