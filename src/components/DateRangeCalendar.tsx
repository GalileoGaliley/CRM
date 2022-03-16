import classNames from "classnames"
import moment from "moment-timezone"
import momentmoment from 'moment';
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import {StoreDispatch, StoreState, mapDispatchToProps, mapStateToProps, store} from "../store";

import "../styles/components/date-range-calendar.sass"
import Icon from "./Icon"
import {log} from "util";

interface Props {
  store: StoreState,
  dispatcher: StoreDispatch,

  startDate?: Date,
  endDate?: Date,

  onStartDateUpdate?(date: Date): void,
  onEndDateUpdate?(date: Date): void,

  debug?: any
}

const DateRangeCalendar = connect(mapStateToProps, mapDispatchToProps)(function(props: Props) {


  let user = store.getState().user;
  let timeZone = user?.time_zone;
  const [activeDate, setActiveDate] = useState(moment().startOf('day').toDate())
  const [startDate, setStartDate] = useState<Date | null>(props.startDate || null)
  const [endDate, setEndDate] = useState<Date | null>(props.endDate || null)

  useEffect(()=>{
    if (timeZone){
      setActiveDate(moment.tz(momentmoment(), timeZone).startOf('day').toDate())
    }

  },[])
  // onDayClick function
  function onDayClick(day: number) {
    console.log(startDate)
    console.log(endDate)
    if (!startDate || (startDate && endDate)) {
      const date = moment(activeDate).date(day).toDate()

      // setStartDate(date)
      props.onStartDateUpdate && props.onStartDateUpdate(date)

      setEndDate(null)
      
      return
    }

    if (!endDate) {
      const date = moment(activeDate).date(day).endOf('day').toDate()

      // setEndDate(date)
      props.onEndDateUpdate && props.onEndDateUpdate(date)
      console.log(endDate)
      return
    }
  }

  // Add or take a month from activeDate function
  function updateActiveMonth(x: number) {

    setActiveDate(moment(activeDate).add(x, 'M').toDate())
  }

  // Get start date from props
  useEffect(() => {
    setStartDate(props.startDate || null)
  }, [props.startDate])

  useEffect(() => {
    setEndDate(props.endDate || null)
  }, [props.endDate])
  
  // Render function
  return (
    <div className="DateRangeCalendar">

      <div className="header">

        <button className="_zeroed _iconed" onClick={() => updateActiveMonth(-1)}>
          <Icon className="_rotated-180" icon="arrow-25" />
        </button>

        <div className="current-month">
          {moment(activeDate).format('MMMM YYYY')}
        </div>

        <button className="_zeroed _iconed" onClick={() => updateActiveMonth(1)}>
          <Icon icon="arrow-25" />
        </button>
      </div>

      <div className="calendar">

        <div className="days-grid week-days">

          <div className="day">S</div>
          <div className="day">M</div>
          <div className="day">T</div>
          <div className="day">W</div>
          <div className="day">T</div>
          <div className="day">F</div>
          <div className="day">S</div>
        </div>

        <div className="days-grid calendar-days">

          {[...Array(moment(activeDate).startOf('month').day())].map((day, i) => (
            <div className="day" key={`${i}`}></div>
          ))}

        
          {[...Array(moment(activeDate).daysInMonth())].map((day, i) => (
            <div
              className={classNames('day', {
                _selected: (
                  i + 1 === moment(startDate).date() &&
                  activeDate.getMonth() === startDate?.getMonth() &&
                  activeDate.getFullYear() === startDate?.getFullYear() ||
                  i + 1 === moment(endDate).date() &&
                  activeDate.getMonth() === endDate?.getMonth() &&
                  activeDate.getFullYear() === endDate?.getFullYear()
                ),
                _inRange: (
                  startDate && endDate &&
                  moment(activeDate).date(i+1).isAfter(moment(startDate)) &&
                  moment(activeDate).date(i+2).isBefore(moment(endDate))
                ),
                _rangeStart: moment(activeDate).date(i + 1).isSame(moment(startDate)),
                _rangeEnd: moment(activeDate).endOf('day').date(i+1).isSame(moment(endDate))
              })}
              key={i}
              onClick={() => onDayClick(i + 1)}
            >{i + 1}</div>
          ))}
        </div>
      </div>

      {props.debug ? (<>
        <div>{moment(startDate).format()}</div>
        <div>{moment(activeDate).format()}</div>
        <div>{moment(endDate).format()}</div>
        <div>{String(moment(startDate).format() === moment(activeDate).format())}</div>
      </>) : null}
    </div>
  )
})
export default DateRangeCalendar
