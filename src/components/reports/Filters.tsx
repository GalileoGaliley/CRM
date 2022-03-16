import classNames from "classnames"
import { DateTime } from "luxon"
import React, { ReactChildren, ReactElement, useState } from "react";
import { connect } from "react-redux";
import { DateRangePreset } from "../../models/Misc"
import { StoreDispatch, StoreState, mapDispatchToProps, mapStateToProps } from "../../store";
import DateRangeCalendar from "../DateRangeCalendar"
import Icon from "../Icon"
import Select from "../Select"

import "../../styles/components/reports/filters.sass"

interface Props {
  store: StoreState,
  dispatcher: StoreDispatch,

  onSearchInputChange(value: string): void,

  dateRangeType?: string,
  onDateRangeTypeChange?(value: string): void,

  dateRangePreset?: DateRangePreset,
  onDateRangePresetChange?(value: DateRangePreset): void,

  minDate?: Date,
  onMinDateChange?(value: Date): void,
  
  maxDate?: Date,
  onMaxDateChange?(value: Date): void,

  updateButtonActive?: boolean,
  onUpdate(): void,

  childrenAfterSearch?: ReactElement,
  childrenBeforeDateType?: ReactElement
}

const ReportFilters = connect(mapStateToProps, mapDispatchToProps)(function(props: Props) {

  const [dateRangeCalendarShown, setDateRangeCalendarShown] = useState(false)
  
  // Render function
  return (
    <div className="ReportFilters">
      
      <div className="flex-container">

        <div className="flex-container __left __hide-on-mobile">
          
          { /* Search field */}
          <div className="form-field __search-form">
            <input type="text" className="_rounded" onChange={({target: {value}}) => props.onSearchInputChange(value)} />
            <button className="_wa _white _iconed _rounded" onClick={() => props.onUpdate()}>
              <Icon icon="magnifier-5" />
            </button>
          </div>

          {props.childrenAfterSearch}
        </div>

        <div className="flex-container __right">

          {props.childrenBeforeDateType}

          { /* Date range type selection */}
          {(
            true
            && props.dateRangeType
            && props.onDateRangeTypeChange
          ) ? (
            <div>
              <Select zeroed={true} options={[{
                span: "Schedule date",
                value: "schedule"
              }, {
                span: "Created date",
                value: "created"
              }]} selectedOption={props.dateRangeType} onChange={(value: string) => {
                (props.onDateRangeTypeChange as any)(value)
              }} />
            </div>
          ) : null}

          { /* Date range type selection */}
          {(true
            && props.dateRangePreset
            && props.onDateRangePresetChange
          ) ? (
            <div>
              <Select zeroed={true} options={[{
                span: "Custom",
                value: "custom"
              }, {
                span: "Tomorrow & Next",
                value: "tomorrow_and_next"
              }, {
                span: "Tomorrow",
                value: "tomorrow"
              }, {
                span: "Today",
                value: "today"
              }, {
                span: "Yesterday",
                value: "yesterday"
              }, {
                span: "This week (Sun - today)",
                value: "this_week_sun_today"
              }, {
                span: "This week (Mon - today)",
                value: "this_week_mon_today"
              }, {
                span: "Last 7 days",
                value: "last_7_days"
              }, {
                span: "Last week (Sun - Sat)",
                value: "last_week_sun_sat"
              }, {
                span: "Last week (Mon - Sun)",
                value: "last_week_mon_sun"
              }, {
                span: "Last business week",
                value: "last_business_week"
              }, {
                span: "Last 14 days",
                value: "last_14_days"
              }, {
                span: "Last 30 days",
                value: "last_30_days"
              }, {
                span: "This month",
                value: "this_month"
              }, {
                span: "Last month",
                value: "last_month"
              }, {
                span: "All",
                value: "all"
              }]} selectedOption={props.dateRangePreset} onChange={(value: string) => {
                (props.onDateRangePresetChange as any)(value as DateRangePreset)
              }} />
            </div>
          ) : null}

          { /* Date range */}
          {(true
            && props.minDate
            && props.maxDate
            && props.onMinDateChange
            && props.onMaxDateChange
          ) ? (
            <div onFocus={() => setDateRangeCalendarShown(true)} onBlur={() => setDateRangeCalendarShown(false)} tabIndex={-1} className="form-field date-range">
              <div className="form-field _iconed">
                <input type="text" readOnly value={DateTime.fromJSDate(props.minDate).toLocaleString(DateTime.DATE_SHORT)} />
                <button className="_zeroed _iconed __noclick">
                  <Icon icon="calendar-4" />
                </button>
              </div>
              <div className="input-between-text">to</div>
              <div className="form-field _iconed">
                <input type="text" readOnly value={DateTime.fromJSDate(props.maxDate).toLocaleString(DateTime.DATE_SHORT)} />
                <button className="_zeroed _iconed __noclick">
                  <Icon icon="calendar-4" />
                </button>
              </div>

              <div className={classNames("date-range-wrapper", {_shown: dateRangeCalendarShown})}>
                <DateRangeCalendar
                  startDate={props.minDate}
                  endDate={props.maxDate}
                    
                  onStartDateUpdate={(date) => { (props.onMinDateChange as any)(date);}}
                  onEndDateUpdate={(date) => { (props.onMaxDateChange as any)(date);}}
                />
              </div>
            </div>
          ) : null}

          { /* Refresh button */}
          {(true
            && props.minDate
            && props.maxDate
          ) ? (
            <button
              className={classNames(['_wa', '_rounded', '_iconed', 'update-button', '__hide-on-mobile', { _blue: props.updateButtonActive }])}
              onClick={() => props.onUpdate()}
            >
              <Icon className="_mirrored-y" icon="refresh-2" />
            </button>
          ) : null}
        </div>
      </div>

      <div className="__show-on-mobile flex-container">

          { /* Search field */}
          <div className="form-field __search-form">
            <input type="text" className="_rounded" onChange={({target: {value}}) => props.onSearchInputChange(value)} />
            <button className="_wa _white _iconed _rounded" onClick={() => props.onUpdate()}>
              <Icon icon="magnifier-5" />
            </button>
          </div>
        
          {props.childrenAfterSearch}

          { /* Refresh button */}
          {(true
            && props.minDate
            && props.maxDate
          ) ? (
            <button
              className={classNames(['_wa', '_rounded', '_iconed', 'update-button', { _blue: props.updateButtonActive }])}
              onClick={() => props.onUpdate()}
            >
              <Icon className="_mirrored-y" icon="refresh-2" />
            </button>
          ) : null}
        </div>
    </div>
  )
})
export default ReportFilters
