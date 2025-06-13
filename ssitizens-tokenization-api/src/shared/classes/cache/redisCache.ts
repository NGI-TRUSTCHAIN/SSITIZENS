import {createClient} from 'redis';
import Logger from '../../../shared/classes/logger.js';
import {FRAMEWORK_SETTINGS} from '../../../shared/settings/index.js';
import Cache from './cache.js';
import {injectable} from 'tsyringe';

@injectable()
export default class RedisCache implements Cache {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private redisClient: ReturnType<typeof createClient> | undefined;
  private stdTTL = FRAMEWORK_SETTINGS.cache.default.ttl;

  constructor(private logger: Logger) {
    logger.info('Using Redis cache');
  }

  private async getRedisClient() {
    if (!this.redisClient) {
      this.redisClient = await createClient({
        url: FRAMEWORK_SETTINGS.redis.url,
      })
        .on('error', err =>
          this.logger.error(`Redis Client Error: ${JSON.stringify(err)}`),
        )
        .connect();
    }
    return this.redisClient;
  }

  public async has(key: string) {
    const client = await this.getRedisClient();
    const howManyExists = await client.exists(key);
    return howManyExists > 0;
  }

  public async set(key: string, value: object) {
    const jsonString = JSON.stringify(value);
    await (await this.getRedisClient()).set(key, jsonString, {EX: this.stdTTL});
  }

  public async get(key: string) {
    const jsonString = await (await this.getRedisClient()).get(key);
    return jsonString ? JSON.parse(jsonString) : null;
  }

  public async take(key: string) {
    const jsonString = await (await this.getRedisClient()).getDel(key);
    return jsonString ? JSON.parse(jsonString) : null;
  }
}
