export default interface User {
  user_id: string,
  first_name: string,
  last_name: string,
  photo_link: null,
  time_zone_id: 1,
  ticket_notice: 0,
  main_notice: 0,
  function?: string,
  phone?: string,
  email?: string,
  time_zone?: string,
  permissions?: string,
  active?: string
}
