/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { useState, useEffect } from 'react';
import { FormattedMessage } from '@kbn/i18n-react';

import {
  EuiPageBody,
  EuiPageContent,
  EuiPageContentBody,
  EuiPageHeader,
  EuiTitle,
  EuiFlexGrid,
  EuiFlexItem,
  EuiSpacer,
  EuiFormFieldset,
  EuiSwitch
} from '@elastic/eui';

import { UnifiedSearchPublicPluginStart } from '@kbn/unified-search-plugin/public';
import { CoreStart } from '../../../../src/core/public';
import { NavigationPublicPluginStart } from '../../../../src/plugins/navigation/public';

import { IsRemoteSelected, PLUGIN_NAME, RemoteInfo, SERVER_REMOTE_INFO_ROUTE_PATH } from '../../common';

import { DataPublicPluginStart } from '../../../../src/plugins/data/public';

interface CcsFiltersAppDeps {
  notifications: CoreStart['notifications'];
  http: CoreStart['http'];
  navigation: NavigationPublicPluginStart;
  data: DataPublicPluginStart;
  unifiedSearch: UnifiedSearchPublicPluginStart;
}

export const CcsFiltersApp = ({
  http,
  notifications,
  navigation,
  data,
  unifiedSearch,
}: CcsFiltersAppDeps) => {

  var [selectedRemotes, setSelected] = useState<IsRemoteSelected>({});
  const [remoteInfo, setRemoteInfo] = useState<RemoteInfo[]>();

  /**
   * Chages the state of the switch when clicked 
   * @param e click action object
   * @param switchLabel name of the switch on which the action was performed 
   */
  const onChange = (e: { target: { checked: boolean } }, switchLabel: string) => {

    setSelected({ ...selectedRemotes, [switchLabel]: e.target.checked });

  }
  /**
   * asynchronous request to get the list of remote clusters 
   */
  const getCluster = async () => {
    try {
      const res: RemoteInfo[] = await http.get(SERVER_REMOTE_INFO_ROUTE_PATH);
      setRemoteInfo(res);

    } catch (e) {
      if (e?.name === 'AbortError') {
        notifications.toasts.addWarning({
          title: e.message,
        });
      } else {
        notifications.toasts.addDanger({
          title: 'Failed to get cluster information',
          text: e.message,
        });
      }
    }
  };


  /**
   * Get the cluster information once when the application loads 
   */
  useEffect(() => {
    getCluster()
  }, [])


  /**
   * Gets the checkedItems save on localstorage once when the application loads
   */
  useEffect(() => {
    setSelected(JSON.parse((window.localStorage.getItem('selectedRemotes') as string)));
  }, []);

  /**
   * Save checkedItems to locastorage everytime they are updated
   */
  useEffect(() => {
    if (selectedRemotes === undefined || selectedRemotes === null || JSON.stringify(selectedRemotes) === '{}') {
      return;
    }
    window.localStorage.setItem('selectedRemotes', JSON.stringify(selectedRemotes));

  }, [selectedRemotes])

  /**
   * Function use to genere a switch based on the RemoteInfo passed in 
   * @param obj RemoteInfo object use to generate the selection switch 
   * @returns 
   */
  function makeSwith(obj: RemoteInfo) {
    return (
      <div>
        <EuiSwitch
          label={obj.name}
          id={obj.name}
          onChange={e => onChange(e, obj.name)}
          checked={selectedRemotes? selectedRemotes[obj.name] : false}
        />
        <EuiSpacer size="s" />
      </div>

    )
  }

  return (
    <EuiPageBody>
      <EuiPageHeader>
        <EuiTitle size="l">
          <h1>
            <FormattedMessage
              id="ccsFilters.helloWorldText"
              defaultMessage="{name}"
              values={{ name: PLUGIN_NAME }}
            />
          </h1>
        </EuiTitle>
      </EuiPageHeader>
      <EuiPageContent>
        <EuiPageContentBody>
          <EuiFlexGrid columns={4}>
            <EuiFlexItem>
              <EuiFormFieldset legend={{ children: 'Remote Clusters' }}>
                {remoteInfo?.map(makeSwith, this)}
              </EuiFormFieldset>
            </EuiFlexItem>
          </EuiFlexGrid>
        </EuiPageContentBody>
      </EuiPageContent>
    </EuiPageBody>
  );
};
