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
import { CallCenter_CallFlow, CallCenter_CallGroup, CallCenter_PhoneNumber } from "../../../models/CallCenter"
import Switcher from "../../../components/Switcher"
import classNames from "classnames"
import { BaseLink, useRoute } from "react-router5"

interface Props {
  store: StoreState,
  dispatcher: StoreDispatch
}

interface CallFlowData {
  
  permissions: {
    
    edit_call_flow: boolean,
    show_phone_number: boolean,
    show_call_group: boolean,
  },

  call_flow: CallCenter_CallFlow,
  call_groups: CallCenter_CallGroup[],
  phone_numbers: CallCenter_PhoneNumber[],

  edit: {
    
    call_groups: CallCenter_CallGroup[]
  }
}

const emptyCallGroup: Partial<CallCenter_CallGroup> = {
  call_group_id: '',
  name: '',
  dispatchers: '',
  call_flows: ''
}

const CallCenter_CallFlowsPage_Item = connect(mapStateToProps, mapDispatchToProps)(function(props: Props) {

  const $router = useRoute()

  const [readyToSave, setReadyToSave] = useState(false)

  const [editing, setEditing] = useState(true)

  const [deleting, setDeleting] = useState(false)
  const [readyToDelete, setReadyToDelete] = useState(false)
  
  const [callFlowData, setCallFlowData] = useState<CallFlowData | null>(null)

  const [callGroups, setCallGroups] = useState<CallCenter_CallGroup[] | null>(null)
  const [availableCallGroups, setAvailableCallGroups] = useState<Partial<CallCenter_CallGroup>[]>([])
  const [selectedCallGroup, setSelectedCallGroup] = useState<Partial<CallCenter_CallGroup>>(emptyCallGroup)

  const [callGroupsData, setCallGroupsData] = useState<CallCenter_CallGroup[]>([])

  const [phoneNumbers, setPhoneNumbers] = useState<CallCenter_PhoneNumber[]>([])

  const [newCallFlowData, setNewCallFlowData] = useState({
    name: '',
    phrase_start: '',
    phrase_office_closed: '',
    phrase_office_temporary_closed: '',
    phrase_phone_not_available: '',
    phrase_dispatcher_not_available: ''
  })
  
  // Load info function
  async function loadInfo() {
    try {
      const { data: callFlowData } = (await axios.get('/json/call_center_call_flow.json')) as {data: CallFlowData}

      setPhoneNumbers(callFlowData.phone_numbers)
      
      setCallFlowData(callFlowData)

      setCallGroups(callFlowData.edit.call_groups)
      setCallGroupsData(callFlowData.call_groups)

      let _availableCallGroups = []

      _availableCallGroups = callFlowData.edit.call_groups.filter(($callGroup) => {
        
        return callFlowData.call_groups.findIndex((callGroup) => {
          return callGroup.name === $callGroup.name
        }) === -1
      })

      setAvailableCallGroups([
        ..._availableCallGroups
      ])
      
      // setAvailableCallGroups([emptyCallGroup].concat(callFlowData.edit.call_groups))

      setSelectedCallGroup(emptyCallGroup)

      setNewCallFlowData({
        name: callFlowData.call_flow.name,

        phrase_start: callFlowData.call_flow.phrase_start,
        phrase_office_closed: callFlowData.call_flow.phrase_office_closed,
        phrase_office_temporary_closed: callFlowData.call_flow.phrase_office_temporary_closed,
        phrase_phone_not_available: callFlowData.call_flow.phrase_phone_not_available,
        phrase_dispatcher_not_available: callFlowData.call_flow.phrase_dispatcher_not_available
      })

      setTimeout(() => setReadyToSave(false), 100)
    }
    catch (error) {
      nError(error)
    }
  }

  // Load callFlow data
  useEffect(() => {
    loadInfo()
  }, [])

  useEffect(() => setReadyToSave(true), [
    newCallFlowData
  ])

  // Add callGroup function
  function addCallGroup() {

    if (!callGroupsData || !newCallFlowData) return

    const newCallGroupsList = [
      ...callGroupsData,
      selectedCallGroup
    ]

    setCallGroupsData(newCallGroupsList as any)

    let _availableCallGroups = [...availableCallGroups]

    _availableCallGroups = _availableCallGroups.filter(($callGroup) => {
      
      return newCallGroupsList.findIndex((callGroup) => {
        return callGroup.name === $callGroup.name
      }) === -1
    })

    setAvailableCallGroups([
      ..._availableCallGroups
    ])

    setSelectedCallGroup(emptyCallGroup)

    setReadyToSave(true)
  }

  // Remove callGroup function
  function removeCallGroup(i: number) {

    let _callFlowCallGroups = [...callGroupsData]

    let _callGroup = _callFlowCallGroups[i]
    
    _callFlowCallGroups.splice(i, 1)

    setCallGroupsData(_callFlowCallGroups)

    setAvailableCallGroups([
      ...availableCallGroups,
      _callGroup
    ])

    setReadyToSave(true)
  }
  
  // Render function
  return (<>
    {callFlowData && newCallFlowData.name ? (
      <div className="CallCenter_CallFlowsPage_Item entity-edit">

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
          <h1>Call Flow</h1>

          {callFlowData?.permissions.edit_call_flow && !editing ? (
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
                <input type="text" defaultValue={newCallFlowData.name} onChange={({target: {value}}) => setNewCallFlowData({...newCallFlowData, name: value})} />
              </div>
            </div>
          </div>
        </div>

        <div className="fieldset">

          <div className="flex-container sb wrap">
            <div className="legend">Call Groups</div>

            <div className="legend-action-wrapper">
              <label>Call Group:</label>
              <div className="input-wrapper">
                <Select options={availableCallGroups.map((callGroup) => ({
                  span: callGroup.name as string,
                  value: callGroup.name as string
                }))} selectedOption={selectedCallGroup.name as string} onChange={(value) => setSelectedCallGroup(availableCallGroups.find((_callGroup) => _callGroup.name === value) as CallCenter_CallGroup)}/>
                <button disabled={!selectedCallGroup.name} className="_green" onClick={() => addCallGroup()}>
                  Add
                </button>
              </div>
            </div>
          </div>

          <table className={classNames('table', '__hide-on-mobile', {
            __respectAsidePanel: props.store.navActive.is
          })}>
            <tr>
              <th>Name</th>
              <th>Dispatchers</th>
              <th>Call Flow</th>
              <th></th>
            </tr>
            {(callGroupsData as CallCenter_CallGroup[]).map((callGroup, i) => (
              <tr key={i}>
                <td>{callGroup.name}</td>
                <td>{callGroup.dispatchers}</td>
                <td>{callGroup.call_flows}</td>
                <td>
                  <button className="_zeroed _iconed _red" onClick={(e) => { e.stopPropagation(); removeCallGroup(i) }}>
                    <Icon icon="x-mark-1" />
                  </button>
                </td>
              </tr>
            ))}
          </table>

          <div className={classNames('mobile-table', '__show-on-mobile', {
            __respectAsidePanel: props.store.navActive.is
          })}>

            <div className="mobile-table-items">

              {callGroupsData.map((callGroup, i: number) => (
              <div className="item" key={i}>

                <div className="__top">

                  <div className="__left">
                    <div><b>{callGroup.name}</b></div>
                    <div>
                      {callGroup.dispatchers}
                    </div>
                  </div>

                  <div className="__right">
                    
                  </div>
                </div>

                <div className="__bottom">

                  <div className="__left">
                    
                  </div>

                  <div className="__right small">
                    <div>
                      <b>{callGroup.call_flows}</b>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            </div>
          </div>
        </div>

        <div className="fieldset">

          <div className="legend">Call Phrases</div>

          <div className="fields">

            <div className="__left">
              <div className="field _ait">
                <span>Start Phrase:</span>
                <textarea defaultValue={callFlowData.call_flow.phrase_start} onChange={({target: {value}}) => setNewCallFlowData({...newCallFlowData, phrase_start: value})}></textarea>
              </div>

              <div className="field _ait">
                <span>Office Closed:</span>
                <textarea defaultValue={callFlowData.call_flow.phrase_office_closed} onChange={({target: {value}}) => setNewCallFlowData({...newCallFlowData, phrase_office_closed: value})}></textarea>
              </div>

              <div className="field _ait">
                <span>Office Temporary Closed:</span>
                <textarea defaultValue={callFlowData.call_flow.phrase_office_temporary_closed} onChange={({target: {value}}) => setNewCallFlowData({...newCallFlowData, phrase_office_temporary_closed: value})}></textarea>
              </div>
            </div>

            <div className="__right">
              <div className="field _ait">
                <span>Phone Number Not Available:</span>
                <textarea defaultValue={callFlowData.call_flow.phrase_phone_not_available} onChange={({target: {value}}) => setNewCallFlowData({...newCallFlowData, phrase_phone_not_available: value})}></textarea>
              </div>

              <div className="field _ait">
                <span>Dispatchers Not Available:</span>
                <textarea defaultValue={callFlowData.call_flow.phrase_dispatcher_not_available} onChange={({target: {value}}) => setNewCallFlowData({...newCallFlowData, phrase_dispatcher_not_available: value})}></textarea>
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
                <input type="text" defaultValue={callFlowData.call_flow.created_at} disabled={ true } />
              </div>

              <div className="field">
                <span>Created by:</span>
                <input type="text" defaultValue={callFlowData.call_flow.created_by} disabled={ true } />
              </div>
            </div>

            
            <div className="__right">

              <div className="field">
                <span>Last Edited:</span>
                <input type="text" defaultValue={callFlowData.call_flow.last_edited_at} disabled={ true } />
              </div>

              <div className="field">
                <span>Last Edited By:</span>
                <input type="text" defaultValue={callFlowData.call_flow.last_edited_by} disabled={ true } />
              </div>
            </div>
          </div>
        </div>

        <div className="fieldset">

          <div className="legend">Phone Numbers</div>

          {/* Wide desktop table */}
          <table className={classNames('table', '__show-on-wide', {
            __respectAsidePanel: props.store.navActive.is
          })}>
            <tr>
              <th>Phone Number</th>
              <th>Friendly Name</th>
              <th>Type</th>
              <th>Source</th>
              <th>Area</th>
              <th>Company</th>
              <th>Call Flow</th>
              <th>Available</th>
            </tr>
            {phoneNumbers.map((phoneNumber, i) => (
              <tr key={i} onClick={() => $router.router.navigate('call_center.phoneNumbers.item', {}, {reload: true})}>
                <td>
                  <div className="flex-container">
                    <span>{phoneNumber.phone}</span>
                    <button className="_zeroed _iconed">
                      <Icon icon="gear-1"/>
                    </button>
                  </div>
                </td>
                <td>{phoneNumber.friendly_name}</td>

                <td className={classNames({
                  'red-text': phoneNumber.type === 'System',
                  'green-text': phoneNumber.type === 'Source',
                  'blue-text': !['System', 'Source'].includes(phoneNumber.type)
                })}>{phoneNumber.type}</td>

                <td>{phoneNumber.source}</td>
                <td>{phoneNumber.area}</td>
                <td>{phoneNumber.company}</td>
                <td>{phoneNumber.call_flow}</td>

                <td className={classNames({
                  'red-text': phoneNumber.active === 'Off',
                  'green-text': phoneNumber.active === 'On',
                })}>{phoneNumber.active}</td>
              </tr>
            ))}
          </table>

          {/* Medium screen table */}
          <table className={classNames('table', '__hide-on-wide', '__hide-on-mobile', {
            __respectAsidePanel: props.store.navActive.is
          })}>
            <tr></tr>
            {phoneNumbers.map((phoneNumber, i) => (
              <tr key={i} onClick={() => $router.router.navigate('call_center.phoneNumbers.item', {}, {reload: true})}>
                <td>
                  <div>{phoneNumber.phone}</div>
                  <div>{phoneNumber.friendly_name}</div>
                </td>
                <td>
                  <div>{phoneNumber.source}</div>
                  <div>{phoneNumber.area}</div>
                </td>
                <td>
                  <div>{phoneNumber.company}</div>
                  <div className={classNames({
                  'red-text': phoneNumber.type === 'System',
                  'green-text': phoneNumber.type === 'Source',
                  'blue-text': !['System', 'Source'].includes(phoneNumber.type)
                })}>{phoneNumber.type}</div>
                </td>
                <td>
                  <div>{phoneNumber.call_flow}</div>
                  <div className={classNames({
                  'red-text': phoneNumber.active === 'Off',
                  'green-text': phoneNumber.active === 'On',
                })}>{phoneNumber.active}</div>
                </td>
              </tr>
            ))}
          </table>

          {/* Mobile table items */}
          <div className={classNames('mobile-table-items', '__show-on-mobile', {
            __respectAsidePanel: props.store.navActive.is
          })}>

            {phoneNumbers.map((phoneNumber, i: number) => (
              <div className="item" key={i} onClick={() => $router.router.navigate('call_center.phoneNumbers.item', {}, {reload: true})}>

                <div className="__top">

                  <div className="__left">
                    <div><b>{phoneNumber.phone}</b></div>
                    <div>
                      {phoneNumber.friendly_name}
                    </div>
                  </div>

                  <div className="__right">
                    <div>
                      {phoneNumber.company}
                    </div>
                    <div className={classNames({
                      'red-text': phoneNumber.type === 'System',
                      'green-text': phoneNumber.type === 'Source',
                      'blue-text': !['System', 'Source'].includes(phoneNumber.type)
                    })}>
                      {phoneNumber.type}
                    </div>
                    <div className={classNames({
                      'red-text': phoneNumber.active === 'Off',
                      'green-text': phoneNumber.active === 'On',
                    })}>
                      {phoneNumber.active}
                    </div>
                  </div>
                </div>

                <div className="__bottom">

                  <div className="__left">
                    <div>
                      <span className="gray">Area:</span>
                      <span> {phoneNumber.area}</span>
                    </div>
                    <div>
                      <span className="gray">Source:</span>
                      <span> {phoneNumber.source}</span>
                    </div>
                  </div>

                  <div className="__right small">
                    <div>
                      <b>{phoneNumber.call_flow}</b>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {editing ? (
          <div className="wrapper flex-container sb editing-buttons">
            <div>
              <button className="_red" onClick={() => setDeleting(true)}>Delete Call Flow</button>
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
                Delete Call Flow
              </div>

              <div className="checkbox-wrapper">
                <Checkbox contents="I understand that after deleting the call flow it will not be possible to recover." value={readyToDelete} onChange={(value) => setReadyToDelete(value)} />
              </div>

              <div className="buttons">

                <button className="_bordered _green" onClick={() => $router.router.navigate('call_center.callFlows', {}, {
                  reload: true
                })}>
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
export default CallCenter_CallFlowsPage_Item
