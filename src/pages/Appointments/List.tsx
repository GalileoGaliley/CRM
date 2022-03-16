import classNames from "classnames"
import { DateTime } from "luxon"
import qs from "qs"
import { useEffect, useState } from "react";
import { connect } from "react-redux";
import { useRoute } from "react-router5"
import Icon from "../../components/Icon"
import ReportFilters from "../../components/reports/Filters"
import ReportTableControls from "../../components/reports/TableControls"
import ReportTableField from "../../components/reports/TableField"
import { httpClient, nError } from "../../funcs/base"
import {getDateRangeByPreset} from "../../funcs/reports"
import Appointment from "../../models/Appointment"
import { DateRangePreset } from "../../models/Misc"
import {StoreDispatch, StoreState, mapDispatchToProps, mapStateToProps, store} from "../../store";

import "../../styles/pages/common/report-list.sass"
import {getActiveAccount} from "../../funcs";
import Account from "../../models/Account";

interface Props {
  store: StoreState,
  dispatcher: StoreDispatch
}

type FilterWord = 'type' | 'status' | 'property_type' | 'area' | 'created_by' | 'service_resource'

interface AppointmentsReport {

  interface: {

    filter_words: {

      type: string[],
      status: string[],
      property_type: string[],
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
    show_appointment: boolean,
    send_appointment: boolean
  },

  dashboard: {

    service_calls: string,
    recalls: string,
    all: string,
    closed: string
  },

  appointments: Appointment[]
}

const AppointmentsPage_List = connect(mapStateToProps, mapDispatchToProps)(function(props: Props) {

  const $router = useRoute()

  const [$updater, $setUpdater] = useState<any>(Math.random())

  const [reportIsDeprecated, setReportIsDeprecated] = useState(false)
  let filterWords;
  const activeAccount = getActiveAccount(props.store) as Account;
  let user = store.getState().user;
  let timeZone = user?.time_zone;
  const [reportData, setReportData] = useState<AppointmentsReport | null>(null)
  const [localInterface, setLocalInterface] = useState({

    search: '',
    
    appointmentSharePopup: false,
    
    dateRangeCalendarShown: false,
    dateRangeType: "schedule" as "created" | "schedule",
    dateRangePreset: "custom" as DateRangePreset,

    min_date: DateTime.now().setZone(timeZone).startOf('day').toJSDate(),
    max_date: DateTime.now().setZone(timeZone).endOf('day').toJSDate(),

    page: 1,

    filter_words: {

      type: [] as string[],
      status: [] as string[],
      property_type: [] as string[],
      area: [] as string[],
      created_by: [] as string[],
      service_resource: [] as string[]
    },

    sort: {
      field: 'created_at',
      direction: 'down' as 'up' | 'down'
    },
    sortFields: [{
      span: 'Date',
      value: 'created_at'
    },{
      span: 'Name',
      value: 'name'
    },{
      span: 'Type',
      value: 'type'
    },{
      span: 'Status',
      value: 'status'
    },{
      span: 'Property Type',
      value: 'property_type'
    },{
      span: 'Area',
      value: 'area'
    },{
      span: 'Created by',
      value: 'created_by'
    },{
      span: 'Schedule time',
      value: 'schedule_time'
    },{
      span: 'Service resource',
      value: 'service_resource'
    },{
      span: 'Is Sent',
      value: 'is_sent'
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

  // Load appointments function


  async function loadAppointments() {

    httpClient.defaults.headers['Authorization'] = `Bearer ${props.store.accessToken}`
    
    let activeFilters: any = {...localInterface.filter_words}
    Object.keys(localInterface.filter_words).forEach((key: any) => !activeFilters[key].length && delete activeFilters[key])

    let reqData = qs.stringify({

      account_id:activeAccount.account_id,
      limit_rows: props.store.reportsMaxRows,
      page: localInterface.page,
      date_type: localInterface.dateRangeType,
      date_start: localInterface.min_date.toISOString(),
      date_end: localInterface.max_date.toISOString(),
      sort_field: localInterface.sort.field,
      sort_type: localInterface.sort.direction === 'up' ? 'asc' : 'desc',
      filter_field: JSON.stringify(activeFilters),
      ...(localInterface.search ? {search: localInterface.search} : {})
    });
    try {
      const { data: appointments } = await httpClient.post('/appointments/report', reqData, {
        headers: {
          'Accept':'application/jsons',
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }) as { data: AppointmentsReport }

      setReportData({
        ...appointments,

        interface: {

          ...appointments.interface,
          min_date: DateTime.fromISO(appointments.interface.min_date as unknown as string).startOf('day').toJSDate(),
          max_date: DateTime.fromISO(appointments.interface.max_date as unknown as string).endOf('day').toJSDate(),
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

  // Load appointments on page mount
  useEffect(() => { loadAppointments();}, [
    $updater,
    localInterface.page
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

  function isAllFiltersSelected(field: FilterWord) {
    return localInterface.filter_words[field].length === 0
  }

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
      <div className="AppointmentsPage_List" >
      
        { /* Reports grid */}
        <div className="reports-grid">
        
          <div className="cell">

            <div className="amount">{reportData.dashboard.service_calls}</div>
            <div className="legend">Service calls</div>
          </div>

          <div className="cell">

            <div className="amount">{reportData.dashboard.recalls}</div>
            <div className="legend">Recalls</div>
          </div>

          <div className="cell">

            <div className="amount">{reportData.dashboard.all}</div>
            <div className="legend">All appointments</div>
          </div>

          <div className="cell">

            <div className="amount">{reportData.dashboard.closed}</div>
            <div className="legend">Closed appointments</div>
          </div>
        </div>

        { /* Page header */}
        <div className="page-header">
          <h1>Appointments</h1>
        </div>

        { /* List filters */}
        <ReportFilters
          onSearchInputChange={(value) => setLocalInterface({...localInterface, search: value})}

          dateRangeType={localInterface.dateRangeType}
          onDateRangeTypeChange={(value) => setLocalInterface({...localInterface, dateRangeType: value as any})}

          dateRangePreset={localInterface.dateRangePreset}
          onDateRangePresetChange={(value) => setLocalInterface({ ...localInterface, dateRangePreset: value })}

          minDate={localInterface.min_date}
          onMinDateChange={(value) => setLocalInterface({ ...localInterface, min_date: value, dateRangePreset: 'custom' }) }

          maxDate={localInterface.max_date}
          onMaxDateChange={(value) => setLocalInterface({...localInterface, max_date: value, dateRangePreset: 'custom'})}

          updateButtonActive={reportIsDeprecated}
          onUpdate={() => {
            $setUpdater(Math.random())
          }}
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
                contents={(<span>Type</span>)}

                allFiltersSelected={isAllFiltersSelected("type")}
                onAllFiltersChange={(value) => switchFilter("type", "All", value)}

                filterWords={reportData.interface.filter_words.type.map((filterWord) => ({
                  word: filterWord,
                  selected: isFilterSelected("type", filterWord)
                }))}
                onFilterChange={(value) => switchFilter("type", value.word, value.selected)}
                onFilterFire={() => $setUpdater(Math.random())}

                sortDirection={localInterface.sort.field === 'type' ? localInterface.sort.direction : undefined}
                onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {field: 'type', direction: value}})}
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
                contents={(<span>Property Type</span>)}

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

                filterWords={reportData.interface.filter_words.area.map((filterWord) => ({
                  word: filterWord,
                  selected: isFilterSelected("area", filterWord)
                }))}
                onFilterChange={(value) => switchFilter("area", value.word, value.selected)}
                onFilterFire={() => $setUpdater(Math.random())}

                sortDirection={localInterface.sort.field === 'area' ? localInterface.sort.direction : undefined}
                onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {field: 'area', direction: value}})}
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
                contents={(<span>Schedule time</span>)}

                sortDirection={localInterface.sort.field === 'schedule_time' ? localInterface.sort.direction : undefined}
                onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {field: 'schedule_time', direction: value}})}

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
                onFilterFire={() => $setUpdater(Math.random())}

                sortDirection={localInterface.sort.field === 'service_resource' ? localInterface.sort.direction : undefined}
                onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {field: 'service_resource', direction: value}})}
              />
              <ReportTableField
                contents={(<Icon className="__icon" icon="arrow-60" />)}

                sortDirection={localInterface.sort.field === 'is_sent' ? localInterface.sort.direction : undefined}
                onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {field: 'is_sent', direction: value}})}

                onFilterFire={() => $setUpdater(Math.random())}
              />
            </tr>
            {reportData.appointments.map((appointment, i) => (
              <tr key={i} onClick={() => $router.router.navigate('appointments.item', {
                appointmentId: appointment.appointment_id
              }, {reload: true})}>
                <td>{appointment.created_at}</td>
                <td>{appointment.name}</td>
                <td>
                  {appointment.type === 'Recall' ? (
                    <span className="red">
                      {appointment.type}
                    </span>
                  ) : appointment.type === 'Service call' ? (
                    <span className="green">
                      {appointment.type}
                    </span>
                  ) : (
                    <span className="blue">
                      {appointment.type}
                    </span>
                  )}
                </td>
                <td>{appointment.status}</td>
                <td>{appointment.property_type}</td>
                <td>{appointment.area}</td>
                <td>{appointment.created_by}</td>
                <td>{appointment.schedule_time}</td>
                <td>{appointment.service_resource}</td>
                <td>
                  <button className="_zeroed _iconed _blue" disabled={appointment.is_sent} onClick={(e) => { e.stopPropagation(); reportData.permissions.send_appointment && setLocalInterface({...localInterface, appointmentSharePopup: true}) }}>
                    <Icon icon="arrow-60" />
                  </button>
                </td>
              </tr>
            ))}
          </table>

          {/* Medium desktop table */}
          <table className={classNames('table', '__hide-on-wide', '__hide-on-mobile', {
            __respectAsidePanel: props.store.navActive.is
          })}>
            <tr></tr>
            {reportData.appointments.map((appointment, i) => (
              <tr key={i} onClick={() => $router.router.navigate('appointments.item', {
                appointmentId: appointment.appointment_id
              }, {reload: true})}>
                <td>
                  <div>{appointment.name}</div>
                  <div>{appointment.created_at}</div>
                </td>
                <td>
                  <div>{appointment.service_resource}</div>
                  <div>{appointment.created_by}</div>
                </td>
                <td>
                  <div>{appointment.area}</div>
                  <div>
                    {appointment.type === 'Recall' ? (
                      <span className="red">
                        {appointment.type}
                      </span>
                    ) : appointment.type === 'Service call' ? (
                      <span className="green">
                        {appointment.type}
                      </span>
                    ) : (
                      <span className="blue">
                        {appointment.type}
                      </span>
                    )}
                  </div>
                </td>
                <td>
                  <div>{appointment.property_type}</div>
                  <div>{appointment.status}</div>
                </td>
                <td>
                  <div>{appointment.schedule_time}</div>
                  <div>&nbsp;</div>
                </td>
                <td>
                  <button className="_zeroed _iconed _blue" disabled={appointment.is_sent} onClick={(e) => { e.stopPropagation(); setLocalInterface({...localInterface, appointmentSharePopup: true}) }}>
                    <Icon icon="arrow-60" />
                  </button>
                </td>
              </tr>
            ))}
          </table>

          {/* Mobile table items */}
          <div className={classNames('mobile-table-items', '__show-on-mobile', {
            __respectAsidePanel: props.store.navActive.is
          })}>

            {reportData.appointments.map((appointment, i: number) => (
              <div className="item" key={i} onClick={() => $router.router.navigate('appointments.item', {
                appointmentId: appointment.appointment_id
              }, {reload: true})}>

                <div className="__top">

                  <div className="__left">
                    <div className="flex-container">
                      <strong>{appointment.name}</strong>
                      <button className="_zeroed _iconed _blue" disabled={appointment.is_sent} onClick={(e) => { e.stopPropagation(); reportData.permissions.send_appointment && setLocalInterface({...localInterface, appointmentSharePopup: true}) }}>
                        <Icon icon="arrow-60" />
                      </button>
                    </div>
                    <div>
                      {appointment.schedule_time}
                    </div>
                  </div>

                  <div className="__right">
                    <div>
                      {appointment.type === 'Recall' ? (
                        <span className="red">
                          {appointment.type}
                        </span>
                      ) : appointment.type === 'Service call' ? (
                        <span className="green">
                          {appointment.type}
                        </span>
                      ) : (
                        <span className="blue">
                          {appointment.type}
                        </span>
                      )}
                    </div>
                    <div>
                      {appointment.property_type}
                    </div>
                    <div>
                      <div className="fw500">{appointment.status}</div>
                    </div>
                  </div>
                </div>

                <div className="__bottom">

                  <div className="__left">
                    <div>
                      <span className="gray">Area:</span>
                      <span> {appointment.area}</span>
                    </div>
                    <div>
                      <span className="gray">Service Resourse:</span>
                      <span> {appointment.service_resource}</span>
                    </div>
                  </div>

                  <div className="__right">
                    <div>
                      {appointment.created_at}
                    </div>
                    <div>
                      Created by {appointment.created_by}
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

        {/* Item share popup */}
        {localInterface.appointmentSharePopup ? (
          <div className="popup appointmentSharePopup" onClick={() => setLocalInterface({...localInterface, appointmentSharePopup: false})}>

            <div className="wrapper" onClick={(e) => e.stopPropagation()}>
            
              <div className="item-name">
                2665NSM-A-01
              </div>

              <button className="_wa _iconed _bordered _blue">
                <span>Send</span>
                <Icon icon="arrow-60" />
              </button>
            </div>
          </div>
        ) : null}
      </div>
    ) : null}
  </>)
})
export default AppointmentsPage_List
