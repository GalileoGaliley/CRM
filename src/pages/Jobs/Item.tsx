import axios from "axios"
import { useEffect, useState } from "react";
import { connect } from "react-redux";
import Icon from "../../components/Icon"

import {getActiveAccount, httpClient, nError} from "../../funcs"
import Job from "../../models/Job"
import { StoreDispatch, StoreState, mapDispatchToProps, mapStateToProps } from "../../store";

import "../../styles/pages/common/entity-edit.sass"
import Select from "../../components/Select"
import Client from "../../models/Client"
import Appointment from "../../models/Appointment"
import Estimate from "../../models/Estimate"
import Invoice from "../../models/Invoice"
import Payment from "../../models/Payments"
import Checkbox from "../../components/Checkbox"
import classNames from "classnames"
import { useRoute } from "react-router5"
import Account from "../../models/Account";

interface Props {
  store: StoreState,
  dispatcher: StoreDispatch
}

interface JobData {
  
  permissions: {
    
    edit_job: boolean,
    show_client: boolean,
    show_appointment: boolean,
    show_estimate: boolean,
    show_invoice: boolean,
    show_payment: boolean
  },

  job: Job,

  clients: Client[],
  appointments: Appointment[],
  estimates: Estimate[],
  invoices: Invoice[],
  payments: Payment[]

  edit: {
    status: string[],
    source: string[]
  }
}

const JobsPage_Item = connect(mapStateToProps, mapDispatchToProps)(function(props: Props) {

  const $router = useRoute()

  const [readyToSave, setReadyToSave] = useState(false)

  const activeAccount = getActiveAccount(props.store) as Account;
  const [editing, setEditing] = useState(false)

  const [deleting, setDeleting] = useState(false)
  const [readyToDelete, setReadyToDelete] = useState(false)

  const [jobData, setJobData] = useState<JobData | null>(null)

  const [newJobData, setNewJobData] = useState<Partial<Job>>({
    status: '',
    source: ''
  })
  
  // Load info function
  async function loadInfo() {
    try {
      const { data: jobData } = await httpClient.get('/jobs/' + activeAccount.account_id) as {data: JobData}

      setJobData(jobData)
      setNewJobData(jobData.job)

      setTimeout(() => setReadyToSave(false), 100)
    }
    catch (error) {
      nError(error)
    }
  }

  // Load job data
  useEffect(() => {
    loadInfo()
  }, [])

  useEffect(() => setReadyToSave(true), [
    newJobData
  ])
  
  // Render function
  return (<>
    {jobData && newJobData.status ? (
      <div className="JobsPage_Item entity-edit">

        <div className="wrapper flex-container sb">
          <h1>Job</h1>

          {jobData?.permissions.edit_job && !editing ? (
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
                <span>Name:</span>
                <input type="text" defaultValue={jobData?.job.name} disabled={ true } />
              </div>

              <div className="field">
                <span>Property type:</span>
                <input type="text" defaultValue={jobData?.job.property_type} disabled={ true } />
              </div>

              <div className="field">
                <span>Status:</span>
                <Select disabled={!editing} options={jobData.edit.status.map((option) => ({
                  span: option,
                  value: option
                }))} selectedOption={newJobData.status as string} onChange={(value) => setNewJobData({...newJobData, status: value as string})}/>
              </div>
            </div>

            <div className="__right">
              <div className="field">
                <span>Service Resource:</span>
                <input type="text" defaultValue={jobData?.job.service_resource} disabled={ true } />
              </div>

              <div className="field">
                <span>Area:</span>
                <input type="text" defaultValue={jobData?.job.area} disabled={ true } />
              </div>

              <div className="field">
                <span>Source:</span>
                <Select disabled={!editing} options={jobData.edit.source.map((option) => ({
                  span: option,
                  value: option
                }))} selectedOption={newJobData.source as string} onChange={(value) => setNewJobData({...newJobData, source: value as string})}/>
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
                <input type="text" defaultValue={jobData?.job.total} disabled={ true } />
              </div>
            </div>

            <div className="__right">
              <div className="field">
                <span>Paid:</span>
                <input type="text" defaultValue={jobData?.job.paid} disabled={ true } />
              </div>
            </div>
          </div>
        </div>

        <div className="fieldset">
          
          <div className="legend">Info</div>

          <div className="fields">

            <div className="__left">

              <div className="field">
                <span>Date Created:</span>
                <input type="text" defaultValue={jobData?.job.created_at} disabled={ true } />
              </div>

              <div className="field">
                <span>Created by:</span>
                <input type="text" defaultValue={jobData?.job.created_by} disabled={ true } />
              </div>
            </div>

            <div className="__right">
              <div className="field">
                <span>Last Edited:</span>
                <input type="text" defaultValue={jobData?.job.last_edited_at} disabled={ true } />
              </div>
              <div className="field">
                <span>Last Edited by:</span>
                <input type="text" defaultValue={jobData?.job.last_edited_by} disabled={ true } />
              </div>
            </div>
          </div>
        </div>

        <div className="fieldset">

          <div className="legend">Clients</div>

          <table className={classNames('table', '__show-on-wide', {
            __respectAsidePanel: props.store.navActive.is
          })}>
            <tr>
              <th>Date</th>
              <th>Main Phone</th>
              <th>Source</th>
              <th>Jobs</th>
              <th>Appointments</th>
              <th>Recalls</th>
              <th>Total</th>
              <th>Paid</th>
              <th>Unpaid</th>
            </tr>
            {jobData.clients.map((client, i) => (
              <tr key={i} onClick={() => $router.router.navigate('clients.item', {
                clientId: client.client_id
              }, {reload: true})}>
                <td>{client.name}</td>
                <td>{client.main_phone}</td>
                <td>{client.source}</td>
                <td>{client.jobs}</td>
                <td>{client.appointments}</td>
                <td>{client.recalls}</td>
                <td>{client.total}</td>
                <td>{client.paid}</td>
                <td>{client.unpaid}</td>
              </tr>
            ))}
          </table>

          <table className={classNames('table', '__hide-on-wide', '__hide-on-mobile', {
            __respectAsidePanel: props.store.navActive.is
          })}>
            <tr></tr>
            {jobData.clients.map((client, i) => (
              <tr key={i} onClick={() => $router.router.navigate('clients.item', {
                clientId: client.client_id
              }, {reload: true})}>
                <td>
                  <div>{client.name}</div>
                  <div>{client.main_phone}</div>
                </td>
                <td>
                  <div>{client.source}</div>
                  <div>Jobs: {client.jobs}</div>
                </td>
                <td>
                  <div>Appointments: {client.appointments}</div>
                  <div>Recalls: {client.recalls}</div>
                </td>
                <td>
                  <div>Total: {client.total}</div>
                  <div>Paid: {client.paid}</div>
                </td>
                <td>
                  <div>Unpaid: {client.unpaid}</div>
                  <div>&nbsp;</div>
                </td>
              </tr>
            ))}
          </table>

          <div className={classNames('mobile-table', '__show-on-mobile', {
            __respectAsidePanel: props.store.navActive.is
          })}>

            <div className="mobile-table-items">

              {jobData.clients.map((client, i: number) => (
                <div className="item" key={i} onClick={() => $router.router.navigate('clients.item', {
                clientId: client.client_id
              }, {reload: true})}>

                  <div className="__top">

                    <div className="__left">
                      <div><b>{client.name}</b></div>
                      <div>
                        {client.main_phone}
                      </div>
                    </div>

                    <div className="__right">
                      <div>
                        Total: <b>{client.total}</b>
                      </div>
                      <div>
                        Paid: <b>{client.paid}</b>
                      </div>
                      <div>
                        Unpaid: <b>{client.unpaid}</b>
                      </div>
                    </div>
                  </div>

                  <div className="__bottom">

                    <div className="__left">
                      <div>
                        <span className="gray">Jobs:</span>
                        <span> {client.jobs}</span>
                      </div>
                      <div>
                        <span className="gray">Recalls:</span>
                        <span> {client.recalls}</span>
                      </div>
                      <div>
                        <span className="gray">Appointments:</span>
                        <span> {client.appointments}</span>
                      </div>
                    </div>

                    <div className="__right small">
                      <div>
                        <b>{client.source}</b>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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
            {jobData.appointments.map((appointment, i) => (
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
            {jobData.appointments.map((appointment, i) => (
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

              {jobData.appointments.map((appointment, i: number) => (
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
            {jobData.estimates.map((estimate, i) => (
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

              {jobData.estimates.map((estimate, i: number) => (
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

            {jobData.invoices.map((invoice, i) => (
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

              {jobData.invoices.map((invoice, i: number) => (
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

            {jobData.payments.map((payment, i) => (
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

              {jobData.payments.map((payment, i: number) => (
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
              <button className="_red" onClick={() => setDeleting(true)}>Delete Job</button>
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

        {/* Item share popup */}
        {deleting ? (
          <div className="item-delete-popup" onClick={() => setDeleting(false)}>

            <div className="wrapper" onClick={(e) => e.stopPropagation()}>
            
              <div className="title">
                Delete Absence
              </div>

              <div className="checkbox-wrapper">
                <Checkbox contents="I understand that after deleting the absence it will not be possible to recover." value={readyToDelete} onChange={(value) => setReadyToDelete(value)} />
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
export default JobsPage_Item
