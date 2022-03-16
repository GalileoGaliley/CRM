export default interface Invoice {

  invoice_id: string,
  created_at: string,
  name: string,
  status: string,
  service_resource: string,
  area: string,
  total: string,
  paid: string,
  unpaid: string
}
