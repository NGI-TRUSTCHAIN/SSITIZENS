import 'reflect-metadata';
import {SETTINGS} from './settings.js';
import {container} from 'tsyringe';
import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import ApiUtils from './shared/utils/api.utils.js';
import OpenApiValidator from 'express-openapi-validator';
import {OPENAPI_FILE, OPENAPI_PATH} from '@/api/openapi/openapi.router.js';
import registerCache from './shared/classes/cache/resolveCache.js';
import DbPool from "./core/services/db.service.js";
import { captureEvents } from "./core/services/events/capture-events.js";

const app = express();

app.use(express.json({limit: SETTINGS.request.sizeLimit}));
app.use(
  express.urlencoded({limit: SETTINGS.request.sizeLimit, extended: true}),
);
app.use(helmet());
app.use(
  morgan('dev', {
    skip: function (req, res) {
      return process.env.NODE_ENV === 'production'
        ? res.statusCode < 400
        : false;
    },
  }),
);
app.use(cors({origin: true, credentials: true}));
// El openapi principal lo servimos aquí o creamos una app para esto
app.use(
  OpenApiValidator.middleware({
    apiSpec: OPENAPI_FILE,
    validateRequests: true,
    validateResponses: true,
    ignorePaths: (path: string) => path.startsWith(OPENAPI_PATH),
  }),
);

await (async (application: express.Application) => {
  registerCache(container);
  await container.resolve(DbPool).init();
  await container.resolve(ApiUtils).init(application);
})(app);

// Default route to OpenAPI
app.get('', (req, res) => {
  res.redirect(OPENAPI_PATH);
});

captureEvents();