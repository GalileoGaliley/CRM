import axios from "axios"
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import Icon from "../../components/Icon"
import {httpClient, nError} from "../../funcs"
import Appointment from "../../models/Appointment"
import { StoreDispatch, StoreState, mapDispatchToProps, mapStateToProps } from "../../store";
import Datetime from 'react-datetime'

import "../../styles/pages/common/entity-edit.sass"
import moment from "moment"
import Select from "../../components/Select"
import Checkbox from "../../components/Checkbox"
import Client from "../../models/Client"
import ServiceResource from "../../models/ServiceResource"
import classNames from "classnames"
import { useRoute } from "react-router5"

interface Props {
  store: StoreState,
  dispatcher: StoreDispatch
}

interface AppointmentData {
  
  permissions: {
    
    edit_appointment: boolean,
    show_client: boolean,
  },

  appointment: Appointment,

  clients: Client[],

  edit: {
    type: string[],
    status: string[],
    service_resources: ServiceResource[]
  }
}

const AppointmentsPage_Item = connect(mapStateToProps, mapDispatchToProps)(function(props: Props) {

  const $router = useRoute()
  
  const [readyToSave, setReadyToSave] = useState(false)

  const [editing, setEditing] = useState(false)

  const [deleting, setDeleting] = useState(false)
  const [readyToDelete, setReadyToDelete] = useState(false)
  
  const [appointmentData, setAppointmentData] = useState<AppointmentData | null>(null)

  const [newAppointmentData, setNewAppointmentData] = useState<Partial<Appointment> | null>(null)
  
  // Load info function
  async function loadInfo() {
    try {
      const { data: appointmentData } = await httpClient.get('/appointmens') as {data: AppointmentData}

      setAppointmentData(appointmentData)

      setNewAppointmentData({
        ...appointmentData.appointment,
        schedule_time_start: new Date(appointmentData.appointment.schedule_time_start),
        schedule_time_end: new Date(appointmentData.appointment.schedule_time_end),
      })

      setTimeout(() => setReadyToSave(false), 100)
    }
    catch (error) {
      nError(error)
    }
  }

  // Load appointment data
  useEffect(() => {
    loadInfo()
  }, [])

  useEffect(() => setReadyToSave(true), [
    newAppointmentData
  ])
  
  // Render function
  return (<>
    {appointmentData && newAppointmentData ? (
      <div className="AppointmentsPage_Item entity-edit">

        <div className="wrapper flex-container sb">
          <h1>Appointment</h1>

          {appointmentData?.permissions.edit_appointment && !editing ? (
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
                <input type="text" disabled={true} defaultValue={newAppointmentData.name} onChange={({target: {value}}) => setNewAppointmentData({...newAppointmentData, name: value})} />
              </div>

              <div className="field" style={{zIndex: 6}}>
                <span>Type:</span>
                <Select disabled={!editing} options={appointmentData.edit.type.map((option) => ({
                  span: option,
                  value: option
                }))} selectedOption={newAppointmentData.type as string} onChange={(value: string) => setNewAppointmentData({...newAppointmentData, type: value})}/>
              </div>

              <div className="field">
                <span>Status:</span>
                <Select disabled={!editing} options={appointmentData.edit.status.map((option) => ({
                  span: option,
                  value: option
                }))} selectedOption={newAppointmentData.status as string} onChange={(value: string) => setNewAppointmentData({...newAppointmentData, status: value})}/>
              </div>
            </div>

            
            <div className="__right">

              <div className="field">
                <span>Job:</span>
                <input type="text" disabled={true} defaultValue={newAppointmentData.job} />
              </div>

              <div className="field">
                <span>Property Type:</span>
                <input type="text" disabled={true} defaultValue={newAppointmentData.property_type} />
              </div>

              <div className="field">
                <span>Area:</span>
                <input type="text" disabled={true} defaultValue={newAppointmentData.area} />
              </div>
            </div>
          </div>
        </div>

        <div className="fieldset">
          
          <div className="legend">Schedule</div>

          <div className="fields">

            <div className="__left">

              <div className="field">
                <span>Appointment start:</span>
                <Datetime inputProps={{ disabled: !editing }} value={newAppointmentData.schedule_time_start} onChange={(value) => setNewAppointmentData({...newAppointmentData, schedule_time_start: moment.isMoment(value) ? value.toDate() : (appointmentData as AppointmentData).appointment.schedule_time_start})} />
              </div>

              <div className="field">
                <span>Appointment end:</span>
                <Datetime inputProps={{ disabled: !editing }} value={newAppointmentData.schedule_time_end} onChange={(value) => setNewAppointmentData({...newAppointmentData, schedule_time_end: moment.isMoment(value) ? value.toDate() : (appointmentData as AppointmentData).appointment.schedule_time_end})} />
              </div>
            </div>

            
            <div className="__right">

              <div className="field">
                <span>Service Resource:</span>
                <Select disabled={!editing} options={appointmentData.edit.service_resources.map((option) => ({
                  span: option.nickname,
                  value: option.nickname
                }))} selectedOption={newAppointmentData.service_resource as string} onChange={(value: string) => setNewAppointmentData({...newAppointmentData, service_resource: value})}/>
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
                <input type="text" defaultValue={appointmentData?.appointment.created_at} disabled={ true } />
              </div>

              <div className="field">
                <span>Created by:</span>
                <input type="text" defaultValue={appointmentData?.appointment.created_by} disabled={ true } />
              </div>
            </div>

            
            <div className="__right">

              <div className="field">
                <span>Last Edited:</span>
                <input type="text" defaultValue={appointmentData?.appointment.last_edited_at} disabled={ true } />
              </div>

              <div className="field">
                <span>Last Edited By:</span>
                <input type="text" defaultValue={appointmentData?.appointment.last_edited_by} disabled={ true } />
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
            {appointmentData.clients.map((client, i) => (
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
            {appointmentData.clients.map((client, i) => (
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

              {appointmentData.clients.map((client, i: number) => (
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

        {editing ? (
          <div className="wrapper flex-container sb editing-buttons">
            <div>
              <button className="_red" onClick={() => setDeleting(true)}>Delete Appointment</button>
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
                Delete Appointment
              </div>

              <div className="checkbox-wrapper">
                <Checkbox contents="I understand that after deleting the appointment it will not be possible to recover." value={readyToDelete} onChange={(value) => setReadyToDelete(value)} />
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
export default AppointmentsPage_Item
