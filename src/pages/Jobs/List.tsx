import axios from "axios"
import classNames from "classnames"
import { DateTime } from "luxon"
import moment from "moment"
import qs from "qs"
import { useEffect, useState } from "react";
import { connect } from "react-redux";
import { useRoute } from "react-router5"
import ReportFilters from "../../components/reports/Filters"
import ReportTableControls from "../../components/reports/TableControls"
import ReportTableField from "../../components/reports/TableField"
import { httpClient, nError } from "../../funcs/base"
import {getDateRangeByPreset} from "../../funcs/reports"
import Job from "../../models/Job"
import { DateRangePreset } from "../../models/Misc"
import {StoreDispatch, StoreState, mapDispatchToProps, mapStateToProps, store} from "../../store";

import "../../styles/pages/common/report-list.sass"
import {getActiveAccount} from "../../funcs";
import Account from "../../models/Account";

interface Props {
  store: StoreState,
  dispatcher: StoreDispatch
}

type FilterWord = 'status' | 'property_type' | 'area' | 'source' | 'created_by' | 'service_resource'

interface JobsReport {

  interface: {

    filter_words: {

      status: string[],
      property_type: string[],
      area: string[],
      source: string[],
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
    show_job: boolean
  },

  dashboard: {

    all: string,
    closed: string,
    in_progress: string,
    canceled: string
  },

  jobs: Job[]
}

const JobsPage_List = connect(mapStateToProps, mapDispatchToProps)(function(props: Props) {

  const $router = useRoute()

  const [$updater, $setUpdater] = useState<any>(Math.random())
  const activeAccount = getActiveAccount(props.store) as Account;
  const [reportIsDeprecated, setReportIsDeprecated] = useState(false)
  let user = store.getState().user;
  let timeZone = user?.time_zone;
  const [reportData, setReportData] = useState<JobsReport | null>(null)
  const [localInterface, setLocalInterface] = useState(
      {
    search: '',

    jobSharePopup: false,
    
    dateRangeCalendarShown: false,
    dateRangePreset: "custom" as DateRangePreset,

    min_date: DateTime.now().setZone(timeZone).startOf('day').toJSDate(),
    max_date: DateTime.now().setZone(timeZone).endOf('day').toJSDate(),

    page: 1,

    filter_words: {

      source: [] as string[],
      status: [] as string[],
      property_type: [] as string[],
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
      span: 'Name',
      value: 'name'
    },{
      span: 'Status',
      value: 'name'
    },{
      span: 'Property type',
      value: 'property_type'
    },{
      span: 'Area',
      value: 'area'
    },{
      span: 'Source',
      value: 'source'
    },{
      span: 'Status',
      value: 'status'
    },{
      span: 'Created by',
      value: 'created_by'
    },{
      span: 'Appointments',
      value: 'appointments'
    },{
      span: 'Service Resource',
      value: 'service_resource'
    },{
      span: 'Total',
      value: 'total'
    },{
      span: 'Paid',
      value: 'paid'
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

  // Load jobs function
  async function loadJobs() {

    httpClient.defaults.headers['Authorization'] = `Bearer ${props.store.accessToken}`

    let activeFilters: any = {...localInterface.filter_words}
    Object.keys(localInterface.filter_words).forEach((key: any) => !activeFilters[key].length && delete activeFilters[key])
    let reqData = {
      account_id: activeAccount.account_id,
      limit_rows: props.store.reportsMaxRows,
      page: localInterface.page,
      date_start: localInterface.min_date.toISOString(),
      date_end: localInterface.max_date.toISOString(),
      sort_field: localInterface.sort.field,
      sort_type: localInterface.sort.direction === 'up' ? 'asc' : 'desc',
      filter_field: JSON.stringify(activeFilters),
      ...(localInterface.search ? {search: localInterface.search} : {})
    };
    try {
      const { data: jobs } = (await httpClient.post('/jobs/report', qs.stringify(reqData), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        }
      })) as { data: JobsReport }

      setReportData({
        ...jobs,

        interface: {

          ...jobs.interface,
          min_date: moment(jobs.interface.min_date).startOf('day').toDate(),
          max_date: moment(jobs.interface.max_date).endOf('day').toDate(),
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

  // Load jobs on page mount
  useEffect(() => { loadJobs() }, [
    $updater,
    localInterface.page,
  ])

  // Watch for deprecated
  useEffect(() => {
    if(!reportData) return
    setReportIsDeprecated(true)
  }, [
    localInterface.min_date,
    localInterface.max_date
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
      <div className="JobsPage_List" >
      
        { /* Reports grid */}
        <div className="reports-grid">
        
          <div className="cell">

            <div className="amount">{reportData.dashboard.all}</div>
            <div className="legend">All Jobs</div>
          </div>

          <div className="cell">

            <div className="amount">{reportData.dashboard.closed}</div>
            <div className="legend">Closed</div>
          </div>

          <div className="cell">

            <div className="amount">{reportData.dashboard.in_progress}</div>
            <div className="legend">In progress</div>
          </div>

          <div className="cell">

            <div className="amount">{reportData.dashboard.canceled}</div>
            <div className="legend">Canceled</div>

          </div>
        </div>

        { /* Page header */}
        <div className="page-header">
          <h1>Jobs</h1>
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
        />

        {/* Table controls */}
        <ReportTableControls
          zIndex={5}

          onMaxRowsChange={() => {
            $setUpdater(Math.random());
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
                contents={(<span>Date</span>)}

                sortDirection={localInterface.sort.field === 'created_at' ? localInterface.sort.direction : undefined}
                onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {field: 'created_at', direction: value}})}

                onFilterFire={() => $setUpdater(Math.random())}
              />
              <ReportTableField
                contents={(<span>Name</span>)}
                
                sortDirection={localInterface.sort.field === 'name' ? localInterface.sort.direction : undefined}
                onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {field: 'name', direction: value}})}

                onFilterFire={() => $setUpdater(Math.random())}
              />
              <ReportTableField
                contents={(<span>Status</span>)}

                allFiltersSelected={isAllFiltersSelected("status")}
                onAllFiltersChange={(value) => switchFilter("status", "All", value)}

                filterWords={reportData.interface.filter_words.status.map((filterWord) => ({
                  word: filterWord,
                  selected: isFilterSelected("status", filterWord)
                }))}
                onFilterChange={(value) => switchFilter("status", value.word, value.selected)}
                onFilterFire={() => $setUpdater(Math.random())}

                sortDirection={localInterface.sort.field === 'status' ? localInterface.sort.direction : undefined}
                onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {field: 'status', direction: value}})}
              />
              <ReportTableField
                contents={(<span>Property type</span>)}

                allFiltersSelected={isAllFiltersSelected("property_type")}
                onAllFiltersChange={(value) => switchFilter("property_type", "All", value)}

                filterWords={reportData.interface.filter_words.property_type.map((filterWord) => ({
                  word: filterWord,
                  selected: isFilterSelected("property_type", filterWord)
                }))}
                onFilterChange={(value) => switchFilter("property_type", value.word, value.selected)}
                onFilterFire={() => $setUpdater(Math.random())}

                sortDirection={localInterface.sort.field === 'property_type' ? localInterface.sort.direction : undefined}
                onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {field: 'property_type', direction: value}})}
              />
              <ReportTableField
                contents={(<span>Area</span>)}

                allFiltersSelected={isAllFiltersSelected("area")}
                onAllFiltersChange={(value) => switchFilter("area", "All", value)}
                onFilterFire={() => $setUpdater(Math.random())}

                filterWords={reportData.interface.filter_words.area.map((filterWord) => ({
                  word: filterWord,
                  selected: isFilterSelected("area", filterWord)
                }))}
                onFilterChange={(value) => switchFilter("area", value.word, value.selected)}

                sortDirection={localInterface.sort.field === 'area' ? localInterface.sort.direction : undefined}
                onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {field: 'area', direction: value}})}
              />
              <ReportTableField
                contents={(<span>Source</span>)}

                allFiltersSelected={isAllFiltersSelected("source")}
                onAllFiltersChange={(value) => switchFilter("source", "All", value)}

                filterWords={reportData.interface.filter_words.source.map((filterWord) => ({
                  word: filterWord,
                  selected: isFilterSelected("source", filterWord)
                }))}
                onFilterChange={(value) => switchFilter("source", value.word, value.selected)}
                onFilterFire={() => $setUpdater(Math.random())}

                sortDirection={localInterface.sort.field === 'source' ? localInterface.sort.direction : undefined}
                onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {field: 'source', direction: value}})}
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
                onFilterFire={() => $setUpdater(Math.random())}

                sortDirection={localInterface.sort.field === 'created_by' ? localInterface.sort.direction : undefined}
                onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {field: 'created_by', direction: value}})}
              />
              <ReportTableField
                contents={(<span>Appointments</span>)}

                sortDirection={localInterface.sort.field === 'appointments' ? localInterface.sort.direction : undefined}
                onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {field: 'appointments', direction: value}})}

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
                onFilterChange={(value) => {switchFilter("service_resource", value.word, value.selected) }}
                onFilterFire={() => $setUpdater(Math.random())}

                sortDirection={localInterface.sort.field === 'service_resource' ? localInterface.sort.direction : undefined}
                onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {field: 'service_resource', direction: value}})}
              />
              <ReportTableField
                contents={(<span>Total</span>)}

                sortDirection={localInterface.sort.field === 'total' ? localInterface.sort.direction : undefined}
                onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {field: 'total', direction: value}})}

                onFilterFire={() => $setUpdater(Math.random())}
              />
              <ReportTableField
                contents={(<span>Paid</span>)}

                sortDirection={localInterface.sort.field === 'paid' ? localInterface.sort.direction : undefined}
                onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {field: 'paid', direction: value}})}

                onFilterFire={() => $setUpdater(Math.random())}
              />
            </tr>
            {reportData.jobs.map((job, i) => (
              <tr key={i} onClick={() => $router.router.navigate('jobs.item', {
                jobId: job.job_id
              }, {reload: true})}>
                <td>{job.created_at}</td>
                <td>{job.name}</td>
                <td>{job.status}</td>
                <td>{job.property_type}</td>
                <td>{job.area}</td>
                <td>{job.source}</td>
                <td>{job.created_by}</td>
                <td>{job.appointments}</td>
                <td>{job.service_resource}</td>
                <td>{job.total}</td>
                <td>{job.paid}</td>
              </tr>
            ))}
          </table>

          {/* Medum screen table */}
          <table className={classNames('table', '__hide-on-wide', '__hide-on-mobile', {
            __respectAsidePanel: props.store.navActive.is
          })}>
            <tr></tr>
            {reportData.jobs.map((job, i) => (
              <tr key={i} onClick={() => $router.router.navigate('jobs.item', {
                jobId: job.job_id
              }, {reload: true})}>
                <td>
                  <div>{job.name}</div>
                  <div>{job.created_at}</div>
                </td>
                <td>
                  <div>{job.created_by}</div>
                  <div>{job.service_resource}</div>
                </td>
                <td>
                  <div>{job.area}</div>
                  <div>{job.source}</div>
                </td>
                <td>
                  <div>{job.property_type}</div>
                  <div>{job.status}</div>
                </td>
                <td>
                  <div>Appointments: {job.appointments}</div>
                  <div>&nbsp;</div>
                </td>
                <td>
                  <div>Total: {job.total}</div>
                  <div>Paid: {job.paid}</div>
                </td>
              </tr>
            ))}
          </table>

          {/* Mobile table items */}
          <div className={classNames('mobile-table-items', '__show-on-mobile', {
            __respectAsidePanel: props.store.navActive.is
          })}>

            {reportData.jobs.map((job, i: number) => (
              <div className="item" key={i} onClick={() => $router.router.navigate('jobs.item', {
                jobId: job.job_id
              }, {reload: true})}>

                <div className="__top">

                  <div className="__left">
                    <div>
                      <strong>{job.name}</strong>
                    </div>
                    <div>
                      Appointments: {job.appointments}
                    </div>
                  </div>

                  <div className="__right">
                    <div>
                      Paid: <b>{job.paid}</b>
                    </div>
                    <div>
                      Total: <b>{job.total}</b>
                    </div>
                    <div>
                      {job.property_type}
                    </div>
                    <div>
                      <b>{job.status}</b>
                    </div>
                  </div>
                </div>

                <div className="__bottom">

                  <div className="__left">
                    <div>
                      <span className="gray">Area:</span>
                      <span> {job.area}</span>
                    </div>
                    <div>
                      <span className="gray">Source:</span>
                      <span> {job.source}</span>
                    </div>
                    <div>
                      <span className="gray">Service Resourse:</span>
                      <span> {job.service_resource}</span>
                    </div>
                  </div>

                  <div className="__right small">
                    <div>
                      {job.created_at}
                    </div>
                    <div>
                      Created by {job.created_by}
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
          onSortFire={() => $setUpdater(Math.random())}
        />
      </div>
    ) : null}
  </>)
})
export default JobsPage_List
