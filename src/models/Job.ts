export default interface Job {
  job_id: string,
  created_at: string,
  name: string,
  status: string,
  property_type: string,
  area: string,
  source: string,
  created_by: string,
  appointments: string,
  service_resource: string,
  total: string,
  paid: string,
  last_edited_at?: string,
  last_edited_by?: string
}
