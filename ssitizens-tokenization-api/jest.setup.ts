import 'reflect-metadata';
import 'dotenv/config';
import {container} from 'tsyringe';
import registerCache from '@/shared/classes/cache/resolveCache.js';

registerCache(container);
