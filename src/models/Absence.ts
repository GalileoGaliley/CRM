export default interface Absence {
  absence_id: string,
  service_resource: string,
  area: string,
  absence_start: Date,
  absence_end: Date,
  created_at: string,
  created_by: string,
  last_edited_at?: string,
  last_edited_by?: string
}
