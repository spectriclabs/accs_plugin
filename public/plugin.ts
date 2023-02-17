/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import {
  AppMountParameters,
  AppNavLinkStatus,
  CoreSetup,
  CoreStart,
  Plugin,
} from '../../../src/core/public';
import {
  AppPluginSetupDependencies,
  AppPluginStartDependencies,
  ccsFiltersPluginSetup,
  ccsFiltersPluginStart,
} from './types';
import { PLUGIN_NAME } from '../common';

export class ccsFiltersPlugin
  implements
    Plugin<
      ccsFiltersPluginSetup,
      ccsFiltersPluginStart,
      AppPluginSetupDependencies,
      AppPluginStartDependencies
    >
{
  public setup(
    core: CoreSetup<AppPluginStartDependencies>,
    { share }: AppPluginSetupDependencies
  ): ccsFiltersPluginSetup {
    console.log("Registering ccsFilters")
    // Register an application into the side navigation menu
    core.application.register({
      id: 'ccsFilters',
      title: PLUGIN_NAME,
      navLinkStatus: AppNavLinkStatus.visible,
      mount: async (params: AppMountParameters) => {
        // Load application bundle
        const { renderApp } = await import('./application');
        // Get start services as specified in kibana.json
        const [coreStart, depsStart] = await core.getStartServices();
        // Render the application
        return renderApp(coreStart, depsStart, params);
      },
    });
    return {};
  }

  public start(core: CoreStart): ccsFiltersPluginStart {
    return {};
  }

  public stop() {}
}
