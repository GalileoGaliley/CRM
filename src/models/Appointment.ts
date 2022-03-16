export default interface Appointment {
  appointment_id: string,
  name: string,
  type: string,
  status: string,
  job: string,
  property_type: string,
  area: string,
  schedule_time: string,
  schedule_time_start: Date,
  schedule_time_end: Date,
  service_resource: string,
  is_sent: boolean,
  created_at: string,
  created_by: string,
  last_edited_at: string,
  last_edited_by: string
}
