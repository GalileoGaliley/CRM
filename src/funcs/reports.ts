import {DateTime} from "luxon"
import { DateRangePreset } from "../models/Misc"
import {store} from "../store";

export function getDateRangeByPreset(preset: DateRangePreset, min_date: Date, max_date: Date): {
  min_date: Date,
  max_date: Date,

} {
  let user = store.getState().user;
  let timeZone = user?.time_zone;

  const now = DateTime.now().setZone(timeZone).startOf('day')

  min_date = DateTime.fromJSDate(min_date).setZone(timeZone).startOf('day').toJSDate();
  max_date = DateTime.fromJSDate(max_date).setZone(timeZone).endOf('day').toJSDate();

  if (preset === 'last_7_days')
    return {
      min_date: now.minus({days: 6}).toJSDate(),
      max_date: now.endOf('day').toJSDate(),
    }
  
  if (preset === 'last_14_days')
    return {
      min_date: now.minus({days: 13}).toJSDate(),
      max_date: now.endOf('day').toJSDate(),
    }
  
  if (preset === 'last_30_days')
    return {
      min_date: now.minus({days: 29}).toJSDate(),
      max_date: now.endOf('day').toJSDate(),
    }
  
  if (preset === 'last_business_week')
    return {
      min_date: now.minus({weeks: 1}).set({weekday: 1}).toJSDate(),
      max_date: now.minus({weeks: 1}).set({weekday: 5}).endOf('day').toJSDate(),
    }
  
  if (preset === 'last_month')
    return {
      min_date: now.minus({months: 1}).startOf('month').toJSDate(),
      max_date: now.minus({months: 1}).endOf('month').endOf('day').toJSDate(),
    }
  
  if (preset === 'this_month')
    return {
      min_date: now.startOf('month').toJSDate(),
      max_date: now.endOf('month').toJSDate(),
    }
  
  if (preset === 'this_week_mon_today')
    return {
      min_date: now.minus({weeks: 1}).set({weekday: 1}).toJSDate(),
      max_date: now.endOf('day').toJSDate(),
    }
  
  if (preset === 'this_week_sun_today')
    return {
      min_date: now.set({weekday: 0}).toJSDate(),
      max_date: now.endOf('day').toJSDate(),
    }
  
  if (preset === 'today')
    return {
      min_date: now.startOf('day').toJSDate(),
      max_date: now.endOf('day').toJSDate(),
    }
  
  if (preset === 'tomorrow')
    return {
      min_date: now.plus({days: 1}).startOf('day').toJSDate(),
      max_date: now.plus({days: 1}).endOf('day').toJSDate(),
    }
  
  if (preset === 'tomorrow_and_next')
    return {
      min_date: now.plus({days: 1}).toJSDate(),
      max_date: (() => {

        if (DateTime.fromJSDate(max_date) < now.plus({days: 1}))
          return now.plus({ days: 1 }).endOf('day').toJSDate()
        
        return max_date
      })(),
    }
  
  if (preset === 'yesterday')
    return {
      min_date: now.minus({days: 1}).startOf('day').toJSDate(),
      max_date: now.minus({days: 1}).endOf('day').toJSDate(),
    }
  
  if (preset === 'last_week_sun_sat')
    return {
      min_date: now.minus({weeks: 1}).set({weekday: 0}).toJSDate(),
      max_date: now.minus({weeks: 1}).set({weekday: 6}).endOf('day').toJSDate(),
    }
  
  if (preset === 'last_week_mon_sun')
    return {
      min_date: now.minus({weeks: 1}).set({weekday: 1}).toJSDate(),
      max_date: now.set({weekday: 0}).endOf('day').toJSDate(),
    }
  
  return {min_date, max_date}
}
