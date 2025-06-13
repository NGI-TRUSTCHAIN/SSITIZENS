import {FRAMEWORK_SETTINGS} from '../../settings/index.js';
import {DependencyContainer, predicateAwareClassFactory} from 'tsyringe';
import LocalCache from './localCache.js';
import Cache from './cache.js';
import RedisCache from './redisCache.js';

export default function registerCache(container: DependencyContainer) {
  container.register<Cache>('Cache', {
    useFactory: predicateAwareClassFactory<Cache>(
      () => (FRAMEWORK_SETTINGS.redis.url ? true : false),
      RedisCache,
      LocalCache,
    ),
  });
}
