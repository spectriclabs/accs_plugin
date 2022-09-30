/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { useState, useEffect } from 'react';
import { i18n } from '@kbn/i18n';
import { FormattedMessage } from '@kbn/i18n-react';

import {
  EuiButtonEmpty,
  EuiCodeBlock,
  EuiPageBody,
  EuiPageContent,
  EuiPageContentBody,
  EuiPageHeader,
  EuiTitle,
  EuiText,
  EuiFlexGrid,
  EuiFlexItem,
  EuiCheckbox,
  EuiSpacer,
  EuiCode,
  EuiComboBox,
  EuiFormLabel,
  EuiFieldNumber,
  EuiProgress,
  EuiTabbedContent,
  EuiTabbedContentTab,
  EuiFormFieldset,
  EuiSwitch
} from '@elastic/eui';

import { CoreStart } from '../../../../src/core/public';
import { NavigationPublicPluginStart } from '../../../../src/plugins/navigation/public';

import { PLUGIN_ID, PLUGIN_NAME } from '../../common';

import {
  DataPublicPluginStart
} from '../../../../src/plugins/data/public';
import type { DataView } from '../../../../src/plugins/data_views/public';

interface CssFiltersAppDeps {
  notifications: CoreStart['notifications'];
  http: CoreStart['http'];
  navigation: NavigationPublicPluginStart;
  data: DataPublicPluginStart;
}

export const CssFiltersApp = ({
  http,
  notifications,
  navigation,
  data,
}: CssFiltersAppDeps) => {
  const { IndexPatternSelect } = data.ui;
  const [dataView, setDataView] = useState<DataView | null>();
  const [checked1, setChecked1] = useState(false);
  const [checked2, setChecked2] = useState(false);

  const onChange1 = (e: {
    target: { checked: React.SetStateAction<boolean> };
  }) => {
    setChecked1(e.target.checked);
  };

  const onChange2 = (e: {
    target: { checked: React.SetStateAction<boolean> };
  }) => {
    setChecked2(e.target.checked);
  };

  // Fetch the default data view using the `data.dataViews` service, as the component is mounted.
  useEffect(() => {
    const setDefaultDataView = async () => {
      const defaultDataView = await data.dataViews.getDefault();
      setDataView(defaultDataView);
    };

    setDefaultDataView();
  }, [data]);


  function showSwitch(data:DataView) {
    console.log(data)
    if (data === undefined){
      return
    }else if(data.title.startsWith("*:")){
      return (
        <EuiFormFieldset legend={{ children: 'Remote Clusters' }}>
        <EuiSwitch label="c1-es" onChange={onChange1} checked={checked1} />
        <EuiSpacer size="s" />
        <EuiSwitch label="c2-es" onChange={onChange2} checked={checked2} />
      </EuiFormFieldset>
      )
    }
    
  }
  return (
    <EuiPageBody>
      <EuiPageHeader>
        <EuiTitle size="l">
          <h1>
            <FormattedMessage
              id="cssFilters.helloWorldText"
              defaultMessage="{name}"
              values={{ name: PLUGIN_NAME }}
            />
          </h1>
        </EuiTitle>
      </EuiPageHeader>
      <EuiPageContent>
        <EuiPageContentBody>
          <navigation.ui.TopNavMenu
            appName={PLUGIN_ID}
            showSearchBar={true}
            useDefaultBehaviors={true}
            indexPatterns={dataView ? [dataView] : undefined}
          />
          <EuiFlexGrid columns={4}>
            <EuiFlexItem>
              <EuiFormLabel>Data view</EuiFormLabel>
              <IndexPatternSelect
                placeholder={i18n.translate('searchSessionExample.selectDataViewPlaceholder', {
                  defaultMessage: 'Select data view',
                })}
                indexPatternId={dataView?.id || ''}
                onChange={async (dataViewId?: string) => {
                  if (dataViewId) {
                    const newDataView = await data.dataViews.get(dataViewId);
                    setDataView(newDataView);
                  } else {
                    setDataView(undefined);
                  }
                }}
                isClearable={false}
                data-test-subj="dataViewSelector"
              />
            </EuiFlexItem>
            <EuiFlexItem>
              {showSwitch(dataView)}
            </EuiFlexItem>
          </EuiFlexGrid>
        </EuiPageContentBody>
      </EuiPageContent>
    </EuiPageBody>
  );
};
