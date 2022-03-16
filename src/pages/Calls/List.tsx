import axios from "axios"
import classNames from "classnames"
import moment from "moment"
import { useEffect, useState } from "react";
import { connect } from "react-redux";
import { useRoute } from "react-router5"
import { Transition } from "react-transition-group"
import AudioPlayer from "../../components/AudioPlayer"
import Checkbox from "../../components/Checkbox"
import Icon from "../../components/Icon"
import ReportFilters from "../../components/reports/Filters"
import ReportTableControls from "../../components/reports/TableControls"
import ReportTableField from "../../components/reports/TableField"
import Select from "../../components/Select"
import { nError } from "../../funcs/base"
import { getDateRangeByPreset } from "../../funcs/reports"
import { Call } from "../../models/Calls"
import { DateRangePreset } from "../../models/Misc"
import {StoreDispatch, StoreState, mapDispatchToProps, mapStateToProps, store} from "../../store";

import "../../styles/pages/common/report-list.sass"
import {getActiveAccount, httpClient} from "../../funcs";
import Account from "../../models/Account";
import qs from "qs";
import filters from "../../components/reports/Filters";
import {DateTime} from "luxon";
import {userInfo} from "os";

interface Props {
  store: StoreState,
  dispatcher: StoreDispatch
}

type FilterWord = 'dispatcher' | 'friendly_name' | 'status'

interface CallsReport {

  interface: {

    filter_words: {

      dispatcher: string[],
      friendly_name: string[],
      status: string[]
    },

    tag_words: string[],

    max_pages: number,

    rows_start: number,
    rows_end: number,
    rows_all: number,

    min_date: Date,
    max_date: Date
  },

  permissions: {
    
    listen_call: boolean,
    show_client: boolean,
    show_appointment: boolean
  },

  dashboard: {
    calls: string,
    callers: string,
    missed_calls: string,
    active_calls: string
  },

  calls: Call[]
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CallsPage_List = connect(mapStateToProps, mapDispatchToProps)(function(props: Props) {

  const $router = useRoute()

  const activeAccount = getActiveAccount(props.store) as Account;
  const [$updater, $setUpdater] = useState<any>(Math.random())

  const [topFilterShown, setTopFilterShown] = useState(false)
  const [hashtagFilterShown, setHashtagFilterShown] = useState(false)
  let user = store.getState().user;
  let timeZone = user?.time_zone;
  const [reportIsDeprecated, setReportIsDeprecated] = useState(false)
  const now = DateTime.now().setZone('America/New_York').startOf('day').toJSDate().toString();
  const now1 = DateTime.now().setZone('America/New_York').endOf('day').toJSDate().toString();
  const [reportData, setReportData] = useState<CallsReport | null>(null)
  const [localInterface, setLocalInterface] = useState({

    search: '',

    callListenPopup: null as string | null,
    
    dateRangeCalendarShown: false,
    dateRangePreset: "custom" as DateRangePreset,


    min_date: DateTime.now().setZone(timeZone).startOf('day').toJSDate(),
    max_date: DateTime.now().setZone(timeZone).endOf('day').toJSDate(),
    page: 1,

    filter_words: {

      dispatcher: [] as string[],
      friendly_name: [] as string[],
      status: [] as string[],
    },

    tag_words: [] as string[],

    searchFilters: [ ["source", "system"], ["inboud", "outbound"]],
    selectedSearchFilters: {type:['source'] as string[], direction:[] as string[]},

    sort: {
      field: 'created_at',
      direction: 'up' as 'up' | 'down'
    },
    sortFields: [{
      span: 'Date',
      value: 'created_at'
    },{
      span: 'Dispatcher',
      value: 'dispatcher'
    },{
      span: 'Caller Name',
      value: 'caller_name'
    },{
      span: 'Client',
      value: 'client'
    },{
      span: 'From',
      value: 'call_from'
    },{
      span: 'Friendly Name',
      value: 'friendly_name'
    },{
      span: 'Extension',
      value: 'extension'
    },{
      span: 'Status',
      value: 'status'
    },{
      span: 'Duration',
      value: 'duration'
    }]

  })

  // Watch date range preset
  useEffect(() => {

    if(!reportData) return

    setLocalInterface({
      ...localInterface,
      ...(getDateRangeByPreset(localInterface.dateRangePreset, reportData?.interface.min_date, reportData?.interface.max_date))
    })

  }, [localInterface.dateRangePreset])

  // Load calls function
  async function loadCalls() {
    httpClient.defaults.headers['Authorization'] = `Bearer ${props.store.accessToken}`

    let activeFilters: any = {...localInterface.filter_words}
    Object.keys(localInterface.filter_words).forEach((key: any) => !activeFilters[key].length && delete activeFilters[key]);

    let reqData = {
      account_id: activeAccount.account_id,
      limit_rows: JSON.stringify(props.store.reportsMaxRows),
      page: JSON.stringify(localInterface.page),
      date_start: localInterface.min_date,
      date_end: localInterface.max_date,
      filter_tag: JSON.stringify(localInterface.tag_words),
      main_filter: JSON.stringify(localInterface.selectedSearchFilters),
      sort_field: localInterface.sort.field,
      sort_type: localInterface.sort.direction === 'up' ? 'asc' : 'desc',
      filter_field: JSON.stringify(activeFilters),
      ...(localInterface.search ? {search: localInterface.search} : {})
    };

    try {
      const { data: calls } = (await httpClient.post('/calls/report/calls',qs.stringify(reqData) )) as {data: CallsReport}

      setReportData({
        ...calls,

        interface: {

          ...calls.interface,
          min_date: moment(calls.interface.min_date).startOf('day').toDate(),
          max_date: moment(calls.interface.max_date).endOf('day').toDate(),

        }

      })


      setTimeout(() => {
        setReportIsDeprecated(false)
      }, 100)
    }
    catch (error) {
      nError(error)
    }

  }

  // Watch for deprecated
  useEffect(() => {
    if(!reportData) return
    setReportIsDeprecated(true)
  }, [
    localInterface.min_date,
    localInterface.max_date
  ])

  // Load calls on page mount
  useEffect(() => { loadCalls() }, [
    $updater,
    localInterface.page,
  ])

  // Is filter selected function
  function isFilterSelected(field: FilterWord, value: string) {
    return localInterface.filter_words[field].includes(value)
  }

  // Is all filters selected function
  function isAllFiltersSelected(field: FilterWord) {
    return localInterface.filter_words[field].length === 0
  }

  // Filter switch function
  function switchFilter(field: FilterWord, value: string, toggle: boolean) {

    let _arr = [...localInterface.filter_words[field]]

    if (toggle && value === "All") { _arr = [] }
    
    else if (!toggle) {

      while (true) {
        let i = _arr.findIndex((filter) => filter === value)
        if(i === -1) break
        _arr.splice(i, 1)
      }
    }
      
    else {

      if (reportData?.interface.filter_words[field].every((option) => _arr.concat([value]).includes(option)))
        _arr = []

      else if(_arr.findIndex((filter) => filter === value) === -1)
        _arr.push(value)
    }

    setLocalInterface({...localInterface, filter_words: {...localInterface.filter_words, [field]: _arr}})
  }

  // Is tag_word selected function
  function isTagWordSelected(value: string) {
    return localInterface.tag_words.includes(value)
  }
  
  // Is all tag words selected function
  function isAllTagWordsSelected() {
    return localInterface.tag_words.length === 0
  }

  // Toggle tagword function
  function switchTagWord(value: string, toggle: boolean) {

    let _arr = [...localInterface.tag_words]

    if (toggle && value === "All") {
      _arr = []
    }
    else if (!toggle) {

      while (true) {
        let i = _arr.findIndex((filter) => filter === value)
        if(i === -1) break
        _arr.splice(i, 1)
      }
    }
    else {

      if (reportData?.interface.tag_words.every((option) => _arr.concat([value]).includes(option))) {
        _arr = []
      }

      else if(_arr.findIndex((filter) => filter === value) === -1)
        _arr.push(value)
    }

    setLocalInterface({...localInterface, tag_words: _arr})
  }

  // Is search field selected function

  function isSearchFilterSelected(i:number, value: string, field: string) {

    if (field == 'type'){
      return localInterface.selectedSearchFilters.type.includes(value);
    }
    if (field == 'direction'){
      return localInterface.selectedSearchFilters.direction.includes(value);
    }
  }

  // Is all search fields selected function
  function isAllSearchFiltersSelected(i: number, field: string) {
    if (field == 'type'){
      return localInterface.selectedSearchFilters.type.length === 0
    }else if (field == 'direction'){
      return localInterface.selectedSearchFilters.direction.length === 0
    }

  }

  // Toggle search filter function
  function switchSearchFilter(i: number, value: string, toggle: boolean, field: string, $arr: string[] ) {
    let $arrType = $arr;
    let $object = localInterface.selectedSearchFilters;
      if (toggle && value === "All") {
        $arrType = [];
      }
      else if (toggle == false) {
        for (let i = 0; i < $arrType.length; i++){
          $arrType.map((v, index) => {
            if (v == value ){
              $arrType.splice(index, 1)
            }
          })
        }
      } else {
        $arrType.push(value);
      }

    if (field == 'type'){
      if ($arrType.length == localInterface.searchFilters[0].length) {
        $arrType = [];
      }
      $object.type = $arrType;
    }
    if (field == 'direction'){
      if ($arrType.length == localInterface.searchFilters[1].length) {
        $arrType = [];
      }
      $object.direction = $arrType;
    }
      setLocalInterface({...localInterface, selectedSearchFilters: $object})
  }

  // Render function
  return (<>
    {reportData ? (
      <div className="CallsPage_List" >
      
        { /* Reports grid */}
        <div className="reports-grid">
        
          <div className="cell">

            <div className="amount">{reportData.dashboard.calls}</div>
            <div className="legend">Calls</div>
          </div>

          <div className="cell">

            <div className="amount">{reportData.dashboard.callers}</div>
            <div className="legend">Callers</div>
          </div>

          <div className="cell">

            <div className="amount">{reportData.dashboard.missed_calls}</div>
            <div className="legend">Missed Calls</div>
          </div>

          <div className="cell">

            <div className="amount">{reportData.dashboard.active_calls}</div>
            <div className="legend">Active Calls</div>
          </div>
        </div>

        { /* Page header */}
        <div className="page-header">
          <h1>Calls</h1>
        </div>

        { /* List filters */}
        <ReportFilters
          onSearchInputChange={(value) => setLocalInterface({...localInterface, search: value})}

          dateRangePreset={localInterface.dateRangePreset}
          onDateRangePresetChange={(value) => setLocalInterface({ ...localInterface, dateRangePreset: value })}

          minDate={localInterface.min_date}
          onMinDateChange={(value) => setLocalInterface({...localInterface, min_date: value})}

          maxDate={localInterface.max_date}
          onMaxDateChange={(value) => setLocalInterface({...localInterface, max_date: value})}

          updateButtonActive={reportIsDeprecated}
          onUpdate={() => {
            setReportIsDeprecated(false);
            $setUpdater(Math.random());
          }}
      
          childrenAfterSearch={(<>
            <div tabIndex={-1} className="filter-button" onFocus={() => setTopFilterShown(true)} onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as any) && setTopFilterShown(false)}>
              <button className={classNames("_wa", "_rounded", "_iconed", {
                _blue: !isAllSearchFiltersSelected(0, 'type') || !isAllSearchFiltersSelected(1, 'direction')
              })}>
                <Icon icon="filter-8" />
              </button>

              <Transition in={topFilterShown} mountOnEnter={true} unmountOnExit={true} timeout={210}>
                {(state) => (
                  <div className={ classNames("filter-wrapper", `transition-fade-${state}`) }>
                    <Checkbox contents="All" value={isAllSearchFiltersSelected(0, 'type')} onChange={(value) => switchSearchFilter(0, "All", value, 'type', localInterface.selectedSearchFilters.type )} />
                    {localInterface.searchFilters[0].map((option, index) => (
                        <Checkbox contents={option} value={isSearchFilterSelected(0, option, 'type')} onChange={(value) => switchSearchFilter(1, option, value, 'type', localInterface.selectedSearchFilters.type)} />
                    ))}
                    <hr />
                    <Checkbox contents="All" value={isAllSearchFiltersSelected(1, 'direction')} onChange={(value) => switchSearchFilter(1, "All", value, 'direction', localInterface.selectedSearchFilters.direction )} />
                    {localInterface.searchFilters[1].map((option, index) => (
                      <Checkbox contents={option} value={isSearchFilterSelected(1, option, 'direction')} onChange={(value) => switchSearchFilter(1, option, value, 'direction', localInterface.selectedSearchFilters.direction )} />
                    ))}
                    <button onClick={()=>{
                      $setUpdater(Math.random());
                    }} className="_bordered _blue _wa">
                      Filter
                    </button>
                  </div>
                )}
              </Transition>
            </div>
            
            <div tabIndex={-1} className="filter-button" onFocus={() => setHashtagFilterShown(true)} onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as any) && setHashtagFilterShown(false)}>
              <button className={classNames("_wa", "_rounded", "_iconed", {
                _blue: !isAllTagWordsSelected()
              })}>
                <Icon icon="hashtag-1" />
              </button>

              <Transition in={hashtagFilterShown} mountOnEnter={true} unmountOnExit={true} timeout={210}>
                {(state) => (
                  <div className={ classNames("filter-wrapper", `transition-fade-${state}`) }>
                    <Checkbox contents="All" value={isAllTagWordsSelected()} onChange={(value) => switchTagWord("All", value)} />
                    {reportData.interface.tag_words.map((option, i) => (
                      <Checkbox contents={option} key={i} value={isTagWordSelected(option)} onChange={(value) => switchTagWord(option, value)} />
                    ))}
                    <button className="_bordered _blue _wa">
                      Filter
                    </button>
                  </div>
                )}
              </Transition>
            </div>
          </>)}

          childrenBeforeDateType={(<>
            <div>
              <Select zeroed={true} options={[{
                span: 'Calls',
                value: 'calls'
              }, {
                span: 'Sources',
                value: 'calls.sources'
              },{
                span: 'Area',
                value: 'calls.areas'
              },{
                span: 'Numbers',
                value: 'calls.numbers'
              }]} selectedOption="calls" onChange={(value) => $router.router.navigate(value as string, {}, {reload: true})} />
            </div>
          </>)}
        />

        {/* Table controls */}
        <ReportTableControls
          zIndex={5}
          
          onMaxRowsChange={() => {
            $setUpdater(Math.random())
          }}

          amount={{
            total: reportData.interface.rows_all,
            start: reportData.interface.rows_start,
            end: reportData.interface.rows_end
          }}

          page={localInterface.page}
          maxPages={reportData.interface.max_pages}
          onPagesStart={() => setLocalInterface({...localInterface, page: 1})}
          onPrevPage={() => setLocalInterface({...localInterface, page: localInterface.page-1})}
          onNextPage={() => setLocalInterface({...localInterface, page: localInterface.page+1})}
          onPagesEnd={() => setLocalInterface({...localInterface, page: reportData.interface.max_pages})}
          
          sort={localInterface.sort}
          sortFields={localInterface.sortFields}
          onSortFieldChange={(value) => setLocalInterface({...localInterface, sort: {...localInterface.sort, field: value}})}
          onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {...localInterface.sort, direction: value}})}
          onSortFire={() => 0}
        />

        <div className="contents">

          {/* Wide desktop table */}
          <table className={classNames('table', '__show-on-wide', {
            __respectAsidePanel: props.store.navActive.is
          })}>
            <tr>
              <ReportTableField
                contents={(<span>Date</span>)}
              
                sortDirection={localInterface.sort.field === 'created_at' ? localInterface.sort.direction : undefined}
                onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {field: 'created_at', direction: value}})}

                onFilterFire={() => $setUpdater(Math.random())}
              />
              <th></th>
              <ReportTableField
                contents={(<span>Dispatcher</span>)}

                allFiltersSelected={isAllFiltersSelected("dispatcher")}
                onAllFiltersChange={(value) => switchFilter("dispatcher", "All", value)}

                filterWords={reportData.interface.filter_words.dispatcher.map((filterWord) => ({
                  word: filterWord,
                  selected: isFilterSelected("dispatcher", filterWord)
                }))}
                onFilterChange={(value) => switchFilter("dispatcher", value.word, value.selected)}

                sortDirection={localInterface.sort.field === 'dispatcher' ? localInterface.sort.direction : undefined}
                onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {field: 'dispatcher', direction: value}})}

                onFilterFire={() => $setUpdater(Math.random())}
              />
              <ReportTableField
                contents={(<span>Caller Name</span>)}

                sortDirection={localInterface.sort.field === 'caller_name' ? localInterface.sort.direction : undefined}
                onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {field: 'caller_name', direction: value}})}

                onFilterFire={() => $setUpdater(Math.random())}
              />
              <ReportTableField
                contents={(<span>Client</span>)}

                sortDirection={localInterface.sort.field === 'client' ? localInterface.sort.direction : undefined}
                onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {field: 'client', direction: value}})}

                onFilterFire={() => $setUpdater(Math.random())}
              />
              <ReportTableField
                contents={(<span>From</span>)}

                sortDirection={localInterface.sort.field === 'call_from' ? localInterface.sort.direction : undefined}
                onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {field: 'call_from', direction: value}})}

                onFilterFire={() => $setUpdater(Math.random())}
              />
              <ReportTableField
                contents={(<span>Friendly name</span>)}

                allFiltersSelected={isAllFiltersSelected("friendly_name")}
                onAllFiltersChange={(value) => switchFilter("friendly_name", "All", value)}

                filterWords={reportData.interface.filter_words.friendly_name.map((filterWord) => ({
                  word: filterWord,
                  selected: isFilterSelected("friendly_name", filterWord)
                }))}
                onFilterChange={(value) => switchFilter("friendly_name", value.word, value.selected)}

                sortDirection={localInterface.sort.field === 'friendly_name' ? localInterface.sort.direction : undefined}
                onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {field: 'friendly_name', direction: value}})}

                onFilterFire={() => $setUpdater(Math.random())}
              />
              <ReportTableField
                contents={(<span>To</span>)}

                sortDirection={localInterface.sort.field === 'call_to' ? localInterface.sort.direction : undefined}
                onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {field: 'call_to', direction: value}})}

                onFilterFire={() => $setUpdater(Math.random())}
              />
              <ReportTableField
                contents={(<span>Extension</span>)}

                sortDirection={localInterface.sort.field === 'extension' ? localInterface.sort.direction : undefined}
                onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {field: 'extension', direction: value}})}

                onFilterFire={() => $setUpdater(Math.random())}
              />
              <th></th>
              <ReportTableField
                contents={(<span>Status</span>)}

                allFiltersSelected={isAllFiltersSelected("status")}
                onAllFiltersChange={(value) => switchFilter("status", "All", value)}

                filterWords={reportData.interface.filter_words.status.map((filterWord) => ({
                  word: filterWord,
                  selected: isFilterSelected("status", filterWord)
                }))}
                onFilterChange={(value) => switchFilter("status", value.word, value.selected)}

                sortDirection={localInterface.sort.field === 'status' ? localInterface.sort.direction : undefined}
                onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {field: 'status', direction: value}})}

                onFilterFire={() => $setUpdater(Math.random())}
              />
              <ReportTableField
                contents={(<span>Duration</span>)}

                sortDirection={localInterface.sort.field === 'avg_duration' ? localInterface.sort.direction : undefined}
                onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {field: 'avg_duration', direction: value}})}

                onFilterFire={() => $setUpdater(Math.random())}
              />
              <th></th>
            </tr>
            {reportData.calls.map((call, i) => (
              <tr key={i}>
                <td>{call.created_at}</td>
                <td>
                  <button className={classNames('_zeroed', '_iconed', {
                    _red: call.status === 'Canceled',
                    _green: call.status === 'Completed' && call.direction === 'inbound',
                    _blue: (
                      call.status === 'Completed' && call.direction === 'outbound'
                    ) || (
                      call.status === 'Active'
                    )
                  })}>
                    <Icon icon="arrow-20" className={classNames({
                      '_rotated-180': call.direction === 'outbound'
                    })} />
                  </button>
                </td>
                <td>{call.dispatcher}</td>
                <td>{call.caller_name}</td>
                <td>{call.client ? (
                  <div className="flex-container" style={{gap: '5px'}}>
                    <button className="_zeroed _iconed _gray">
                      <Icon icon="user-32" />
                    </button>
                    <span>{call.client}</span>
                  </div>
                ) : null}</td>
                <td>{call.call_from}</td>
                <td>{call.friendly_name}</td>
                <td>{call.call_to}</td>
                <td>{call.extension}</td>
                <td>
                  {call.is_appointment ? (
                    <button className={classNames('_zeroed', '_iconed', {
                      _green: call.is_appointment === 'main',
                      _blue: call.is_appointment === 'lead'
                    })}>
                      <Icon icon="clipboard-5" />
                    </button>
                  ) : null}
                </td>
                <td className={classNames({
                  'red-text': call.status === 'Canceled',
                  'green-text': call.status === 'Completed',
                  'blue-text': !['Canceled', 'Completed'].includes(call.status),
                })}>{call.status}</td>
                <td>{call.duration}</td>
                <td>
                  {call.call_url ? (
                    <button className="_zeroed _iconed" onClick={() => setLocalInterface({...localInterface, callListenPopup: call.call_url})}>
                      <Icon icon="media-control-48" />
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </table>

          {/* Medium screen table */}
          <table className={classNames('table', '__hide-on-wide', '__hide-on-mobile', {
            __respectAsidePanel: props.store.navActive.is
          })}>
            <tr></tr>
            {reportData.calls.map((call, i) => (
              <tr key={i}>
                <td>
                  <div>2675NSM-A-01X</div>
                  <div className="flex-container _gap-narrow">
                    <button className={classNames('_zeroed', '_iconed', {
                      _red: call.status === 'Canceled',
                      _green: call.status === 'Completed' && call.direction === 'inbound',
                      _blue: (
                        call.status === 'Completed' && call.direction === 'outbound'
                      ) || (
                        call.status === 'Active'
                      )
                    })}>
                      <Icon icon="arrow-20" className={classNames({
                        '_rotated-180': call.direction === 'outbound'
                      })} />
                    </button>
                    <span>Dispatcher: {call.dispatcher}</span>
                  </div>
                </td>
                <td>
                  <div>
                    {call.caller_name}
                  </div>
                  {call.client ? (
                    <div className="flex-container" style={{gap: '5px'}}>
                      <button className="_zeroed _iconed _gray">
                        <Icon icon="user-32" />
                      </button>
                      <span>{call.client}</span>
                    </div>
                  ) : <span>&nbsp;</span>}
                </td>
                <td>
                  <div>From: {call.call_from}</div>
                  <div>To: {call.call_to}</div>
                </td>
                <td>
                  <div>{call.friendly_name}</div>
                  <div>Extension: {call.extension}</div>
                </td>
                <td>
                  {call.is_appointment ? (
                    <button className={classNames('_zeroed', '_iconed', {
                      _green: call.is_appointment === 'main',
                      _blue: call.is_appointment === 'lead'
                    })}>
                      <Icon icon="clipboard-5" />
                    </button>
                  ) : null}
                </td>
                <td>
                  <div className={classNames({
                    'red-text': call.status === 'Canceled',
                    'green-text': call.status === 'Completed',
                    'blue-text': !['Canceled', 'Completed'].includes(call.status),
                  })}>{call.status}</div>
                  <div className="flex-container _gap-narrow">
                    <div>{call.duration}</div>
                    {call.call_url ? (
                      <button className="_zeroed _iconed" onClick={() => setLocalInterface({...localInterface, callListenPopup: call.call_url})}>
                        <Icon icon="media-control-48" />
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </table>

          {/* Mobile table items */}
          <div className={classNames('mobile-table-items', '__show-on-mobile', {
            __respectAsidePanel: props.store.navActive.is
          })}>

            {reportData.calls.map((call, i: number) => (
              <div className="item" key={i}>

                <div className="__top">

                  <div className="__left">
                    <div className="flex-container">
                      <button className={classNames('_zeroed', '_iconed', {
                        _red: call.status === 'Canceled',
                        _green: call.status === 'Completed' && call.direction === 'inbound',
                        _blue: (
                          call.status === 'Completed' && call.direction === 'outbound'
                        ) || (
                          call.status === 'Active'
                        )
                      })}>
                        <Icon icon="arrow-20" className={classNames({
                          '_rotated-180': call.direction === 'outbound'
                        })} />
                      </button>
                      <strong>{call.friendly_name}</strong>
                    </div>
                    <div>
                      <strong>{call.caller_name}</strong>
                    </div>
                    {call.client ? (
                      <div className="flex-container" style={{gap: '5px'}}>
                        <button className="_zeroed _iconed _gray">
                          <Icon icon="user-32" />
                        </button>
                        <span>{call.client}</span>
                      </div>
                    ) : (<span>&nbsp;</span>)}
                  </div>

                  <div className="__right">
                    <div className={classNames({
                      'red-text': call.status === 'Canceled',
                      'green-text': call.status === 'Completed',
                      'blue-text': !['Canceled', 'Completed'].includes(call.status),
                    })}>
                      {call.status}
                    </div>
                    <div className="flex-container">
                      <span>{call.duration}</span>
                      {call.call_url ? (
                        <button className="_zeroed _iconed" onClick={() => setLocalInterface({...localInterface, callListenPopup: call.call_url})}>
                          <Icon icon="media-control-48" />
                        </button>
                      ) : null}
                    </div>
                    {call.is_appointment ? (
                      <div>
                        <button className={classNames('_zeroed', '_iconed', {
                          _green: call.is_appointment === 'main',
                          _blue: call.is_appointment === 'lead'
                        })}>
                          <Icon icon="clipboard-5" />
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="__bottom">

                  <div className="__left">
                    <div>
                      <span className="gray">From:</span>
                      <span> {call.call_from}</span>
                    </div>
                    <div>
                      <span className="gray">To:</span>
                      <span> {call.call_to}</span>
                    </div>
                    <div>
                      <span className="gray">Extension:</span>
                      <span> {call.extension}</span>
                    </div>
                  </div>

                  <div className="__right">
                    <div>
                      {call.created_at}
                    </div>
                    <div>
                      Dispatcher: {call.dispatcher}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Table controls */}
        <ReportTableControls
          isUnder={true}

          onMaxRowsChange={() => $setUpdater(Math.random())}

          amount={{
            total: reportData.interface.rows_all,
            start: reportData.interface.rows_start,
            end: reportData.interface.rows_end
          }}

          page={localInterface.page}
          maxPages={reportData.interface.max_pages}
          onPagesStart={() => setLocalInterface({...localInterface, page: 1})}
          onPrevPage={() => setLocalInterface({...localInterface, page: localInterface.page-1})}
          onNextPage={() => setLocalInterface({...localInterface, page: localInterface.page+1})}
          onPagesEnd={() => setLocalInterface({...localInterface, page: reportData.interface.max_pages})}
          
          sort={localInterface.sort}
          sortFields={localInterface.sortFields}
          onSortFieldChange={(value) => setLocalInterface({...localInterface, sort: {...localInterface.sort, field: value}})}
          onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {...localInterface.sort, direction: value}})}
          onSortFire={() => 0}
        />

        {/* Call listen popup */}
        {localInterface.callListenPopup ? (
          <div className="popup callListenPopup" onClick={() => setLocalInterface({...localInterface, callListenPopup: null})}>

            <div className="wrapper" onClick={(e) => e.stopPropagation()}>
            
              <div className="call-player">
                <AudioPlayer audioSrc={localInterface.callListenPopup} />
              </div>
            </div>
          </div>
        ) : null}
      </div>
    ) : null}
  </>)
})
export default CallsPage_List
