import {Application} from 'express';
import {autoInjectable, singleton} from 'tsyringe';
import {serve, setup} from 'swagger-ui-express';
import {BaseRouter} from '../../../shared/interfaces/api.interface.js';
import ApiUtils from '../../../shared/utils/api.utils.js';
import * as yaml from 'js-yaml';
import {BASE_DIR} from '../../../shared/utils/paths.utils.js';
import fs from 'fs';

export const OPENAPI_FILE = `${BASE_DIR}/openapi.yaml`;
export const OPENAPI_PATH = '/docs';

@singleton()
@autoInjectable()
export default class OpenApiRouter extends BaseRouter {
  constructor(private readonly apiUtils: ApiUtils) {
    super(apiUtils, OPENAPI_PATH, false);
  }

  async loadRoutes(app: Application): Promise<void> {
    this.router.use('/', serve);
    const openApiDocument = yaml.load(
      fs.readFileSync(OPENAPI_FILE, 'utf8'),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ) as any;
    this.router.get('/', setup(openApiDocument));
    app.use(this.path, this.router);
  }
}
