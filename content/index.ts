import { getEnv } from '@next-box/envs/server';
import { createI18n } from '@next-box/i18n';
import { de as deDateLocale, enGB, es as esDateLocale, fr as frDateLocale } from 'date-fns/locale';
import { content as deContent } from './de/index.ts';
import { content as enContent } from './en/index.ts';
import { content as esContent } from './es/index.ts';
import { content as frContent } from './fr/index.ts';

const dateLocales = {
  de: deDateLocale,
  en: enGB,
  es: esDateLocale,
  fr: frDateLocale,
};

const languages = {
  de: deContent,
  en: enContent,
  es: esContent,
  fr: frContent,
};

const languageCodes = ['de', 'en', 'es', 'fr'] as const;
const requestedLanguageCode = getEnv<string>('NEXT_PUBLIC_LANGUAGE_CODE');
export const languageCode = languageCodes.find(code => code === requestedLanguageCode) ?? 'en';
const content = languages[languageCode];
export const dateLocale = dateLocales[languageCode];
export const { t, tt } = createI18n(content);
