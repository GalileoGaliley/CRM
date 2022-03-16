import axios from "axios"
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import Icon from "../../components/Icon"
import { nError } from "../../funcs/base"
import { StoreDispatch, StoreState, mapDispatchToProps, mapStateToProps } from "../../store";

import "../../styles/pages/common/entity-edit.sass"
import Select from "../../components/Select"
import Checkbox from "../../components/Checkbox"
import Switcher from "../../components/Switcher"
import classNames from "classnames"
import { BaseLink, useRoute } from "react-router5"
import ReactInputMask from "react-input-mask"
import ServiceResource from "../../models/ServiceResource"

interface Props {
  store: StoreState,
  dispatcher: StoreDispatch
}

interface ServiceResourceData {
  
  permissions: {
    
    edit_service_resource: boolean,
  },

  service_resource: ServiceResource,

  edit: {
    time_zone: string[],
    area: string[]
  }
}

const ServiceResourcesPage_Item = connect(mapStateToProps, mapDispatchToProps)(function(props: Props) {

  const $router = useRoute()

  const [readyToSave, setReadyToSave] = useState(false)

  const [editing, setEditing] = useState(false)

  const [deleting, setDeleting] = useState(false)
  const [readyToDelete, setReadyToDelete] = useState(false)
  
  const [serviceResourceData, setServiceResourceData] = useState<ServiceResourceData | null>(null)

  const [newServiceResourceData, setNewServiceResourceData] = useState<Partial<ServiceResource>>({
    
  })


  //ctrl + shift + Z


  // Load info function
  async function loadInfo() {
    try {
      const { data: serviceResourceData } = (await axios.get('/json/service_resource.json')) as {data: ServiceResourceData}

      setServiceResourceData(serviceResourceData)

      setNewServiceResourceData(serviceResourceData.service_resource)

      setTimeout(() => setReadyToSave(false), 100)
    }
    catch (error) {
      nError(error)
    }
  }

  // Load service_resource data
  useEffect(() => {
    loadInfo()
  }, [])

  useEffect(() => setReadyToSave(true), [
    newServiceResourceData
  ])
  
  // Render function
  return (<>
    {serviceResourceData && newServiceResourceData.active ? (
      <div className="ServiceResourcesPage_Item entity-edit">

        <div className="wrapper flex-container sb">
          <div className="flex-container _gap-narrow">
            <h1>Service Resource:</h1>

            <div className="item-name">
              {newServiceResourceData.nickname}
            </div>
          </div>

          {serviceResourceData?.permissions.edit_service_resource && !editing ? (
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
                <span>NickName:</span>
                
                <input disabled={!editing} type="text" defaultValue={serviceResourceData.service_resource.nickname} onChange={({target: {value}}) => setNewServiceResourceData({...newServiceResourceData, nickname: value})} />
              </div>
            </div>

            
            <div className="__right">

              <div className="field">
                <span>Active:</span>
                
                <Switcher disabled={!editing} checked={newServiceResourceData.active as boolean} onChange={(value) => setNewServiceResourceData({...newServiceResourceData, active: value})} />
              </div>
            </div>
          </div>
        </div>

        <div className="fieldset">

          <div className="legend">Settings</div>

          <div className="fields">

            <div className="__left">

              <div className="field">
                <span>User:</span>

                <input disabled={true} type="text" defaultValue={serviceResourceData.service_resource.user} />
              </div>

              <div className="field" style={{zIndex: 5}}>
                <span>Area:</span>
                <Select disabled={!editing} options={serviceResourceData.edit.area.map((option) => ({
                  span: option,
                  value: option
                }))} selectedOption={newServiceResourceData.area as string} onChange={(value: string) => setNewServiceResourceData({...newServiceResourceData, area: value})}/>
              </div>
            </div>

            <div className="__right">

              <div className="field">
                <span>Time Zone:</span>
                <Select disabled={!editing} options={serviceResourceData.edit.time_zone.map((option) => ({
                  span: option,
                  value: option
                }))} selectedOption={newServiceResourceData.time_zone as string} onChange={(value: string) => setNewServiceResourceData({...newServiceResourceData, time_zone: value})}/>
              </div>
            </div>
          </div>
        </div>

        <div className="fieldset">

          <div className="legend">Notifications</div>

          <div className="fields">

            <div className="__left">

              <div className="field">
                <span>Phone:</span>
                <ReactInputMask disabled={!editing} type="text" mask="+1 (999) 999-9999" defaultValue={newServiceResourceData.phone} onChange={({target: {value}}) => setNewServiceResourceData({...newServiceResourceData, phone: value})} />
              </div>

              <div className="field">
                <span>Slack Channel:</span>

                <input disabled={!editing} type="text" defaultValue={serviceResourceData.service_resource.slack_channel} onChange={({target: {value}}) => setNewServiceResourceData({...newServiceResourceData, slack_channel: value})} />
              </div>

              <div className="field">
                <span>Slack Member ID:</span>

                <input disabled={!editing} type="text" defaultValue={serviceResourceData.service_resource.slack_member_id} onChange={({target: {value}}) => setNewServiceResourceData({...newServiceResourceData, slack_member_id: value})} />
              </div>

            </div>

            <div className="__right">

              <div className="field">
                <span>Phone:</span>

                <Checkbox disabled={!editing} contents='' value={newServiceResourceData.is_phone} onChange={(value) => setNewServiceResourceData({...newServiceResourceData, is_phone: value})} />
              </div>

              <div className="field">
                <span>Is Slack:</span>

                <Checkbox disabled={!editing} contents='' value={newServiceResourceData.is_slack} onChange={(value) => setNewServiceResourceData({...newServiceResourceData, is_slack: value})} />
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
                <input type="text" defaultValue={serviceResourceData.service_resource.created_at} disabled={ true } />
              </div>

              <div className="field">
                <span>Created by:</span>
                <input type="text" defaultValue={serviceResourceData.service_resource.created_by} disabled={ true } />
              </div>
            </div>

            
            <div className="__right">

              <div className="field">
                <span>Last Edited:</span>
                <input type="text" defaultValue={serviceResourceData.service_resource.last_edited_at} disabled={ true } />
              </div>

              <div className="field">
                <span>Last Edited By:</span>
                <input type="text" defaultValue={serviceResourceData.service_resource.last_edited_by} disabled={ true } />
              </div>
            </div>
          </div>
        </div>

        {editing ? (
          <div className="wrapper flex-container sb editing-buttons">
            <div>
              <button className="_red" onClick={() => setDeleting(true)}>Delete Service Resource</button>
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
                Delete ServiceResource
              </div>

              <div className="checkbox-wrapper">
                <Checkbox contents="I understand that after deleting the service resource it will not be possible to recover." value={readyToDelete} onChange={(value) => setReadyToDelete(value)} />
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
export default ServiceResourcesPage_Item
