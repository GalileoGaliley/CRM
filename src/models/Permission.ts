export default interface Permission {
  
  permission_id: string,
  name: string,
  users?: string,
  actions: string[]
}
