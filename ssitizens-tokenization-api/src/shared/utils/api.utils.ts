import {Application, NextFunction, Request, Response} from 'express';
import {autoInjectable, singleton} from 'tsyringe';
import {AppError} from '../classes/errors.js';
import Translator from '../classes/translator.js';
import {BaseRouter} from '../interfaces/api.interface.js';
import Logger from '../classes/logger.js';
import {FRAMEWORK_SETTINGS} from '../settings/index.js';
import http_status from 'http-status';
import {QueryFilter, QueryPagination} from '../classes/query.js';
import {readdirSync} from 'fs';
import {HttpError as OpenAPIError} from 'express-openapi-validator/dist/framework/types.js';
import {BASE_DIR} from './paths.utils.js';

@singleton()
@autoInjectable()
export default class ApiUtils {
  constructor(
    private logger: Logger,
    private translator: Translator,
  ) {}

  init = async (app: Application) => {
    this.configureMiddlewares(app);
    await this.loadApplicationRoutes(app);
    this.setErrorHandler(app);
    this.startServer(app);
  };

  private loadApplicationRoutes = async (app: Application): Promise<void> => {
    const apiFolder = `${BASE_DIR}/core/api`;
    const dirents = Array.from(readdirSync(apiFolder, {withFileTypes: true}))
      .filter(dirent => dirent.isDirectory())
      .map(folder => folder.name);

    for (const folder of dirents) {
      const RouterClass = await import(
        `${apiFolder}/${folder}/${folder}.router.js`
      );

      if (!RouterClass.default) {
        this.logger.warn(`Router not found inside '${folder}.router.ts' file`);
        this.logger.warn(`Router will not load routes from module ${folder}`);
        continue;
      }
      if (!(RouterClass.default.prototype instanceof BaseRouter)) {
        this.logger.warn(
          `Router inside '${folder}Router.ts' needs to extend BaseRouter class`,
        );
        this.logger.warn(
          'It is required to implement router class extending base router for routing',
        );
        continue;
      }
      new RouterClass.default().loadRoutes(app);
    }
  };

  private startServer = (app: Application): void => {
    const port = FRAMEWORK_SETTINGS.port;
    this.logger.info('Starting server');
    app.listen(port, () =>
      this.logger.info(`Server started listening in port ${port}`),
    );
  };

  private configureMiddlewares = (app: Application) =>
    app.use((req: Request, res: Response, next: NextFunction) => {
      res.locals.language =
        (req.header('Accept-Language') as string) ||
        FRAMEWORK_SETTINGS.language.default;
      next();
    });

  private setErrorHandler = (app: Application) =>
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
      const errStatus = 'status' in err ? (err.status as number) : 500;

      let error = 'name' in err ? err.name : http_status['500_NAME'];
      if ('errorCode' in err) {
        error = `${error} - ${err.errorCode}`;
      }
      const error_description = this.translator.translate(
        err.message,
        res.locals.language,
      );
      const errorBody = {
        error,
        error_description,
      };

      if (!(err instanceof AppError) && !(err instanceof OpenAPIError)) {
        // Imprimimos solo el stack de errores no controlados
        this.logger.error(err.stack);
      } else {
        this.logger.error(JSON.stringify(errorBody));
      }

      return res.status(errStatus).json(errorBody);
    });

  processQueryParams =
    (strict: boolean) => (req: Request, res: Response, next: NextFunction) => {
      res.locals.pagination = new QueryPagination(req.query, strict);
      res.locals.filter = QueryFilter.createFromObject(req.query);
      next();
    };

  logAppVersion =
    (warning: boolean) => (req: Request, res: Response, next: NextFunction) => {
      const version = req.header('Application-Version');

      if (!version && warning) {
        this.logger.warn('Missing application version');
        return next();
      }
      this.logger.info(version);
      next();
    };

  pingServer = () => (req: Request, res: Response) =>
    res.status(http_status.OK).json({status: 'UP'});
}

/**
 * Converts an error object to a string representation.
 *
 * @param error - The error object to convert.
 * @returns The string representation of the error.
 */
export const errorToString = (error: unknown): string => {
  if (typeof error === 'string') {
    return error.toUpperCase();
  } else if (error instanceof Error) {
    return error.message;
  }
  // If the error is not a string or an instance of Error, return empty string
  return '';
};

export const removeSlash = (input: string) => {
  return input.substring(input.length - 1, input.length) === '/'
    ? input.substring(0, input.length - 1)
    : input;
};
