import axios from "axios"
import { useEffect, useState } from "react";
import { connect } from "react-redux";
import Icon from "../../components/Icon"
import {httpClient, nError} from "../../funcs"
import Client from "../../models/Client"
import { StoreDispatch, StoreState, mapDispatchToProps, mapStateToProps } from "../../store";

import "../../styles/pages/common/entity-edit.sass"
import Select from "../../components/Select"
import Appointment from "../../models/Appointment"
import Estimate from "../../models/Estimate"
import Invoice from "../../models/Invoice"
import Payment from "../../models/Payments"
import Checkbox from "../../components/Checkbox"
import classNames from "classnames"
import Job from "../../models/Job"
import { useRoute } from "react-router5"

interface Props {
  store: StoreState,
  dispatcher: StoreDispatch
}

interface Phone {
  name: string,
  phone: string
}

interface Address {
  address: string,
  property_type: string,
  note: string
}

interface Comment {
  created_at: string,
  comment: string,
  created_by: string
}

interface ClientData {
  
  permissions: {
    
    edit_client: boolean,
    show_job: boolean,
    show_appointment: boolean,
    show_estimate: boolean,
    show_invoice: boolean,
    show_payment: boolean
  },

  client: Client,

  phones: Phone[],
  addresses: Address[],
  comments: Comment[],
  jobs: Job[],
  appointments: Appointment[],
  estimates: Estimate[],
  invoices: Invoice[],
  payments: Payment[]

  edit: {
    source: string[]
  }
}

const ClientsPage_Item = connect(mapStateToProps, mapDispatchToProps)(function(props: Props) {

  const $router = useRoute()

  const [readyToSave, setReadyToSave] = useState(false)

  const [editing, setEditing] = useState(false)

  const [deleting, setDeleting] = useState(false)
  const [readyToDelete, setReadyToDelete] = useState(false)

  const [clientData, setClientData] = useState<ClientData | null>(null)

  const [newClientData, setNewClientData] = useState<Partial<Client> | null>(null)
  
  // Load info function
  async function loadInfo() {
    try {
      const { data: clientData } = (await httpClient.post('/clients/report')) as {data: ClientData}

      setClientData(clientData)
      setNewClientData(clientData.client)

      setTimeout(() => setReadyToSave(false), 100)
    }
    catch (error) {
      nError(error)
    }
  }

  // Load client data
  useEffect(() => {
    loadInfo()
  }, [])

  useEffect(() => setReadyToSave(true), [
    newClientData
  ])
  
  // Render function
  return (<>
    {clientData && newClientData ? (
      <div className="ClientsPage_Item entity-edit">

        <div className="wrapper flex-container sb">
          <h1>Client</h1>

          {clientData?.permissions.edit_client && !editing ? (
            <button className="_wa _green" onClick={() => setEditing(true)}>
              Edit
            </button>
          ) : null}
        </div>
        
        <div className="fieldset">
          
          <div className="legend">Main</div>

          <div className="fields">

            <div className="__left">
              <div className="field">
                <span>First Name:</span>
                <input type="text" disabled={!editing} defaultValue={newClientData.firstname} onChange={({target: {value}}) => setNewClientData({...newClientData, firstname: value})} />
              </div>

              <div className="field">
                <span>Last Name:</span>
                <input type="text" disabled={!editing} defaultValue={newClientData.lastname} onChange={({target: {value}}) => setNewClientData({...newClientData, lastname: value})} />
              </div>
            </div>

            <div className="__right">
              <div className="field">
                <span>Company:</span>
                <input type="text" disabled={!editing} defaultValue={newClientData.company_name} onChange={({target: {value}}) => setNewClientData({...newClientData, company_name: value})} />
              </div>

              <div className="field">
                <span>Source:</span>
                <Select disabled={!editing} options={clientData.edit.source.map((option) => ({
                  span: option,
                  value: option
                }))} selectedOption={newClientData.source as string} onChange={(value) => setNewClientData({...newClientData, source: value as string})}/>
              </div>
            </div>
          </div>
        </div>

        <div className="fieldset">
          
          <div className="legend">Financial</div>

          <div className="fields">

            <div className="__left">
              <div className="field">
                <span>Total:</span>
                <input type="text" disabled={true} defaultValue={newClientData.total} />
              </div>

              <div className="field">
                <span>Paid:</span>
                <input type="text" disabled={true} defaultValue={newClientData.paid} />
              </div>
            </div>

            <div className="__right">
              <div className="field">
                <span>Unpaid:</span>
                <input type="text" disabled={true} defaultValue={newClientData.unpaid} />
              </div>
            </div>
          </div>
        </div>

        <div className="fieldset">

          <div className="legend">Phones</div>

          <table className={classNames('table', '__hide-on-mobile', {
            __respectAsidePanel: props.store.navActive.is
          })}>
            <tr>
              <th>Name</th>
              <th>Phone</th>
            </tr>
            {clientData.phones.map((phone, i) => (
              <tr key={i}>
                <td>{phone.name}</td>
                <td>{phone.phone}</td>
              </tr>
            ))}
          </table>

          <div className={classNames('mobile-table', '__show-on-mobile', {
            __respectAsidePanel: props.store.navActive.is
          })}>

            <div className="mobile-table-items">

              {clientData.phones.map((phone, i: number) => (
                <div className="item" key={i}>

                  <div className="__top">

                    <div className="__left">
                      <div><strong>{phone.phone}</strong></div>
                      <div>
                        {phone.name}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="fieldset">

          <div className="legend">Addresses</div>

          <table className={classNames('table', '__hide-on-mobile', {
            __respectAsidePanel: props.store.navActive.is
          })}>
            <tr>
              <th>Address</th>
              <th>Property Type</th>
              <th>Note</th>
            </tr>
            {clientData.addresses.map((address, i) => (
              <tr key={i}>
                <td>{address.address}</td>
                <td>{address.property_type}</td>
                <td>{address.note}</td>
              </tr>
            ))}
          </table>

          <div className={classNames('mobile-table', '__show-on-mobile', {
            __respectAsidePanel: props.store.navActive.is
          })}>

            <div className="mobile-table-items">

              {clientData.addresses.map((address, i: number) => (
                <div className="item" key={i}>

                  <div className="__top">

                    <div className="__left">
                      <div><strong>{address.address}</strong></div>
                      <div>
                        {address.note}
                      </div>
                    </div>
                  </div>

                  <div className="__bottom">

                    <div className="__left">

                    </div>

                    <div className="__right">
                      <div>
                        {address.property_type}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="fieldset">

          <div className="legend">Comments</div>

          <table className={classNames('table', '__hide-on-mobile', {
            __respectAsidePanel: props.store.navActive.is
          })}>
            <tr>
              <th>Date</th>
              <th>Comment</th>
              <th>User</th>
            </tr>
            {clientData.comments.map((comment, i) => (
              <tr key={i}>
                <td>{comment.created_at}</td>
                <td>{comment.comment}</td>
                <td>{comment.created_by}</td>
              </tr>
            ))}
          </table>

          <div className={classNames('mobile-table', '__show-on-mobile', {
            __respectAsidePanel: props.store.navActive.is
          })}>

            <div className="mobile-table-items">

              {clientData.comments.map((comment, i: number) => (
                <div className="item" key={i}>

                  <div className="__top">

                    <div className="__left">
                      <div><strong>{comment.created_at}</strong></div>
                      <div>
                        {comment.comment}
                      </div>
                    </div>
                  </div>

                  <div className="__bottom">

                    <div className="__left">

                    </div>

                    <div className="__right">
                      <div>
                        <b>{comment.created_by}</b>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="fieldset">
          
          <div className="legend">Info</div>

          <div className="fields">

            <div className="__left">

              <div className="field">
                <span>Date Created:</span>
                <input type="text" defaultValue={newClientData.created_at} disabled={ true } />
              </div>

              <div className="field">
                <span>Created by:</span>
                <input type="text" defaultValue={newClientData.created_by} disabled={ true } />
              </div>
            </div>

            <div className="__right">
              <div className="field">
                <span>Last Edited:</span>
                <input type="text" defaultValue={newClientData.last_edited_at} disabled={ true } />
              </div>
              <div className="field">
                <span>Last Edited by:</span>
                <input type="text" defaultValue={newClientData.last_edited_by} disabled={ true } />
              </div>
            </div>
          </div>
        </div>

        <div className="fieldset">

          <div className="legend">Appointments</div>

          <table className={classNames('table', '__show-on-wide', {
            __respectAsidePanel: props.store.navActive.is
          })}>
            <tr>
              <th>Date</th>
              <th>Name</th>
              <th>Type</th>
              <th>Status</th>
              <th>Property type</th>
              <th>Area</th>
              <th>Created by</th>
              <th>Schedule time</th>
              <th>Service resource</th>
            </tr>
            {clientData.appointments.map((appointment, i) => (
              <tr key={i} onClick={() => $router.router.navigate('appointments.item', {
                appointmentId: appointment.appointment_id
              }, {reload: true})}>
                <td>{appointment.created_at}</td>
                <td>{appointment.name}</td>
                <td>
                  {appointment.type === 'Recall' ? (
                    <span className="red">
                      {appointment.type}
                    </span>
                  ) : appointment.type === 'Service call' ? (
                    <span className="green">
                      {appointment.type}
                    </span>
                  ) : (
                    <span className="blue">
                      {appointment.type}
                    </span>
                  )}
                </td>
                <td>{appointment.status}</td>
                <td>{appointment.property_type}</td>
                <td>{appointment.area}</td>
                <td>{appointment.created_by}</td>
                <td>{appointment.schedule_time}</td>
                <td>{appointment.service_resource}</td>
              </tr>
            ))}
          </table>

          <table className={classNames('table', '__hide-on-wide', '__hide-on-mobile', {
            __respectAsidePanel: props.store.navActive.is
          })}>
            <tr></tr>
            {clientData.appointments.map((appointment, i) => (
              <tr key={i} onClick={() => $router.router.navigate('appointments.item', {
                appointmentId: appointment.appointment_id
              }, {reload: true})}>
                <td>
                  <div>{appointment.name}</div>
                  <div>{appointment.created_at}</div>
                </td>
                <td>
                  <div>{appointment.service_resource}</div>
                  <div>{appointment.created_by}</div>
                </td>
                <td>
                  <div>{appointment.area}</div>
                  <div>{appointment.type}</div>
                </td>
                <td>
                  <div>{appointment.property_type}</div>
                  <div>{appointment.status}</div>
                </td>
                <td>
                  <div>{appointment.schedule_time}</div>
                  <div>&nbsp;</div>
                </td>
              </tr>
            ))}
          </table>

          <div className={classNames('mobile-table', '__show-on-mobile', {
            __respectAsidePanel: props.store.navActive.is
          })}>

            <div className="mobile-table-items">

              {clientData.appointments.map((appointment, i: number) => (
                <div className="item" key={i} onClick={() => $router.router.navigate('appointments.item', {
                appointmentId: appointment.appointment_id
              }, {reload: true})}>

                  <div className="__top">

                    <div className="__left">
                      <div className="flex-container">
                        <strong>{appointment.name}</strong>
                      </div>
                      <div>
                        {appointment.schedule_time}
                      </div>
                    </div>

                    <div className="__right">
                      <div>
                        {appointment.type === 'Recall' ? (
                          <span className="red">
                            {appointment.type}
                          </span>
                        ) : appointment.type === 'Service call' ? (
                          <span className="green">
                            {appointment.type}
                          </span>
                        ) : (
                          <span className="blue">
                            {appointment.type}
                          </span>
                        )}
                      </div>
                      <div>
                        {appointment.property_type}
                      </div>
                      <div>
                        <div className="fw500">{appointment.status}</div>
                      </div>
                    </div>
                  </div>

                  <div className="__bottom">

                    <div className="__left">
                      <div>
                        <span className="gray">Area:</span>
                        <span> {appointment.area}</span>
                      </div>
                      <div>
                        <span className="gray">Service Resourse:</span>
                        <span> {appointment.service_resource}</span>
                      </div>
                    </div>

                    <div className="__right small">
                      <div>
                        {appointment.created_at}
                      </div>
                      <div>
                        Created by {appointment.created_by}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="fieldset">

          <div className="legend">Estimates</div>

          <table className={classNames('table', '__hide-on-mobile', {
            __respectAsidePanel: props.store.navActive.is
          })}>
            <tr>
              <th><span>Date</span></th>
              <th><span>Name</span></th>
              <th><span>Status</span></th>
              <th><span>Service Resource</span></th>
              <th><span>Area</span></th>
              <th><span>Total</span></th>
              <th><span>Comment</span></th>
            </tr>
            {clientData.estimates.map((estimate, i) => (
              <tr key={i}>
                <td>{estimate.created_at}</td>
                <td>{estimate.name}</td>
                <td>{estimate.status}</td>
                <td>{estimate.service_resource}</td>
                <td>{estimate.area}</td>
                <td>{estimate.total}</td>
                <td>{estimate.comment}</td>
              </tr>
            ))}
          </table>

          <div className={classNames('mobile-table', '__show-on-mobile', {
            __respectAsidePanel: props.store.navActive.is
          })}>

            <div className="mobile-table-items">

              {clientData.estimates.map((estimate, i: number) => (
                <div className="item" key={i}>

                  <div className="__top">

                    <div className="__left">
                      <div>
                        <strong>{estimate.name}</strong>
                      </div>
                      <div>
                        <strong>{estimate.status}</strong>
                      </div>
                    </div>

                    <div className="__right">
                      <div>
                        Total: <b>{estimate.total}</b>
                      </div>
                    </div>
                  </div>

                  <div className="__bottom">

                    <div className="__left">
                      <div>
                        <span className="gray">Area:</span>
                        <span> {estimate.area}</span>
                      </div>
                      <div>
                        <span className="gray">Service Resourse:</span>
                        <span> {estimate.service_resource}</span>
                      </div>
                    </div>

                    <div className="__right small">
                      <div>
                        <b>{estimate.created_at}</b>
                      </div>
                    </div>
                  </div>

                  <div className="text">
                    {estimate.comment}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="fieldset">

          <div className="legend">Invoices</div>

          <table className={classNames('table', '__hide-on-mobile', {
            __respectAsidePanel: props.store.navActive.is
          })}>
            <tr>
              <th><span>Date</span></th>
              <th><span>Name</span></th>
              <th><span>Status</span></th>
              <th><span>Service Resource</span></th>
              <th><span>Area</span></th>
              <th><span>Total</span></th>
              <th><span>Paid</span></th>
              <th><span>Unpaid</span></th>
            </tr>

            {clientData.invoices.map((invoice, i) => (
              <tr key={i}>
                <td>{invoice.created_at}</td>
                <td>{invoice.name}</td>
                <td>{invoice.status}</td>
                <td>{invoice.service_resource}</td>
                <td>{invoice.area}</td>
                <td>{invoice.total}</td>
                <td>{invoice.paid}</td>
                <td>{invoice.unpaid}</td>
              </tr>
            ))}
          </table>

          <div className={classNames('mobile-table', '__show-on-mobile', {
            __respectAsidePanel: props.store.navActive.is
          })}>

            <div className="mobile-table-items">

              {clientData.invoices.map((invoice, i: number) => (
                <div className="item" key={i}>

                  <div className="__top">

                    <div className="__left">
                      <div><b>{invoice.name}</b></div>
                      <div>
                        {invoice.status}
                      </div>
                    </div>

                    <div className="__right">
                      <div>
                        Total: <b>{invoice.total}</b>
                      </div>
                      <div>
                        Paid: <b>{invoice.paid}</b>
                      </div>
                      <div>
                        Unpaid: <b>{invoice.unpaid}</b>
                      </div>
                    </div>
                  </div>

                  <div className="__bottom">

                    <div className="__left">
                      <div>
                        <span className="gray">Area:</span>
                        <span> {invoice.area}</span>
                      </div>
                      <div>
                        <span className="gray">Service Resource:</span>
                        <span> {invoice.service_resource}</span>
                      </div>
                    </div>

                    <div className="__right small">
                      <div>
                        <b>{invoice.created_at}</b>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="fieldset">

          <div className="legend">Payments</div>

          <table className={classNames('table', '__hide-on-mobile', {
            __respectAsidePanel: props.store.navActive.is
          })}>
            <tr>
              <th><span>Date</span></th>
              <th><span>Type</span></th>
              <th><span>Number</span></th>
              <th><span>Service</span></th>
              <th><span>Status</span></th>
              <th><span>Net</span></th>
              <th><span>Total</span></th>
              <th><span>Fee</span></th>
            </tr>

            {clientData.payments.map((payment, i) => (
              <tr key={i}>
                <td>{payment.created_at}</td>
                <td>{payment.type}</td>
                <td>{payment.number}</td>
                <td>{payment.service}</td>
                <td>{payment.status}</td>
                <td>{payment.net}</td>
                <td>{payment.total}</td>
                <td>{payment.fee}</td>
              </tr>
            ))}
          </table>

          <div className={classNames('mobile-table', '__show-on-mobile', {
            __respectAsidePanel: props.store.navActive.is
          })}>

            <div className="mobile-table-items">

              {clientData.payments.map((payment, i: number) => (
                <div className="item" key={i}>

                  <div className="__top">

                    <div className="__left">
                      <div><strong>{payment.number}</strong></div>
                      <div>{payment.service}</div>
                      <div>
                        <b>{payment.status}</b>
                      </div>
                    </div>

                    <div className="__right">
                      <div>
                        Net: <b>{payment.net}</b>
                      </div>
                      <div>
                        Total: <b>{payment.total}</b>
                      </div>
                      <div>
                        Fee: <b>{payment.fee}</b>
                      </div>
                    </div>
                  </div>

                  <div className="__bottom">

                    <div className="__left">
                      
                    </div>

                    <div className="__right small">
                      <div>
                        <b>{payment.created_at}</b>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {editing ? (
          <div className="wrapper flex-container sb editing-buttons">
            <div>
              <button className="_red" onClick={() => setDeleting(true)}>Delete Client</button>
            </div>
            <div className="buttons">
              <button className="_bordered _red" onClick={() => setEditing(false)}>
                Cancel
              </button>
              <button disabled={!readyToSave} className="_bordered _green">
                Save
              </button>
            </div>
          </div>
        ) : null}

        {/* Item delete popup */}
        {deleting ? (
          <div className="item-delete-popup" onClick={() => setDeleting(false)}>

            <div className="wrapper" onClick={(e) => e.stopPropagation()}>
            
              <div className="title">
                Delete Client
              </div>

              <div className="checkbox-wrapper">
                <Checkbox contents="I understand that after deleting the client it will not be possible to recover." value={readyToDelete} onChange={(value) => setReadyToDelete(value)} />
              </div>

              <div className="buttons">

                <button className="_bordered _green" onClick={() => setDeleting(false)}>
                  Cancel
                </button>

                <button disabled={!readyToDelete} className="_bordered _red">
                  Delete
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    ) : null}
  </>)
})
export default ClientsPage_Item
