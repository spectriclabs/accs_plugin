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
  accsPluginSetup,
  accsPluginStart,
  accsPluginSetupDeps,
  accsPluginStartDeps,
} from './types';
import { registerRoutes } from './routes';

export class accsPlugin
  implements
    Plugin<
      accsPluginSetup,
      accsPluginStart,
      accsPluginSetupDeps,
      accsPluginStartDeps
    >
{
  private readonly logger: Logger;

  constructor(initializerContext: PluginInitializerContext) {
    this.logger = initializerContext.logger.get();
  }

  public setup(
    core: CoreSetup<accsPluginStartDeps>,
    deps: accsPluginSetupDeps
  ) {
    this.logger.debug('Advance CCS server: Setup');
    const router = core.http.createRouter<DataRequestHandlerContext>();

    core.getStartServices().then(([_, depsStart]) => {
      registerRoutes(router);
    });

    return {};
  }

  public start(core: CoreStart) {
    this.logger.debug('Advance CCS server: Started');
    return {};
  }

  public stop() {}
}
