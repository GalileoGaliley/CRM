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
import { CallCenter_CallGroup, CallCenter_Dispatcher } from "../../../models/CallCenter"
import Switcher from "../../../components/Switcher"
import classNames from "classnames"
import { BaseLink, useRoute } from "react-router5"
import ReactInputMask from "react-input-mask"

interface Props {
  store: StoreState,
  dispatcher: StoreDispatch
}

interface DispatcherData {
  
  permissions: {
    
    edit_dispatcher: boolean,
    show_call_group: true,
  },

  dispatcher: CallCenter_Dispatcher,

  call_groups: CallCenter_CallGroup[],

  edit: {
    users: {
      user_id: string,
      user: string
    }[]
  }
}

const CallCenter_DispatchersPage_Item = connect(mapStateToProps, mapDispatchToProps)(function(props: Props) {

  const $router = useRoute()

  const [readyToSave, setReadyToSave] = useState(false)

  const [editing, setEditing] = useState(false)

  const [deleting, setDeleting] = useState(false)
  const [readyToDelete, setReadyToDelete] = useState(false)
  
  const [dispatcherData, setDispatcherData] = useState<DispatcherData | null>(null)

  const [newDispatcherData, setNewDispatcherData] = useState<Partial<CallCenter_Dispatcher>>({
    
  })
  
  // Load info function
  async function loadInfo() {
    try {
      const { data: dispatcherData } = (await axios.get('/json/call_center_dispatcher.json')) as {data: DispatcherData}

      setDispatcherData(dispatcherData)

      setNewDispatcherData({
        
        name: '',
        active: true,

        user: dispatcherData.edit.users[0].user_id,

        phone: '',
        is_phone: false,
        is_softphone: false
      })

      setTimeout(() => setReadyToSave(false), 100)
    }
    catch (error) {
      nError(error)
    }
  }

  // Load dispatcher data
  useEffect(() => {
    loadInfo()
  }, [])

  useEffect(() => setReadyToSave(true), [
    newDispatcherData
  ])
  
  // Render function
  return (<>
    {dispatcherData && newDispatcherData.active !== undefined ? (
      <div className="CallCenter_DispatchersPage_Item entity-edit">

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
          <h1>Dispatcher</h1>

          {dispatcherData?.permissions.edit_dispatcher && !editing ? (
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
                <span>Name:</span>
                
                <input disabled={!editing} type="text" defaultValue={dispatcherData.dispatcher.name} onChange={({target: {value}}) => setNewDispatcherData({...newDispatcherData, name: value})} />
              </div>
            </div>

            
            <div className="__right">

              <div className="field" style={{zIndex: 6}}>
                <span>Active:</span>
                
                <Switcher disabled={!editing} checked={newDispatcherData.active as boolean} onChange={(value) => setNewDispatcherData({...newDispatcherData, active: value})} />
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

                <div className="input-wrapper">
                  <Select disabled={!editing} options={dispatcherData.edit.users.map((user) => ({
                    span: user.user,
                    value: user.user_id
                  }))} selectedOption={newDispatcherData.user as string} onChange={(value: string) => setNewDispatcherData({...newDispatcherData, user: value})}/>
                </div>
              </div>

              <div className="field">
                <span>Phone:</span>

                <ReactInputMask disabled={!editing} type="text" mask="+1 (999) 999-9999" defaultValue={newDispatcherData.phone} onChange={({target: {value}}) => setNewDispatcherData({...newDispatcherData, phone: value})} />
              </div>
            </div>

            <div className="__right">

              <div className="field">
                <span>Softphone:</span>

                <Checkbox disabled={!editing} contents='' value={newDispatcherData.is_softphone} onChange={(value) => setNewDispatcherData({...newDispatcherData, is_softphone: value})} />
              </div>

              <div className="field">
                <span>Phone:</span>

                <Checkbox disabled={!editing} contents='' value={newDispatcherData.is_phone} onChange={(value) => setNewDispatcherData({...newDispatcherData, is_phone: value})} />
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
                <input type="text" defaultValue={dispatcherData.dispatcher.created_at} disabled={ true } />
              </div>

              <div className="field">
                <span>Created by:</span>
                <input type="text" defaultValue={dispatcherData.dispatcher.created_by} disabled={ true } />
              </div>
            </div>

            
            <div className="__right">

              <div className="field">
                <span>Last Edited:</span>
                <input type="text" defaultValue={dispatcherData.dispatcher.last_edited_at} disabled={ true } />
              </div>

              <div className="field">
                <span>Last Edited By:</span>
                <input type="text" defaultValue={dispatcherData.dispatcher.last_edited_by} disabled={ true } />
              </div>
            </div>
          </div>
        </div>

        <div className="fieldset">

          <div className="legend">Groups</div>

          <table className={classNames('table', '__hide-on-mobile', {
            __respectAsidePanel: props.store.navActive.is
          })}>
            <tr>
              <th>Name</th>
              <th>Dispatchers</th>
              <th>Call Flow</th>
            </tr>
            {dispatcherData.call_groups.map((callGroup, i) => (
              <tr key={i}>
                <td>{callGroup.name}</td>
                <td>{callGroup.dispatchers}</td>
                <td>{callGroup.call_flows}</td>
              </tr>
            ))}
          </table>

          <div className={classNames('mobile-table', '__show-on-mobile', {
            __respectAsidePanel: props.store.navActive.is
          })}>

            <div className="mobile-table-items">

              {dispatcherData.call_groups.map((callGroup, i: number) => (
                <div className="item" key={i}>

                  <div className="__top">

                    <div className="__left">
                      <div><b>{callGroup.name}</b></div>
                      <div>
                        {callGroup.dispatchers}
                      </div>
                    </div>
                  </div>

                  <div className="__bottom">

                    <div className="__left">
                      
                    </div>

                    <div className="__right">
                      <div>
                        {callGroup.call_flows}
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
              <button className="_red" onClick={() => setDeleting(true)}>Delete Dispatcher</button>
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
                Delete Dispatcher
              </div>

              <div className="checkbox-wrapper">
                <Checkbox contents="I understand that after deleting the dispatcher it will not be possible to recover." value={readyToDelete} onChange={(value) => setReadyToDelete(value)} />
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
export default CallCenter_DispatchersPage_Item
