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
import { RemoteClustersPluginSetup } from '@kbn/remote-clusters-plugin/public'; 

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ccsFiltersPluginSetup {}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ccsFiltersPluginStart {}

export interface AppPluginSetupDependencies {
  share: SharePluginSetup;
}

export interface AppPluginStartDependencies {
  navigation: NavigationPublicPluginStart;
  data: DataPublicPluginStart;
  unifiedSearch: UnifiedSearchPublicPluginStart;
  remoteClusters: RemoteClustersPluginSetup;
}
