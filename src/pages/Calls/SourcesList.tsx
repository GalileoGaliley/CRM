import axios from "axios"
import classNames from "classnames"
import moment from "moment"
import { useEffect, useState } from "react";
import { connect } from "react-redux";
import { useRoute } from "react-router5"
import { Transition } from "react-transition-group"
import Checkbox from "../../components/Checkbox"
import Icon from "../../components/Icon"
import ReportFilters from "../../components/reports/Filters"
import ReportTableControls from "../../components/reports/TableControls"
import ReportTableField from "../../components/reports/TableField"
import Select from "../../components/Select"
import { nError } from "../../funcs/base"
import { getDateRangeByPreset } from "../../funcs/reports"
import { CallSource } from "../../models/Calls"
import { DateRangePreset } from "../../models/Misc"
import {StoreDispatch, StoreState, mapDispatchToProps, mapStateToProps, store} from "../../store";

import "../../styles/pages/common/report-list.sass"
import {getActiveAccount, httpClient} from "../../funcs";
import Account from "../../models/Account";
import {DateTime} from "luxon";

interface Props {
  store: StoreState,
  dispatcher: StoreDispatch
}

interface CallsSourcesReport {

  interface: {

    tag_words: string[],

    max_pages: number,

    rows_start: number,
    rows_end: number,
    rows_all: number,

    min_date: Date,
    max_date: Date
  },

  dashboard: {

    calls: string,
    callers: string,
    missed_calls: string,
    active_calls: string
  },

  sources: CallSource[]
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CallsSourcesPage_List = connect(mapStateToProps, mapDispatchToProps)(function(props: Props) {

  const activeAccount = getActiveAccount(props.store) as Account;
  const $router = useRoute()
  const [$updater, $setUpdater] = useState<any>(Math.random())

  const [topFilterShown, setTopFilterShown] = useState(false)
  const [hashtagFilterShown, setHashtagFilterShown] = useState(false)

  const [reportIsDeprecated, setReportIsDeprecated] = useState(false)
  let user = store.getState().user;
  let timeZone = user?.time_zone;
  const [reportData, setReportData] = useState<CallsSourcesReport | null>(null)
  const [localInterface, setLocalInterface] = useState({

    search: '',
    
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
      field: 'source',
      direction: 'up' as 'up' | 'down'
    },
    sortFields: [{
      span: 'Source',
      value: 'source'
    },{
      span: 'Total calls',
      value: 'total_calls'
    },{
      span: 'Completed',
      value: 'completed_calls'
    },{
      span: 'Unanswered',
      value: 'unanswered_calls'
    },{
      span: 'Avg Duration',
      value: 'avg_duration'
    },{
      span: 'Total appointments',
      value: 'total_appointments'
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
    let activeFilters: any = {...localInterface.filter_words}
    Object.keys(localInterface.filter_words).forEach((key: any) => !activeFilters[key].length && delete activeFilters[key]);
    try {
      const { data: calls } = (await httpClient.post('/calls/report/sources', {
        account_id: activeAccount.account_id,
        limit_rows: JSON.stringify(props.store.reportsMaxRows),
        page: JSON.stringify(localInterface.page),
        date_start: localInterface.min_date.toISOString(),
        date_end: localInterface.max_date.toISOString(),
        filter_tag: JSON.stringify(localInterface.tag_words),
        main_filter: JSON.stringify(localInterface.selectedSearchFilters),
        sort_field: localInterface.sort.field,
        sort_type: localInterface.sort.direction === 'up' ? 'asc' : 'desc',
        filter_field: JSON.stringify(activeFilters),
        ...(localInterface.search ? {search: localInterface.search} : {})
      })) as {data: CallsSourcesReport}

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
    localInterface.page
  ])

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
      <div className="CallsSourcesPage_List" >
      
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
          <h1>Sources</h1>
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
            $setUpdater(Math.random())
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
              }]} selectedOption="calls.sources" onChange={(value) => $router.router.navigate(value as string, {}, {reload: true})} />
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
                contents={(<span>Source</span>)}

                sortDirection={localInterface.sort.field === 'source' ? localInterface.sort.direction : undefined}
                onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {field: 'source', direction: value}})}

                onFilterFire={() => $setUpdater(Math.random())}
              />
              <ReportTableField
                contents={(<span>Total calls</span>)}

                sortDirection={localInterface.sort.field === 'total_calls' ? localInterface.sort.direction : undefined}
                onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {field: 'total_calls', direction: value}})}

                onFilterFire={() => $setUpdater(Math.random())}
              />
              <ReportTableField
                contents={(<span>Completed</span>)}

                sortDirection={localInterface.sort.field === 'completed_calls' ? localInterface.sort.direction : undefined}
                onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {field: 'completed_calls', direction: value}})}

                onFilterFire={() => $setUpdater(Math.random())}
              />
              <ReportTableField
                contents={(<span>Unanswered</span>)}

                sortDirection={localInterface.sort.field === 'unanswered_calls' ? localInterface.sort.direction : undefined}
                onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {field: 'unanswered_calls', direction: value}})}

                onFilterFire={() => $setUpdater(Math.random())}
              />
              <ReportTableField
                contents={(<span>Avg Duration</span>)}

                sortDirection={localInterface.sort.field === 'avg_duration' ? localInterface.sort.direction : undefined}
                onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {field: 'avg_duration', direction: value}})}

                onFilterFire={() => $setUpdater(Math.random())}
              />
              <ReportTableField
                contents={(<span>Total appointments</span>)}

                sortDirection={localInterface.sort.field === 'total_appointments' ? localInterface.sort.direction : undefined}
                onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {field: 'total_appointments', direction: value}})}

                onFilterFire={() => $setUpdater(Math.random())}
              />
            </tr>
            {reportData.sources.map((callSource, i) => (
              <tr key={i}>
                <td>{callSource.source}</td>
                <td>{callSource.total_calls}</td>
                <td>{callSource.completed_calls}</td>
                <td>{callSource.unanswered_calls}</td>
                <td>{callSource.avg_duration}</td>
                <td>{callSource.total_appointments}</td>
              </tr>
            ))}
          </table>

          {/* Medium desktop table */}
          <table className={classNames('table', '__hide-on-wide', '__hide-on-mobile', {
            __respectAsidePanel: props.store.navActive.is
          })}>
            <tr></tr>
            {reportData.sources.map((callSource, i) => (
              <tr key={i}>
                <td>
                  <div>{callSource.source}</div>
                </td>
                <td>
                  <div>Total calls: {callSource.total_calls}</div>
                  <div>Avg Duration: {callSource.avg_duration}</div>
                </td>
                <td>
                  <div>Completed: {callSource.completed_calls}</div>
                  <div>Unanswered: {callSource.unanswered_calls}</div>
                </td>
                <td>
                  <div>Total appointments: {callSource.total_appointments}</div>
                </td>
              </tr>
            ))}
          </table>

          {/* Mobile table items */}
          <div className={classNames('mobile-table-items', '__show-on-mobile', {
            __respectAsidePanel: props.store.navActive.is
          })}>

            {reportData.sources.map((callSource, i: number) => (
              <div className="item nogap negativeGap" key={i}>

                <div className="__top">

                  <div className="__left">
                    <div>
                      <strong>{callSource.source}</strong>
                    </div>
                  </div>

                  <div className="__right">
                    <div>
                      Total calls: <span className="fw500">{callSource.total_calls}</span>
                    </div>
                    <div>
                      Completed: <span className="green fw500">{callSource.completed_calls}</span>
                    </div>
                    <div>
                      Unanswered: <span className="red fw500">{callSource.unanswered_calls}</span>
                    </div>
                  </div>
                </div>

                <div className="__bottom">

                  <div className="__left">
                    <div>
                      <span className="gray">Avg Duration:</span>
                      <span> {callSource.avg_duration}</span>
                    </div>
                    <div>
                      <span className="gray">Total Appointments:</span>
                      <span> {callSource.total_appointments}</span>
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
      </div>
    ) : null}
  </>)
})
export default CallsSourcesPage_List
