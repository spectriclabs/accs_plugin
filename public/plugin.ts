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
import { SearchSessionsExamplesAppLocatorDefinition } from './search_sessions/app_locator';
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

    // we need an locator for search session examples for restoring a search session
    const getAppBasePath = () =>
      core.getStartServices().then(([coreStart]) => coreStart.http.basePath.get());
    share.url.locators.create(new SearchSessionsExamplesAppLocatorDefinition(getAppBasePath));

    return {};
  }

  public start(core: CoreStart): ccsFiltersPluginStart {
    return {};
  }

  public stop() {}
}
