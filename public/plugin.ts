/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import {
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
import { IEsSearchRequest } from '@kbn/data-plugin/common';
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
    // Register PreSearchHook when the plugin gets register 
    var register = async () => {
      const [, depsStart] = await core.getStartServices();
      let { data } = depsStart;
      /**   
       *  Setups a hook to intercept global search request and change the cross cluster search index   
       *  base on the enable cluster selected by the user   
       */
      data.search.searchInterceptor.addPreSearchHook(function (request: IEsSearchRequest) {
        var SELECTED_REMOTES = { ...JSON.parse((window.localStorage.getItem('selectedRemotes') as string)) };
        if (request === undefined || request.params === undefined) {
          return;
        }
        let title = (request.params?.index as string);
        let indexPatternArray = [];
        if (title?.startsWith('*:')) {
          const indexPostfix = title.split('*:')[1];

          for (const key in SELECTED_REMOTES) {
            if (SELECTED_REMOTES[key]) {
              indexPatternArray.push(key + ":" + indexPostfix);
            }
          }
          if (indexPatternArray.length != 0) {
            title = indexPatternArray.join();
          }
        }
        request.params.index = title;
        return request;
      });
    }
    register()

    // Register an application into the side navigation menu    
    let replaceSearchBar = async ()=>{
      // Load application bundle        
      const { renderApp } = await import('./application');        
      // Get start services as specified in kibana.json        
      const [coreStart, depsStart] = await core.getStartServices();
      let deps:AppPluginStartDependencies = depsStart as AppPluginStartDependencies
      deps.unifiedSearch.ui.AggregateQuerySearchBar = renderApp(coreStart, depsStart,deps.unifiedSearch.ui.AggregateQuerySearchBar);
    }
    replaceSearchBar();
    return {};
  }

  public start(core: CoreStart): ccsFiltersPluginStart {
    return {};
  }

  public stop() { }
}
