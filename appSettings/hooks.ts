'use client';

import {
  createUseAppSettings,
  createUseAppSettingsOrThrow,
  createUseSetting,
  createUseSettingOrThrow,
} from '@next-box/appsettings';
import { type AppSettingsConfig } from '#appSettings/schema.ts';

export const useSetting = createUseSetting<AppSettingsConfig>();

export const useSettingOrThrow = createUseSettingOrThrow<AppSettingsConfig>();

export const useAppSettings = createUseAppSettings<AppSettingsConfig>();

export const useAppSettingsOrThrow = createUseAppSettingsOrThrow<AppSettingsConfig>();
