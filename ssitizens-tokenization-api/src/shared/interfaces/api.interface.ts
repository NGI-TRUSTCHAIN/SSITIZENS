import {Application, Router} from 'express';
import asyncHandler from 'express-async-handler';
import ApiUtils from '../utils/api.utils.js';
import {FRAMEWORK_SETTINGS} from '../settings/index.js';

export type ParamPlace = 'body' | 'param' | 'query';

export abstract class BaseRouter {
  protected utils: ApiUtils;
  protected router: Router;
  protected path: string;

  constructor(
    utils: ApiUtils,
    path: string,
    defaultApiPathAsPrefix: boolean = true,
  ) {
    this.utils = utils;
    this.router = Router();
    this.path = defaultApiPathAsPrefix
      ? `${FRAMEWORK_SETTINGS.api.path}${path}`
      : path;
  }

  public abstract loadRoutes(app: Application): Promise<void>;

  protected pingServer = () => this.utils.pingServer();

  protected logAppVersion = (warning: boolean) =>
    this.utils.logAppVersion(warning);

  protected processQueryParams = (strict: boolean) =>
    this.utils.processQueryParams(strict);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected executeHandler = (handler: any) => asyncHandler(handler);
}
