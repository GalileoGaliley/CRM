import axios from "axios"
import classNames from "classnames"
import { DateTime } from "luxon"
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
import { httpClient, nError } from "../../funcs/base"
import { getDateRangeByPreset } from "../../funcs/reports"
import { CallArea } from "../../models/Calls"
import { DateRangePreset } from "../../models/Misc"
import {StoreDispatch, StoreState, mapDispatchToProps, mapStateToProps, store} from "../../store";

import "../../styles/pages/common/report-list.sass"
import {getActiveAccount} from "../../funcs";
import Account from "../../models/Account";
import qs from "qs";

interface Props {
  store: StoreState,
  dispatcher: StoreDispatch
}

interface CallsReport {

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

  areas: CallArea[]
}

const CallsAreaPage_List = connect(mapStateToProps, mapDispatchToProps)(function(props: Props) {

  const $router = useRoute()

  const activeAccount = getActiveAccount(props.store) as Account;
  const [$updater, $setUpdater] = useState<any>(Math.random())

  const [topFilterShown, setTopFilterShown] = useState(false)
  const [hashtagFilterShown, setHashtagFilterShown] = useState(false)

  const [reportIsDeprecated, setReportIsDeprecated] = useState(false)
  let user = store.getState().user;
  let timeZone = user?.time_zone;
  const [reportData, setReportData] = useState<CallsReport | null>(null)
  const [localInterface, setLocalInterface] = useState({

    search: '',

    dateRangeCalendarShown: false,
    dateRangePreset: "custom" as DateRangePreset,
    min_date: DateTime.now().setZone(timeZone).startOf('day').toJSDate(),
    max_date: DateTime.now().setZone(timeZone).endOf('day').toJSDate(),


    page: 1,
    max_rows: 100 as 50 | 100 | 250 | 500,

    filter_words: {

      source: [] as string[],
      area: [] as string[],
    },

    tag_words: [] as string[],

    searchFilters: [ ["source", "system"], ["inboud", "outbound"]],
    selectedSearchFilters: {type:['source'] as string[], direction:[] as string[]},

    sort: {
      field: 'area',
      direction: 'up' as 'up' | 'down'
    },
    sortFields: [{
      span: 'Area',
      value: 'area'
    },{
      span: 'Total Calls',
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

    if (!reportData) return
    
    if(localInterface.dateRangePreset === 'custom') return

    setLocalInterface({
      ...localInterface,
      ...(getDateRangeByPreset(localInterface.dateRangePreset, reportData?.interface.min_date, reportData?.interface.max_date))
    })

  }, [localInterface.dateRangePreset])

  // Load calls function
  async function loadCalls() {
    httpClient.defaults.headers['Authorization'] = `Bearer ${props.store.accessToken}`
    
    let activeFilters: any = {...localInterface.filter_words}
    Object.keys(localInterface.filter_words).forEach((key: any) => !activeFilters[key].length && delete activeFilters[key])

    try {
      const { data: calls } = (await httpClient.post('/calls/report/areas',  qs.stringify({
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
      }))) as {data: CallsReport}
      setReportData({
        ...calls,

        interface: {

          ...calls.interface,
          min_date: DateTime.fromISO(calls.interface.min_date as unknown as string).startOf('day').toJSDate(),
          max_date: DateTime.fromISO(calls.interface.max_date as unknown as string).endOf('day').toJSDate(),
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
    localInterface.max_rows
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
      <div className="CallsAreaPage_List" >
      
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
          <h1>Area</h1>
        </div>

        { /* List filters */}
        <ReportFilters
          onSearchInputChange={(value) => setLocalInterface({...localInterface, search: value})}

          dateRangePreset={localInterface.dateRangePreset}
          onDateRangePresetChange={(value) => setLocalInterface({ ...localInterface, dateRangePreset: value })}

          minDate={localInterface.min_date}
          onMinDateChange={(value) => setLocalInterface({...localInterface, min_date: value, dateRangePreset: 'custom'})}

          maxDate={localInterface.max_date}
          onMaxDateChange={(value) => setLocalInterface({...localInterface, max_date: value, dateRangePreset: 'custom'})}

          updateButtonActive={reportIsDeprecated}
          onUpdate={() => $setUpdater(Math.random())}
      
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
              }]} selectedOption="calls.areas" onChange={(value) => $router.router.navigate(value as string, {}, {reload: true})} />
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
          onSortFire={() => $setUpdater(Math.random())}
        />

        <div className="contents">

          {/* Wide desktop table */}
          <table className={classNames('table', '__show-on-wide', {
            __respectAsidePanel: props.store.navActive.is
          })}>
            <tr>
              <ReportTableField
                contents={(<span>Area</span>)}

                sortDirection={localInterface.sort.field === 'area' ? localInterface.sort.direction : undefined}
                onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {field: 'area', direction: value}})}

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
            {reportData.areas.map((callsArea, i) => (
              <tr key={i}>
                <td>{callsArea.area}</td>
                <td>{callsArea.total_calls}</td>
                <td>{callsArea.completed_calls}</td>
                <td>{callsArea.unanswered_calls}</td>
                <td>{callsArea.avg_duration}</td>
                <td>{callsArea.total_appointments}</td>
              </tr>
            ))}
          </table>

          {/* Medium desktop table */}
          <table className={classNames('table', '__hide-on-wide', '__hide-on-mobile', {
            __respectAsidePanel: props.store.navActive.is
          })}>
            <tr></tr>
            {reportData.areas.map((area, i) => (
              <tr key={i}>
                <td>
                  <div>{area.area}</div>
                  <div>&nbsp;</div>
                </td>
                <td>
                  <div>Total calls: {area.total_calls}</div>
                  <div>Avg duration: {area.avg_duration}</div>
                </td>
                <td>
                  <div>Completed: {area.completed_calls}</div>
                  <div>Unanswered: {area.unanswered_calls}</div>
                </td>
                <td>
                  <div>Total appointments: {area.total_appointments}</div>
                  <div>&nbsp;</div>
                </td>
              </tr>
            ))}
          </table>

          {/* Mobile table items */}
          <div className={classNames('mobile-table-items', '__show-on-mobile', {
            __respectAsidePanel: props.store.navActive.is
          })}>

            {reportData.areas.map((callsArea, i: number) => (
              <div className="item nogap negativeGap" key={i}>

                <div className="__top">

                  <div className="__left">
                    <div>
                      <strong>{callsArea.area}</strong>
                    </div>
                  </div>

                  <div className="__right">
                    <div>
                      Total calls: <span className="fw500">{callsArea.total_calls}</span>
                    </div>
                    <div>
                      Completed: <span className="green fw500">{callsArea.completed_calls}</span>
                    </div>
                    <div>
                      Unanswered: <span className="red fw500">{callsArea.unanswered_calls}</span>
                    </div>
                  </div>
                </div>

                <div className="__bottom">

                  <div className="__left">
                    <div>
                      <span className="gray">Avg Duration:</span>
                      <span> {callsArea.avg_duration}</span>
                    </div>
                    <div>
                      <span className="gray">Total appointments:</span>
                      <span> {callsArea.total_appointments}</span>
                    </div>
                  </div>

                  <div className="__right">
                  
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
          onSortFire={() => $setUpdater(Math.random())}
        />
      </div>
    ) : null}
  </>)
})
export default CallsAreaPage_List
