import axios from "axios"
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import Icon from "../../../components/Icon"
import { nError } from "../../../funcs"
import { StoreDispatch, StoreState, mapDispatchToProps, mapStateToProps } from "../../../store";
import Datetime from 'react-datetime'

import "../../../styles/pages/common/entity-edit.sass"
import moment from "moment"
import Select from "../../../components/Select"
import Checkbox from "../../../components/Checkbox"
import { CallCenter_PhoneNumber } from "../../../models/CallCenter"
import Switcher from "../../../components/Switcher"
import { BaseLink, useRoute } from "react-router5"
import classNames from "classnames"

interface Props {
  store: StoreState,
  dispatcher: StoreDispatch
}

interface PhoneNumberData {
  
  permissions: {
    
    edit_phone_number: boolean,
  },

  phone_number: CallCenter_PhoneNumber,

  edit: {
    types: string[],
    sources: string[],
    companies: string[],
    areas: string[],
    call_flows: string[]
  }
}

const CallCenter_PhoneNumbersPage_Item = connect(mapStateToProps, mapDispatchToProps)(function(props: Props) {

  const $router = useRoute()

  const [readyToSave, setReadyToSave] = useState(false)

  const [editing, setEditing] = useState(false)

  const [deleting, setDeleting] = useState(false)
  const [readyToDelete, setReadyToDelete] = useState(false)
  
  const [phoneNumberData, setPhoneNumberData] = useState<PhoneNumberData | null>(null)

  const [newPhoneNumberData, setNewPhoneNumberData] = useState<Partial<CallCenter_PhoneNumber>>({
    
  })
  
  // Load info function
  async function loadInfo() {
    try {
      const { data: phoneNumberData } = (await axios.get('/json/call_center_phone_number.json')) as {data: PhoneNumberData}

      setPhoneNumberData(phoneNumberData)

      setNewPhoneNumberData({
        
        phone: '',
        active: 'On',

        type: phoneNumberData.edit.types[0],
        source: phoneNumberData.edit.sources[0],
        company: phoneNumberData.edit.companies[0],
        area: phoneNumberData.edit.areas[0],
        call_flow: phoneNumberData.edit.call_flows[0],
      })

      setTimeout(() => setReadyToSave(false), 100)
    }
    catch (error) {
      nError(error)
    }
  }

  // Load phoneNumber data
  useEffect(() => {
    loadInfo()
  }, [])

  useEffect(() => setReadyToSave(true), [
    newPhoneNumberData
  ])
  
  // Render function
  return (<>
    {phoneNumberData && newPhoneNumberData.active ? (
      <div className="CallCenter_PhoneNumbersPage_Item entity-edit">

        {/* Top navigation */}
        <div className="top-nav">
          <BaseLink router={$router.router} routeName="call_center.phoneNumbers" className={classNames({_active: $router.route.name === "call_center.phoneNumbers"})}>
            <Icon icon="phone-1" />
            <span>Phone Numbers</span>
          </BaseLink>

          <BaseLink router={$router.router} routeName="call_center.dispatchers" className={classNames({_active: $router.route.name === "call_center.dispatchers"})}>
            <Icon icon="user-1" />
            <span>Dispatchers</span>
          </BaseLink>

          <BaseLink router={$router.router} routeName="call_center.groups" className={classNames({_active: $router.route.name === "call_center.groups"})}>
            <Icon icon="user-29" />
            <span>Groups</span>
          </BaseLink>

          <BaseLink router={$router.router} routeName="call_center.callFlows" className={classNames({_active: $router.route.name === "call_center.callFlows"})}>
            <Icon icon="share-7" />
            <span>Call Flows</span>
          </BaseLink>

          <BaseLink router={$router.router} routeName="call_center.settings" className={classNames({_active: $router.route.name === "call_center.settings"})}>
            <Icon icon="gear-1" />
            <span>Settings</span>
          </BaseLink>
        </div>

        <div className="wrapper flex-container sb">
          <h1>Phone Number</h1>

          {phoneNumberData?.permissions.edit_phone_number && !editing ? (
            <button className="_wa _green" onClick={() => setEditing(true)}>
              Edit
            </button>
          ) : null}
        </div>
        
        <div className="fieldset">
          
          <div className="legend">Main</div>

          <div className="fields">

            <div className="__left">
              <div className="field" style={{zIndex: 6}}>
                <span>Phone Number:</span>
                
                <input disabled={true} type="text" defaultValue={phoneNumberData.phone_number.phone} onChange={({target: {value}}) => setNewPhoneNumberData({...newPhoneNumberData, phone: value})} />
              </div>
            </div>

            
            <div className="__right">

              <div className="field" style={{zIndex: 6}}>
                <span>Active:</span>
                
                <Switcher checked={newPhoneNumberData.active === 'On'} onChange={(value) => setNewPhoneNumberData({...newPhoneNumberData, active: value ? 'On' : 'Off'})} />
              </div>
            </div>
          </div>
        </div>

        <div className="fieldset">

          <div className="legend">Settings</div>

          <div className="fields">

            <div className="__left">

              <div className="field" style={{zIndex: 6}}>
                <span>Types:</span>

                <div className="input-wrapper">
                  <Select disabled={!editing} options={phoneNumberData.edit.types.map((type) => ({
                    span: type,
                    value: type
                  }))} selectedOption={newPhoneNumberData.type as string} onChange={(value: string) => setNewPhoneNumberData({...newPhoneNumberData, type: value})}/>
                </div>
              </div>

              <div className="field">
                <span>Sources:</span>

                <div className="input-wrapper">
                  <Select disabled={!editing} options={phoneNumberData.edit.sources.map((source) => ({
                    span: source,
                    value: source
                  }))} selectedOption={newPhoneNumberData.source as string} onChange={(value: string) => setNewPhoneNumberData({...newPhoneNumberData, source: value})}/>
                </div>
              </div>
            </div>

            <div className="__right">

              <div className="field" style={{zIndex: 6}}>
                <span>Company:</span>

                <div className="input-wrapper">
                  <Select disabled={!editing} options={phoneNumberData.edit.companies.map((company) => ({
                    span: company,
                    value: company
                  }))} selectedOption={newPhoneNumberData.company as string} onChange={(value: string) => setNewPhoneNumberData({...newPhoneNumberData, company: value})}/>
                </div>
              </div>

              <div className="field" style={{zIndex: 5}}>
                <span>Area:</span>

                <div className="input-wrapper">
                  <Select disabled={!editing} options={phoneNumberData.edit.areas.map((area) => ({
                    span: area,
                    value: area
                  }))} selectedOption={newPhoneNumberData.area as string} onChange={(value: string) => setNewPhoneNumberData({...newPhoneNumberData, area: value})}/>
                </div>
              </div>

              <div className="field">
                <span>Call Flow:</span>

                <div className="input-wrapper">
                  <Select disabled={!editing} options={phoneNumberData.edit.call_flows.map((call_flow) => ({
                    span: call_flow,
                    value: call_flow
                  }))} selectedOption={newPhoneNumberData.call_flow as string} onChange={(value: string) => setNewPhoneNumberData({...newPhoneNumberData, call_flow: value})}/>
                </div>
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
                <input type="text" defaultValue={phoneNumberData.phone_number.created_at} disabled={ true } />
              </div>

              <div className="field">
                <span>Created by:</span>
                <input type="text" defaultValue={phoneNumberData.phone_number.created_by} disabled={ true } />
              </div>
            </div>

            
            <div className="__right">

              <div className="field">
                <span>Last Edited:</span>
                <input type="text" defaultValue={phoneNumberData.phone_number.last_edited_at} disabled={ true } />
              </div>

              <div className="field">
                <span>Last Edited By:</span>
                <input type="text" defaultValue={phoneNumberData.phone_number.last_edited_by} disabled={ true } />
              </div>
            </div>
          </div>
        </div>

        {editing ? (
          <div className="wrapper flex-container sb editing-buttons">
            <div>
              <button className="_red" onClick={() => setDeleting(true)}>Delete Phone Number</button>
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
                Delete PhoneNumber
              </div>

              <div className="checkbox-wrapper">
                <Checkbox contents="I understand that after deleting the phone number it will not be possible to recover." value={readyToDelete} onChange={(value) => setReadyToDelete(value)} />
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
export default CallCenter_PhoneNumbersPage_Item
