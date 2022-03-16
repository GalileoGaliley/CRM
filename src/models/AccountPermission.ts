export default interface AccountPermissions {

  account_permission_id: string,
  name: string,
  accounts: string,
  actions: string[],
  created_at: string,
  created_by: string,
  last_edited_at: string,
  last_edited_by: string
}
