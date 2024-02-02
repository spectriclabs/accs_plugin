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
import { ACCSConfig } from '.';
import { schema } from '@kbn/config-schema';

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
  config$: ACCSConfig;

  constructor(initializerContext: PluginInitializerContext) {
    this.logger = initializerContext.logger.get();
    this.config$ = initializerContext.config.create<ACCSConfig>();
  }

  public setup(
    core: CoreSetup<accsPluginStartDeps>,
    deps: accsPluginSetupDeps
  ) {
    this.logger.debug('Advance CCS server: Setup');
    const setVersion = (version:string) =>{
      const name = "acecard:plugin"+ this.constructor.name;
      const versionSettings:any = {}
      versionSettings[name] = {
        name,
        description: `Commit id and message for ${this.constructor.name} version readonly do not change`,
        category: ['acecard'],
        order: 1,
        type: 'string',
        value: version,
        readonly:false,
        requiresPageReload: false,
        schema: schema.string(),
      }
      core.uiSettings.register(versionSettings);
    }
    import("../common/version").then((version)=>{
      setVersion(version.version)
    }).catch(()=>{
      setVersion("UNKNOWN")
    })
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
