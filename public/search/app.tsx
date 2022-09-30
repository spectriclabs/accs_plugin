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
import { mountReactNode } from '../../../../src/core/public/utils';
import { NavigationPublicPluginStart } from '../../../../src/plugins/navigation/public';

import { PLUGIN_ID, PLUGIN_NAME, SERVER_SEARCH_ROUTE_PATH } from '../../common';

import {
  DataPublicPluginStart,
  IKibanaSearchResponse,
  isCompleteResponse,
  isErrorResponse,
} from '../../../../src/plugins/data/public';
import type { DataViewField, DataView } from '../../../../src/plugins/data_views/public';
import { IMyStrategyResponse } from '../../common/types';
import { AbortError } from '../../../../src/plugins/kibana_utils/common';

interface CssFiltersAppDeps {
  notifications: CoreStart['notifications'];
  http: CoreStart['http'];
  navigation: NavigationPublicPluginStart;
  data: DataPublicPluginStart;
}

function getNumeric(fields?: DataViewField[]) {
  if (!fields) return [];
  return fields?.filter((f) => f.type === 'number' && f.aggregatable);
}

function getAggregatableStrings(fields?: DataViewField[]) {
  if (!fields) return [];
  return fields?.filter((f) => f.type === 'string' && f.aggregatable);
}

function formatFieldToComboBox(field?: DataViewField | null) {
  if (!field) return [];
  return formatFieldsToComboBox([field]);
}

function formatFieldsToComboBox(fields?: DataViewField[]) {
  if (!fields) return [];

  return fields?.map((field) => {
    return {
      label: field.displayName || field.name,
    };
  });
}


export const CssFiltersApp = ({
  http,
  notifications,
  navigation,
  data,
}: CssFiltersAppDeps) => {
  const { IndexPatternSelect } = data.ui;
  const [getCool, setGetCool] = useState<boolean>(false);
  const [fibonacciN, setFibonacciN] = useState<number>(10);
  const [timeTook, setTimeTook] = useState<number | undefined>();
  const [total, setTotal] = useState<number>(100);
  const [loaded, setLoaded] = useState<number>(0);
  const [dataView, setDataView] = useState<DataView | null>();
  const [fields, setFields] = useState<DataViewField[]>();
  const [selectedFields, setSelectedFields] = useState<DataViewField[]>([]);
  const [selectedNumericField, setSelectedNumericField] = useState<
    DataViewField | null | undefined
  >();
  const [selectedBucketField, setSelectedBucketField] = useState<
    DataViewField | null | undefined
  >();
  const [request, setRequest] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentAbortController, setAbortController] = useState<AbortController>();
  const [rawResponse, setRawResponse] = useState<Record<string, any>>({});
  const [selectedTab, setSelectedTab] = useState(0);
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


  function setResponse(response: IKibanaSearchResponse) {
    setRawResponse(response.rawResponse);
    setLoaded(response.loaded!);
    setTotal(response.total!);
    setTimeTook(response.rawResponse.took);
  }

  // Fetch the default data view using the `data.dataViews` service, as the component is mounted.
  useEffect(() => {
    const setDefaultDataView = async () => {
      const defaultDataView = await data.dataViews.getDefault();
      setDataView(defaultDataView);
    };

    setDefaultDataView();
  }, [data]);

  // Update the fields list every time the data view is modified.
  useEffect(() => {
    setFields(dataView?.fields);
  }, [dataView]);
  useEffect(() => {
    setSelectedBucketField(fields?.length ? getAggregatableStrings(fields)[0] : null);
    setSelectedNumericField(fields?.length ? getNumeric(fields)[0] : null);
  }, [fields]);

  const doAsyncSearch = async (
    strategy?: string,
    sessionId?: string,
    addWarning: boolean = false,
    addError: boolean = false
  ) => {
    if (!dataView || !selectedNumericField) return;

    // Construct the query portion of the search request
    const query = data.query.getEsQuery(dataView);

    if (addWarning) {
      query.bool.must.push({
        // @ts-ignore
        error_query: {
          indices: [
            {
              name: dataView.title,
              error_type: 'warning',
              message: 'Watch out!',
            },
          ],
        },
      });
    }
    if (addError) {
      query.bool.must.push({
        // @ts-ignore
        error_query: {
          indices: [
            {
              name: dataView.title,
              error_type: 'exception',
              message: 'Watch out!',
            },
          ],
        },
      });
    }

    // Construct the aggregations portion of the search request by using the `data.search.aggs` service.
    const aggs = [{ type: 'avg', params: { field: selectedNumericField!.name } }];
    const aggsDsl = data.search.aggs.createAggConfigs(dataView, aggs).toDsl();

    const req = {
      params: {
        index: dataView.title,
        body: {
          aggs: aggsDsl,
          query,
        },
      },
      // Add a custom request parameter to be consumed by `MyStrategy`.
      ...(strategy ? { get_cool: getCool } : {}),
    };

    const abortController = new AbortController();
    setAbortController(abortController);

    // Submit the search request using the `data.search` service.
    setRequest(req.params.body);
    setIsLoading(true);

    data.search
      .search(req, {
        strategy,
        sessionId,
        abortSignal: abortController.signal,
      })
      .subscribe({
        next: (res) => {
          if (isCompleteResponse(res)) {
            setIsLoading(false);
            setResponse(res);
            const avgResult: number | undefined = res.rawResponse.aggregations
              ? // @ts-expect-error @elastic/elasticsearch no way to declare a type for aggregation in the search response
                res.rawResponse.aggregations[1].value
              : undefined;
            const isCool = (res as IMyStrategyResponse).cool;
            const executedAt = (res as IMyStrategyResponse).executed_at;
            const message = (
              <EuiText>
                Searched {res.rawResponse.hits.total} documents. <br />
                The average of {selectedNumericField!.name} is{' '}
                {avgResult ? Math.floor(avgResult) : 0}.
                <br />
                {isCool ? `Is it Cool? ${isCool}` : undefined}
                <br />
                <EuiText data-test-subj="requestExecutedAt">
                  {executedAt ? `Executed at? ${executedAt}` : undefined}
                </EuiText>
              </EuiText>
            );
            notifications.toasts.addSuccess(
              {
                title: 'Query result',
                text: mountReactNode(message),
              },
              {
                toastLifeTimeMs: 300000,
              }
            );
            if (res.warning) {
              notifications.toasts.addWarning({
                title: 'Warning',
                text: mountReactNode(res.warning),
              });
            }
          } else if (isErrorResponse(res)) {
            // TODO: Make response error status clearer
            notifications.toasts.addDanger('An error has occurred');
          }
        },
        error: (e) => {
          setIsLoading(false);
          if (e instanceof AbortError) {
            notifications.toasts.addWarning({
              title: e.message,
            });
          } else {
            notifications.toasts.addDanger({
              title: 'Failed to run search',
              text: e.message,
            });
          }
        },
      });
  };

  const doSearchSourceSearch = async (otherBucket: boolean) => {
    if (!dataView) return;

    const query = data.query.queryString.getQuery();
    const filters = data.query.filterManager.getFilters();
    const timefilter = data.query.timefilter.timefilter.createFilter(dataView);
    if (timefilter) {
      filters.push(timefilter);
    }

    try {
      const searchSource = await data.search.searchSource.create();

      searchSource
        .setField('index', dataView)
        .setField('filter', filters)
        .setField('query', query)
        .setField('fields', selectedFields.length ? selectedFields.map((f) => f.name) : [''])
        .setField('size', selectedFields.length ? 100 : 0)
        .setField('trackTotalHits', 100);

      const aggDef = [];
      if (selectedBucketField) {
        aggDef.push({
          type: 'terms',
          schema: 'split',
          params: { field: selectedBucketField.name, size: 2, otherBucket },
        });
      }
      if (selectedNumericField) {
        aggDef.push({ type: 'avg', params: { field: selectedNumericField.name } });
      }
      if (aggDef.length > 0) {
        const ac = data.search.aggs.createAggConfigs(dataView, aggDef);
        searchSource.setField('aggs', ac);
      }

      setRequest(searchSource.getSearchRequestBody());
      const abortController = new AbortController();
      setAbortController(abortController);
      setIsLoading(true);
      const { rawResponse: res } = await searchSource
        .fetch$({ abortSignal: abortController.signal })
        .toPromise();
      setRawResponse(res);

      const message = <EuiText>Searched {res.hits.total} documents.</EuiText>;
      notifications.toasts.addSuccess(
        {
          title: 'Query result',
          text: mountReactNode(message),
        },
        {
          toastLifeTimeMs: 300000,
        }
      );
    } catch (e) {
      setRawResponse(e.body);
      if (e instanceof AbortError) {
        notifications.toasts.addWarning({
          title: e.message,
        });
      } else {
        notifications.toasts.addDanger({
          title: 'Failed to run search',
          text: e.message,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onClickHandler = () => {
    doAsyncSearch();
  };

  const onMyStrategyClickHandler = () => {
    doAsyncSearch('myStrategy');
  };

  const onWarningSearchClickHandler = () => {
    doAsyncSearch(undefined, undefined, true);
  };

  const onErrorSearchClickHandler = () => {
    doAsyncSearch(undefined, undefined, false, true);
  };

  const onPartialResultsClickHandler = () => {
    setSelectedTab(1);
    const req = {
      params: {
        n: fibonacciN,
      },
    };

    const abortController = new AbortController();
    setAbortController(abortController);

    // Submit the search request using the `data.search` service.
    setRequest(req.params);
    setIsLoading(true);
    data.search
      .search(req, {
        strategy: 'fibonacciStrategy',
        abortSignal: abortController.signal,
      })
      .subscribe({
        next: (res) => {
          setResponse(res);
          if (isCompleteResponse(res)) {
            setIsLoading(false);
            notifications.toasts.addSuccess({
              title: 'Query result',
              text: 'Query finished',
            });
          } else if (isErrorResponse(res)) {
            setIsLoading(false);
            // TODO: Make response error status clearer
            notifications.toasts.addWarning('An error has occurred');
          }
        },
        error: (e) => {
          setIsLoading(false);
          if (e instanceof AbortError) {
            notifications.toasts.addWarning({
              title: e.message,
            });
          } else {
            notifications.toasts.addDanger({
              title: 'Failed to run search',
              text: e.message,
            });
          }
        },
      });
  };

  const onClientSideSessionCacheClickHandler = () => {
    doAsyncSearch('myStrategy', data.search.session.getSessionId());
  };

  const onServerClickHandler = async () => {
    if (!dataView || !selectedNumericField) return;
    const abortController = new AbortController();
    setAbortController(abortController);
    setIsLoading(true);
    try {
      const res = await http.get(SERVER_SEARCH_ROUTE_PATH, {
        query: {
          index: dataView.title,
          field: selectedNumericField!.name,
        },
        signal: abortController.signal,
      });

      notifications.toasts.addSuccess(`Server returned ${JSON.stringify(res)}`);
    } catch (e) {
      if (e?.name === 'AbortError') {
        notifications.toasts.addWarning({
          title: e.message,
        });
      } else {
        notifications.toasts.addDanger({
          title: 'Failed to run search',
          text: e.message,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onSearchSourceClickHandler = (withOtherBucket: boolean) => {
    doSearchSourceSearch(withOtherBucket);
  };

  const reqTabs: EuiTabbedContentTab[] = [
    {
      id: 'request',
      name: <EuiText data-test-subj="requestTab">Request</EuiText>,
      content: (
        <>
          <EuiSpacer />
          <EuiText size="xs">Search body sent to ES</EuiText>
          <EuiCodeBlock
            language="json"
            fontSize="s"
            paddingSize="s"
            overflowHeight={450}
            isCopyable
            data-test-subj="requestCodeBlock"
          >
            {JSON.stringify(request, null, 2)}
          </EuiCodeBlock>
        </>
      ),
    },
    {
      id: 'response',
      name: <EuiText data-test-subj="responseTab">Response</EuiText>,
      content: (
        <>
          <EuiSpacer />
          <EuiText size="xs">
            <FormattedMessage
              id="cssFilters.timestampText"
              defaultMessage="Took: {time} ms"
              values={{ time: timeTook ?? 'Unknown' }}
            />
          </EuiText>
          <EuiProgress value={loaded} max={total} size="xs" data-test-subj="progressBar" />
          <EuiCodeBlock
            language="json"
            fontSize="s"
            paddingSize="s"
            overflowHeight={450}
            isCopyable
            data-test-subj="responseCodeBlock"
          >
            {JSON.stringify(rawResponse, null, 2)}
          </EuiCodeBlock>
        </>
      ),
    },
  ];

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
