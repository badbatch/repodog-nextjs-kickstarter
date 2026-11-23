/* eslint-disable unicorn/filename-case -- Next.js requires this filename. */
import { configureBrowserLogging, installBrowserExceptionCapture } from '@next-box/logging/browser';
import { shouldReportBrowserException } from '#libs/Logging/shouldReportBrowserException.ts';

configureBrowserLogging();
installBrowserExceptionCapture({ shouldReport: shouldReportBrowserException });
