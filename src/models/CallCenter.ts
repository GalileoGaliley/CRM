export interface CallCenter_PhoneNumber {

  phone_number_id: string,
  phone: string,
  friendly_name: string,
  type: string,
  source: string,
  area: string,
  company: string,
  call_flow: string,
  active: string,
  created_at: string,
  created_by: string,
  last_edited_at: string,
  last_edited_by: string
}

export interface CallCenter_Dispatcher {

  dispatcher_id: string,
  name: string,
  user: string,
  phone: string,
  is_phone: boolean,
  is_softphone: boolean,
  groups: string,
  active: string | boolean,
  created_at: string,
  created_by: string,
  last_edited_at: string,
  last_edited_by: string
}

export interface CallCenter_CallGroup {

  call_group_id: string,
  name: string,
  dispatchers: string,
  call_flows: string,
  created_at: string,
  created_by: string,
  last_edited_at: string,
  last_edited_by: string
}

export interface CallCenter_CallFlow {

  call_flow_id: string,
  name: string,
  phrase_start: string,
  phrase_office_closed: string,
  phrase_office_temporary_closed: string,
  phrase_phone_not_available: string,
  phrase_dispatcher_not_available: string,
  created_at: string,
  created_by: string,
  last_edited_at: string,
  last_edited_by: string
  call_groups: string
}
