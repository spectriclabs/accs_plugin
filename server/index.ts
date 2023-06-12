/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { schema, TypeOf } from '@kbn/config-schema';
import { PluginInitializerContext } from '../../../src/core/server';
import { PluginConfigDescriptor } from '@kbn/core/server';
import { accsPlugin } from './plugin';

const configSchema = schema.object(
  {
    ui: schema.object({
      enabled: schema.boolean({ defaultValue: false }),
    }),
  },
  { defaultValue: undefined }
);

export type ACCSConfig = TypeOf<typeof configSchema>;

export const config: PluginConfigDescriptor<ACCSConfig> = {
  exposeToBrowser: {
    ui: true,
  },
  schema: configSchema,
  deprecations: () => [],
};


export function plugin(initializerContext: PluginInitializerContext) {
  return new accsPlugin(initializerContext);
}

export type { accsPluginSetup, accsPluginStart } from './types';
