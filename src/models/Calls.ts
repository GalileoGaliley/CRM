export interface Call {
  call_id: string,
  direction: string,
  created_at: string,
  dispatcher: string,
  caller_name: string,
  client: string,
  client_id: string,
  call_from: string,
  friendly_name: string,
  call_to: string,
  extension: string,
  is_appointment: string,
  appointment_id: string,
  status: string,
  duration: string,
  call_url: string
}

export interface CallNumber {
  number: string,
  friendly_name: string,
  source: string,
  area: string,
  total_calls: string,
  completed_calls: string,
  unanswered_calls: string,
  avg_duration: string,
  total_appointments: string
}

export interface CallSource {
  source: string,
  total_calls: string,
  completed_calls: string,
  unanswered_calls: string,
  avg_duration: string,
  total_appointments: string
}

export interface CallArea {
  area: string,
  total_calls: string,
  completed_calls: string,
  unanswered_calls: string,
  avg_duration: string,
  total_appointments: string
}
