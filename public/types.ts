/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { UnifiedSearchPublicPluginStart } from '@kbn/unified-search-plugin/public';
import { NavigationPublicPluginStart } from '../../../src/plugins/navigation/public';
import { DataPublicPluginStart } from '../../../src/plugins/data/public';
import { SharePluginSetup } from '../../../src/plugins/share/public';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface accsPluginSetup {
  getIndexPatterns:(indexPattern:string)=>string
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface accsPluginStart {}

export interface AppPluginSetupDependencies {
  share: SharePluginSetup;
}

export interface AppPluginStartDependencies {
  navigation: NavigationPublicPluginStart;
  data: DataPublicPluginStart;
  unifiedSearch: UnifiedSearchPublicPluginStart;
}


export interface ClientConfigType {    
  ui: {        
    enabled: boolean;    
  };
}