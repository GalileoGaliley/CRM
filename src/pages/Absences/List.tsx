import axios from "axios"
import classNames from "classnames"
import { DateTime } from "luxon"
import { useEffect, useState } from "react";
import { connect } from "react-redux";
import { useRoute } from "react-router5"
import Icon from "../../components/Icon"
import ReportFilters from "../../components/reports/Filters"
import ReportTableControls from "../../components/reports/TableControls"
import ReportTableField from "../../components/reports/TableField"
import { httpClient, nError } from "../../funcs/base"
import { getDateRangeByPreset } from "../../funcs/reports"
import Absence from "../../models/Absence"
import { DateRangePreset } from "../../models/Misc"
import {StoreDispatch, StoreState, mapDispatchToProps, mapStateToProps, store} from "../../store";

import "../../styles/pages/common/report-list.sass"
import qs from "qs";
import {getActiveAccount} from "../../funcs";
import Account from "../../models/Account";

interface Props {
  store: StoreState,
  dispatcher: StoreDispatch
}

type FilterWord = 'area' | 'created_by' | 'service_resource'

interface AbsencesReport {

  interface: {

    filter_words: {

      area: string[],
      created_by: string[],
      service_resource: string[]
    },

    max_pages: number,
    rows_start: number,
    rows_end: number,
    rows_all: number,
    
    min_date: Date,
    max_date: Date
  },

  permissions: {
    show_absence: boolean,
  },

  absences: Absence[]
}

const AbsencesPage_List = connect(mapStateToProps, mapDispatchToProps)(function(props: Props) {

  const $router = useRoute()

  const activeAccount = getActiveAccount(props.store) as Account
  const [reportIsDeprecated, setReportIsDeprecated] = useState(false)

  const [$updater, $setUpdater] = useState<any>(Math.random())
  let user = store.getState().user;
  let timeZone = user?.time_zone;
  const [reportData, setReportData] = useState<AbsencesReport | null>(null)
  const [localInterface, setLocalInterface] = useState({

    search: '',

    dateRangeCalendarShown: false,
    dateRangeType: "schedule" as "created" | "schedule",
    dateRangePreset: "custom" as DateRangePreset,
    min_date: DateTime.now().setZone(timeZone).startOf('day').toJSDate(),
    max_date: DateTime.now().setZone(timeZone).endOf('day').toJSDate(),

    page: 1,

    filter_words: {
      area: [] as string[],
      created_by: [] as string[],
      service_resource: [] as string[]
    },

    sort: {
      field: 'created_at',
      direction: 'up' as 'up' | 'down'
    },
    sortFields: [{
      span: 'Date',
      value: 'created_at'
    },{
      span: 'Area',
      value: 'area'
    },{
      span: 'Service Resource',
      value: 'service_resource'
    },{
      span: 'Absence Start',
      value: 'absence_start'
    },{
      span: 'Absence End',
      value: 'absence_end'
    },{
      span: 'Created by',
      value: 'created_by'
    }]

  })

  // Watch date range preset
  useEffect(() => {

    if(!reportData) return

    if(localInterface.dateRangePreset === 'custom') return

    setLocalInterface({
      ...localInterface,
      ...(getDateRangeByPreset(localInterface.dateRangePreset, reportData?.interface.min_date, reportData?.interface.max_date))
    })

  }, [localInterface.dateRangePreset])

  // Load absences function
  async function loadAbsences() {

    httpClient.defaults.headers['Authorization'] = `Bearer ${props.store.accessToken}`
    
    let activeFilters: any = {...localInterface.filter_words}
    Object.keys(localInterface.filter_words).forEach((key: any) => !activeFilters[key].length && delete activeFilters[key])

    try {
      const { data: absencesReport } = (await httpClient.post('/absences/report', qs.stringify({
        account_id:activeAccount.account_id,
        limit_rows: props.store.reportsMaxRows,
        page: localInterface.page,
        date_type: localInterface.dateRangeType,
        date_start: localInterface.min_date.toISOString(),
        date_end:localInterface.max_date.toISOString(),
        sort_field: localInterface.sort.field,
        sort_type: localInterface.sort.direction === 'up' ? 'asc' : 'desc',
        filter_field: JSON.stringify(activeFilters),
        ...(localInterface.search ? {search: localInterface.search} : {})

      }))) as {data: AbsencesReport}

      setReportData({
        ...absencesReport,

        interface: {

          ...absencesReport.interface,
          min_date: DateTime.fromISO(absencesReport.interface.min_date as unknown as string).startOf('day').toJSDate(),
          max_date: DateTime.fromISO(absencesReport.interface.max_date as unknown as string).endOf('day').toJSDate(),
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

  // Load absences on page mount
  useEffect(() => { loadAbsences() }, [
    $updater,
    localInterface.page,
  ])

  // Watch for deprecated
  useEffect(() => {
    if(!reportData) return
    setReportIsDeprecated(true)
  }, [
    localInterface.min_date,
    localInterface.max_date,
    localInterface.dateRangeType,
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

  // Render function
  return (<>
    {reportData ? (
      <div className="AbsencesPage_List" >

        { /* Page header */}
        <div className="page-header">
          <h1>Absences</h1>
        </div>

        { /* List filters */}
        <ReportFilters
          onSearchInputChange={(value) => setLocalInterface({...localInterface, search: value})}

          dateRangeType={localInterface.dateRangeType}
          onDateRangeTypeChange={(value) => setLocalInterface({...localInterface, dateRangeType: value as any})}

          dateRangePreset={localInterface.dateRangePreset}
          onDateRangePresetChange={(value) => setLocalInterface({ ...localInterface, dateRangePreset: value })}

          minDate={localInterface.min_date}
          onMinDateChange={(value) => setLocalInterface({...localInterface, min_date: value, dateRangePreset: 'custom'})}

          maxDate={localInterface.max_date}
          onMaxDateChange={(value) => setLocalInterface({...localInterface, max_date: value, dateRangePreset: 'custom'})}

          updateButtonActive={reportIsDeprecated}
          onUpdate={() => $setUpdater(Math.random())}
        />

        {/* Table controls */}
        <ReportTableControls
          zIndex={5}
          
          onMaxRowsChange={() => {$setUpdater(Math.random());}}

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
          onSortDirectionChange={(value) => setLocalInterface({ ...localInterface, sort: { ...localInterface.sort, direction: value } })}
          onSortFire={() => $setUpdater(Math.random())}

          addButton={(
            <div className="add-button-wrapper">
              <button className="_iconed _rounded add-button" onClick={() => $router.router.navigate('absences.new')}>
                <Icon icon="plus-thin" />
                <span>Add Absence</span>
                <Icon icon="time-16" />
              </button>
            </div>
          )}
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
              <ReportTableField
                contents={(<span>Service resource</span>)}

                allFiltersSelected={isAllFiltersSelected("service_resource")}
                onAllFiltersChange={(value) => switchFilter("service_resource", "All", value)}

                filterWords={reportData.interface.filter_words.service_resource.map((filterWord) => ({
                  word: filterWord,
                  selected: isFilterSelected("service_resource", filterWord)
                }))}
                onFilterChange={(value) => switchFilter("service_resource", value.word, value.selected)}

                sortDirection={localInterface.sort.field === 'service_resource' ? localInterface.sort.direction : undefined}
                onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {field: 'service_resource', direction: value}})}

                onFilterFire={() => $setUpdater(Math.random())}
              />
              <ReportTableField
                contents={(<span>Area</span>)}

                allFiltersSelected={isAllFiltersSelected("area")}
                onAllFiltersChange={(value) => switchFilter("area", "All", value)}

                filterWords={reportData.interface.filter_words.area.map((filterWord) => ({
                  word: filterWord,
                  selected: isFilterSelected("area", filterWord)
                }))}
                onFilterChange={(value) => switchFilter("area", value.word, value.selected)}
                sortDirection={localInterface.sort.field === 'area' ? localInterface.sort.direction : undefined}
                onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {field: 'area', direction: value}})}

                onFilterFire={() => $setUpdater(Math.random())}
              />
              <ReportTableField
                contents={(<span>Absence Start</span>)}

                sortDirection={localInterface.sort.field === 'absence_start' ? localInterface.sort.direction : undefined}
                onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {field: 'absence_start', direction: value}})}

                onFilterFire={() => $setUpdater(Math.random())}
              />
              <ReportTableField
                contents={(<span>Absence End</span>)}
              
                sortDirection={localInterface.sort.field === 'absence_end' ? localInterface.sort.direction : undefined}
                onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {field: 'absence_end', direction: value}})}

                onFilterFire={() => $setUpdater(Math.random())}
              />
              <ReportTableField
                contents={(<span>Created by</span>)}

                allFiltersSelected={isAllFiltersSelected("created_by")}
                onAllFiltersChange={(value) => switchFilter("created_by", "All", value)}

                filterWords={reportData.interface.filter_words.created_by.map((filterWord) => ({
                  word: filterWord,
                  selected: isFilterSelected("created_by", filterWord)
                }))}
                onFilterChange={(value) => switchFilter("created_by", value.word, value.selected)}

                sortDirection={localInterface.sort.field === 'created_by' ? localInterface.sort.direction : undefined}
                onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {field: 'created_by', direction: value}})}

                onFilterFire={() => $setUpdater(Math.random())}
              />
            </tr>
            {reportData.absences.map((absence, i) => (
              <tr key={i} onClick={() => $router.router.navigate('absences.item', {
                absenceId: absence.absence_id
              }, {reload: true})}>
                <td>{absence.created_at}</td>
                <td>{absence.service_resource}</td>
                <td>{absence.area}</td>
                <td>{absence.absence_start}</td>
                <td>{absence.absence_end}</td>
                <td>{absence.created_by}</td>
              </tr>
            ))}
          </table>

          {/* Medium desktop table */}
          <table className={classNames('table', '__hide-on-wide', '__hide-on-mobile', {
            __respectAsidePanel: props.store.navActive.is
          })}>
            <tr></tr>
            {reportData.absences.map((absence, i) => (
              <tr key={i} onClick={() => $router.router.navigate('absences.item', {
                absenceId: absence.absence_id
              }, {reload: true})}>
                <td>
                  <div>{absence.created_at}</div>
                  <div>{absence.area}</div>
                </td>
                <td>
                  <div>{absence.service_resource}</div>
                  <div>{absence.created_by}</div>
                </td>
                <td>
                  <div>{absence.absence_start}</div>
                  <div>{absence.absence_end}</div>
                </td>
              </tr>
            ))}
          </table>

          {/* Mobile table items */}
          <div className={classNames('mobile-table-items', '__show-on-mobile', {
            __respectAsidePanel: props.store.navActive.is
          })}>

            {reportData.absences.map((absence, i: number) => (
              <div className="item" key={i} onClick={() => $router.router.navigate('absences.item', {
                absenceId: absence.absence_id
              }, {reload: true})}>

                <div className="__top">

                  <div className="__left">
                    <span className="gray">Service resource:</span>
                    <span> {absence.service_resource}</span>
                  </div>

                  <div className="__right">
                    <span className="gray">Area:</span>
                    <span> {absence.area}</span>
                  </div>
                </div>

                <div className="__bottom">

                  <div className="__left">
                    <div>
                      Start: <b>{absence.absence_start}</b>
                    </div>
                    <div>
                      End: <b>{absence.absence_end}</b>
                    </div>
                  </div>

                  <div className="__right small">
                    <div>
                      {absence.created_at}
                    </div>
                    <div>
                      Created by {absence.created_by}
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

          onPagesStart={() => setLocalInterface({...localInterface, page: 1})}
          onPrevPage={() => setLocalInterface({...localInterface, page: localInterface.page-1})}
          onNextPage={() => setLocalInterface({...localInterface, page: localInterface.page+1})}
          onPagesEnd={() => setLocalInterface({...localInterface, page: reportData.interface.max_pages})}

          amount={{
            total: reportData.interface.rows_all,
            start: reportData.interface.rows_start,
            end: reportData.interface.rows_end
          }}

          page={localInterface.page}
          maxPages={reportData.interface.max_pages}
          
          sort={localInterface.sort}
          sortFields={localInterface.sortFields}
          onSortFieldChange={(value) => setLocalInterface({...localInterface, sort: {...localInterface.sort, field: value}})}
          onSortDirectionChange={(value) => setLocalInterface({ ...localInterface, sort: { ...localInterface.sort, direction: value } })}
          onSortFire={() => $setUpdater(Math.random())}
        />
      </div>
    ) : null}
  </>)
})
export default AbsencesPage_List
