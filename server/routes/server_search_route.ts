/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Observable } from 'rxjs';
import { IEsSearchRequest } from 'src/plugins/data/server';
import { schema } from '@kbn/config-schema';
import { IEsSearchResponse } from 'src/plugins/data/common';
import type { DataRequestHandlerContext } from 'src/plugins/data/server';
import type { IRouter } from 'src/core/server';
import { SERVER_SEARCH_ROUTE_PATH } from '../../common';

export function registerServerSearchRoute(router: IRouter<DataRequestHandlerContext>) {
  router.get(
    {
      path: SERVER_SEARCH_ROUTE_PATH,
      validate: false

    },
    async (context, request, response) => {

      const { client: clusterClient } = (await context.core).elasticsearch;      
      const info = await clusterClient.asCurrentUser.cluster.remoteInfo();   
      let infoArray = Object.keys(info).map(name => ({name,connected:info[name].connected}))
      return response.ok({body:infoArray})
      
    }
  );
}

