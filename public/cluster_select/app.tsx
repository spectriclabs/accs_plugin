/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { useState, useEffect } from 'react';

import {
  EuiFlexItem,
  EuiSpacer,
  EuiFormFieldset,
  EuiSwitch,
  EuiToolTip,
  EuiIcon,
  EuiPopover,
  EuiButtonIcon,
  useEuiTheme,
  EuiThemeComputed

} from '@elastic/eui';

import { UnifiedSearchPublicPluginStart } from '@kbn/unified-search-plugin/public';
import { CoreStart } from '../../../../src/core/public';
import { NavigationPublicPluginStart } from '../../../../src/plugins/navigation/public';

import { IsRemoteSelected, RemoteInfo, SERVER_REMOTE_INFO_ROUTE_PATH } from '../../common';

import { DataPublicPluginStart } from '../../../../src/plugins/data/public';

interface AccsAppDeps {
  notifications: CoreStart['notifications'];
  http: CoreStart['http'];
  navigation: NavigationPublicPluginStart;
  data: DataPublicPluginStart;
  unifiedSearch: UnifiedSearchPublicPluginStart;
  displayStyle?: 'inPage' | 'detached';
}

export const AccsApp = ({
  http,
  notifications,
  navigation,
  data,
  unifiedSearch,
  displayStyle
}: AccsAppDeps) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  var [selectedRemotes, setSelected] = useState<IsRemoteSelected>({});
  const [remoteInfo, setRemoteInfo] = useState<RemoteInfo[]>();
  const[isSelectedButNotConnected, setIselectedButNotConnected]=useState(false)

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
   * Generate selectedRemotes 
   */
  useEffect(() => {
    var selectedR = {};
    remoteInfo?.forEach(r => {
      let check = selectedRemotes[r.name] === undefined ? true :selectedRemotes[r.name];
      console.log("calling setSelected generate useeffect")
      selectedR[r.name]=check;
    });
    setSelected(selectedR);
  }, [remoteInfo])

  /**
   * Gets the checkedItems save on localstorage once when the application loads
   */
  useEffect(() => {
    const selectedRemotesFromLocalCache = JSON.parse((window.localStorage.getItem('selectedRemotes') as string));
    if(selectedRemotesFromLocalCache !== null){
      setSelected(selectedRemotesFromLocalCache);
    }
  }, []);

  /**
   * Save checkedItems to locastorage everytime they are updated
   */
  useEffect(() => {
    //if non of the remotes is selected retun without any action
    if (JSON.stringify(selectedRemotes) === '{}') {
      return;
    }
    window.localStorage.setItem('selectedRemotes', JSON.stringify(selectedRemotes));

  }, [selectedRemotes])

  /**
   * Check if a cluster that is not connected is seleted. This is use for setting the color of the Icon Button 
   */
  useEffect(()=>{
    //if non of the remotes is selected retun without any action
    if (JSON.stringify(selectedRemotes) === '{}') {
      return;
    }
    let selNotCon = false;
    remoteInfo?.map(o => {
      if(!o.connected && selectedRemotes[o.name]){               
        selNotCon= true      
      }    
    })
    setIselectedButNotConnected(selNotCon);
  },[selectedRemotes,remoteInfo])

  function renderGreenCheckMark() {
    return (

      <EuiToolTip content="Cluster is Connected">
        <EuiIcon type="check" aria-label="check" color='green' />
      </EuiToolTip>
    )
  }

  function renderRedCrossMark() {
    return (
      <EuiToolTip content="Cluster is Not Connected">
        <EuiIcon type="cross" aria-label="cross" color='red' />
      </EuiToolTip>
    )
  }

  /**
   * Function use to genere a switch based on the RemoteInfo passed in 
   * @param obj RemoteInfo object use to generate the selection switch 
   * @returns 
   */
  function makeSwith(obj: RemoteInfo) {
    return (
      <div>
        <EuiSwitch
          label={
            <span>
              {obj.name + ' '}
              {obj.connected ? renderGreenCheckMark() : renderRedCrossMark()}
            </span>
          }
          id={obj.name}
          onChange={e => onChange(e, obj.name)}
          checked={selectedRemotes[obj.name]}
          compressed={true}
        />
        <EuiSpacer size="s" />
      </div>

    )
  }

  const {euiTheme} = useEuiTheme(); 

  const searchBarStyles = ( euiTheme : EuiThemeComputed) => {
    return {
      uniSearchBar:{
        padding: euiTheme.size.s,
        position: "relative",
      },
      default: {
        padding: euiTheme.size.s,
        borderBottom: "none",
      },
      detached: {
        padding: euiTheme.size.s, 
        borderBottom: euiTheme.border.thin,
      },
      inPage: {
        padding: 0,
    },
    hidden: {
        display: 'none'
    },
    };
  };
  const clusterPopoverStyle =  searchBarStyles(euiTheme)[displayStyle?displayStyle:"default"]

  return (
    <div style={clusterPopoverStyle}>
    <EuiPopover
      panelPaddingSize='s'
      isOpen={isPopoverOpen}
      closePopover={() => { setIsPopoverOpen(false); } }
      button={
        <EuiToolTip content="Cross Cluster Selection"> 
          <EuiButtonIcon
            onClick={() => { setIsPopoverOpen(!isPopoverOpen); } }
            color={isSelectedButNotConnected ? 'danger': 'primary'}
            display="base"
            size='m'
            iconType="globe"
            aria-label='Globe'
          />
        </EuiToolTip>
      }
    >
      <EuiFlexItem>
        <EuiFormFieldset legend={{ children: 'Remote Clusters' }}> 
          {remoteInfo?.map(makeSwith, this)}      
        </EuiFormFieldset>    
      </EuiFlexItem>
    </EuiPopover>
    
    </div>

  );
};
