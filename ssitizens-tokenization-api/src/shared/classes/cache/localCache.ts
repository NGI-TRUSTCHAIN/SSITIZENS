import NodeCache from 'node-cache';
import Logger from '../../../shared/classes/logger.js';
import {FRAMEWORK_SETTINGS} from '../../../shared/settings/index.js';
import Cache from './cache.js';
import {injectable} from 'tsyringe';

@injectable()
export default class LocalCache implements Cache {
  private nodeCache;

  constructor(private logger: Logger) {
    logger.info('Using local cache');
    const stdTTL = FRAMEWORK_SETTINGS.cache.default.ttl;
    const checkPeriod = FRAMEWORK_SETTINGS.cache.default.checkPeriod;
    this.nodeCache = new NodeCache({stdTTL, checkperiod: checkPeriod});

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.nodeCache.on('expired', (key, _value) => {
      logger.debug(`cache expired: ${key}`);
    });
  }

  public async has(key: string) {
    return this.nodeCache.has(key);
  }

  public async set(key: string, value: object) {
    this.nodeCache.set(key, value);
  }

  public async get(key: string) {
    return this.nodeCache.get(key);
  }

  public async take(key: string) {
    return this.nodeCache.take(key);
  }
}
