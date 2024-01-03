/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { useState } from 'react';
import { CoreStart } from '../../../src/core/public';
import { AppPluginStartDependencies } from './types';
import { AccsApp } from './cluster_select/app';

export const renderApp = (
  { notifications, http }: CoreStart,
  { data, navigation, unifiedSearch }: AppPluginStartDependencies,
  SearchBar:any
) => {
    return function(props:any){
      const[lastquery, setLastQuery]=useState();
      const onQuerySubmit=(payload: any,isUpdate?: boolean)=>{
      
        if(props.onQuerySubmit){
          props.onQuerySubmit(payload, isUpdate)
          setLastQuery(payload)
        }
      }
      const onTriggerRefresh = ()=>{
        if(props.onQuerySubmit){
          props.onQuerySubmit(lastquery, false)
        }
      }
      return <div className='searchAndPopover'>
        <div className='accs'>
          <AccsApp      
          notifications={notifications}      
          navigation={navigation}      
          data={data}      
          http={http}      
          unifiedSearch={unifiedSearch}    
          {...props}
          onTriggerRefresh={onTriggerRefresh}
          />
        </div>
        <div className='searchBarWrapper'>
          <SearchBar {...props} onQuerySubmit = {onQuerySubmit}/>
        </div>
      </div>
    }
};
