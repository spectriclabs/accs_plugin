/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type {
  PluginInitializerContext,
  CoreSetup,
  CoreStart,
  Plugin,
  Logger,
} from 'src/core/server';

import type { DataRequestHandlerContext } from 'src/plugins/data/server';

import {
  ccsFiltersPluginSetup,
  ccsFiltersPluginStart,
  ccsFiltersPluginSetupDeps,
  ccsFiltersPluginStartDeps,
} from './types';
import { registerRoutes } from './routes';

export class ccsFiltersPlugin
  implements
    Plugin<
      ccsFiltersPluginSetup,
      ccsFiltersPluginStart,
      ccsFiltersPluginSetupDeps,
      ccsFiltersPluginStartDeps
    >
{
  private readonly logger: Logger;

  constructor(initializerContext: PluginInitializerContext) {
    this.logger = initializerContext.logger.get();
  }

  public setup(
    core: CoreSetup<ccsFiltersPluginStartDeps>,
    deps: ccsFiltersPluginSetupDeps
  ) {
    this.logger.debug('CCS filter server: Setup');
    const router = core.http.createRouter<DataRequestHandlerContext>();

    core.getStartServices().then(([_, depsStart]) => {
      registerRoutes(router);
    });

    return {};
  }

  public start(core: CoreStart) {
    this.logger.debug('CCS filter server: Started');
    return {};
  }

  public stop() {}
}
