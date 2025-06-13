import {FRAMEWORK_SETTINGS} from './shared/settings/index.js';
import {getBoolean, getOptionalNumber, getOptionalObject, getOptionalString, getString} from './shared/settings/utils.js';

export const SETTINGS = {
  // add here project specific configuration
  blockchain_url: getOptionalString("blockchain:rpc:url"),
  sc_address: getOptionalString("smart:contract:address"),
  issuer_private_key: getOptionalObject("issuer:private:key"),
  first_block_interval_event_indexer: getOptionalNumber("blockchain:first:block:interval:event:indexer", 10000),
  block_interval_event_indexer: getOptionalNumber("blockchain:block:interval:event:indexer", 10),
  time_interval_miliseconds_event_indexer: getOptionalNumber("time:interval:miliseconds:event:indexer", 3000),
  database: {
    url: getString("database:url", "postgresql://postgres:postgres@localhost:5432/postgres"),
    ssl: getBoolean("database:ssl", process.env.NODE_ENV == "production" ? true : false),
  },
  ...FRAMEWORK_SETTINGS,
};
