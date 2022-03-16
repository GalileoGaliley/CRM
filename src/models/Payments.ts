export default interface Payment {

  payment_id: string,
  created_at: string,
  type: string,
  number: string,
  service: string,
  status: string,
  net: string,
  total: string,
  fee: string
}
