/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { IRouter, RequestHandler } from '@kbn/core/server';
import { SERVER_SEARCH_ROUTE_PATH } from '../../common';

export interface RouteDependencies { 
   router: IRouter; 
  }
export const register = (deps: RouteDependencies): void => {
  const {
    router,

  } = deps;

  const allHandler: RequestHandler<unknown, unknown, unknown> = async (ctx, request, response) => {
    try {
      const { client: clusterClient } = (await ctx.core).elasticsearch;
      const info = await clusterClient.asCurrentUser.cluster.remoteInfo();
      return response.ok({body:info})
    } catch (error) {
      return response.badRequest({ body:"error" });
    }
  };

  router.get(
    {
      path: SERVER_SEARCH_ROUTE_PATH,
      validate: false,
    },
   allHandler
  );
};
