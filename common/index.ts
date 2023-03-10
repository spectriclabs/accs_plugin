/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

export const PLUGIN_ID = 'accsPlugin';
export const PLUGIN_NAME = 'Advance CCS Plugin';

export const SERVER_REMOTE_INFO_ROUTE_PATH = '/api/accsPlugin/remote/info';

/**
 * Typed defined for storing reduce information of each remote cluster information   
 * Examples:
 * { name: cluster1,
 *   connected: true
 * }
 * 
 */
export interface RemoteInfo { name: string; connected: boolean; };

/**
 * Typed defined for mapping the remote cluster name and its selected state
 * Example:
 * {
 *   cluster1: true
 * }
 */
export interface IsRemoteSelected { [key:string]: boolean};