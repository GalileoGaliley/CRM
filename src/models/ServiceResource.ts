export default interface ServiceResource {

  service_resource_id: string,
  nickname: string,
  user: string,
  area: string,
  time_zone: string,
  active: string | boolean,
  phone: string,
  is_phone: boolean,
  slack_channel: string,
  is_slack: boolean,
  slack_member_id: string,
  created_at: string,
  created_by: string,
  last_edited_at: string,
  last_edited_by: string
}
