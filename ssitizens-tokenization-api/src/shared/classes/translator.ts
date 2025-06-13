import {singleton} from 'tsyringe';
import {readFileSync} from 'fs';
import {join, resolve} from 'path';
import Logger from '../../shared/classes/logger.js';
import {FRAMEWORK_SETTINGS} from '../../shared/settings/index.js';
import {BASE_DIR} from '../../shared/utils/paths.utils.js';

@singleton()
export default class Translator {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private dictionary: any = {};

  constructor(private logger: Logger) {
    this.init();
  }

  private init = () => {
    const {allowed, location} = FRAMEWORK_SETTINGS.language;
    allowed.forEach(locale => {
      const path = resolve(join(BASE_DIR, location));
      const file = readFileSync(`${path}/${locale}.json`, 'utf-8');
      this.dictionary[locale] = JSON.parse(file);
    });
  };

  translate = (key: string, language: string): string => {
    // En configureMiddlewares se está estableciendo el idioma por defecto. Sin embargo,
    // no se está llamando a dicho código cuando hay un error de validación de OpenAPI.
    // Se duplica la funcionalidad aquí como workaround hasta encontrar otra solución.
    if (!language) {
      language = FRAMEWORK_SETTINGS.language.default;
    }
    const dictionary = this.dictionary[language];

    if (!dictionary) {
      this.logger.warn(`Dictionary for '${language}' does not exists`);
      return key;
    }
    const value = key?.split('.').reduce((v, k) => v?.[k], dictionary);
    return value || key;
  };
}
