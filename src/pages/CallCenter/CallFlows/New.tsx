import axios from "axios"
import { useEffect, useState } from "react";
import { connect } from "react-redux";
import Icon from "../../../components/Icon"
import { nError } from "../../../funcs"
import { StoreDispatch, StoreState, mapDispatchToProps, mapStateToProps } from "../../../store";

import "../../../styles/pages/common/entity-edit.sass"
import Select from "../../../components/Select"
import Checkbox from "../../../components/Checkbox"
import { BaseLink, useRoute } from "react-router5"
import { CallCenter_CallFlow, CallCenter_CallGroup } from "../../../models/CallCenter"
import classNames from "classnames"

interface Props {
  store: StoreState,
  dispatcher: StoreDispatch
}

const emptyCallGroup: Partial<CallCenter_CallGroup> = {
  call_group_id: '',
  name: '',
  dispatchers: '',
  call_flows: ''
}

const CallCenter_CallFlowsPage_New = connect(mapStateToProps, mapDispatchToProps)(function(props: Props) {

  const [readyToSave, setReadyToSave] = useState(false)

  const $router = useRoute()

  const [callGroupsData, setCallGroupsData] = useState<CallCenter_CallGroup[]>([])

  const [callGroups, setCallGroups] = useState<CallCenter_CallGroup[] | null>(null)
  const [availableCallGroups, setAvailableCallGroups] = useState<Partial<CallCenter_CallGroup>[]>([])
  const [selectedCallGroup, setSelectedCallGroup] = useState<Partial<CallCenter_CallGroup>>(emptyCallGroup)
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
      const { data: callFlowsData } = (await axios.get('/json/call_center_call_flows.json'))

      setCallGroups(callFlowsData.edit.call_groups)

      setAvailableCallGroups([emptyCallGroup].concat(callFlowsData.edit.call_groups))

      setSelectedCallGroup(emptyCallGroup)

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

  useEffect(() => setReadyToSave(true), [
    newCallFlowData
  ])
  
  // Render function
  return (<>
    {true ? (
      <div className="CallCenter_CallFlowsPage_New entity-edit">

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
          <h1>New Call Flow</h1>
        </div>
        
        <div className="fieldset">
          
          <div className="legend">Main</div>

          <div className="fields">

            <div className="__left">
              <div className="field">
                <span>Name:</span>
                <input type="text" onChange={({target: {value}}) => setNewCallFlowData({...newCallFlowData, name: value})} />
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
                <textarea defaultValue={newCallFlowData.phrase_start} onChange={({target: {value}}) => setNewCallFlowData({...newCallFlowData, phrase_start: value})}></textarea>
              </div>

              <div className="field _ait">
                <span>Office Closed:</span>
                <textarea defaultValue={newCallFlowData.phrase_office_closed} onChange={({target: {value}}) => setNewCallFlowData({...newCallFlowData, phrase_office_closed: value})}></textarea>
              </div>

              <div className="field _ait">
                <span>Office Temporary Closed:</span>
                <textarea defaultValue={newCallFlowData.phrase_office_temporary_closed} onChange={({target: {value}}) => setNewCallFlowData({...newCallFlowData, phrase_office_temporary_closed: value})}></textarea>
              </div>
            </div>

            <div className="__right">
              <div className="field _ait">
                <span>Phone Number Not Available:</span>
                <textarea defaultValue={newCallFlowData.phrase_phone_not_available} onChange={({target: {value}}) => setNewCallFlowData({...newCallFlowData, phrase_phone_not_available: value})}></textarea>
              </div>

              <div className="field _ait">
                <span>Dispatchers Not Available:</span>
                <textarea defaultValue={newCallFlowData.phrase_dispatcher_not_available} onChange={({target: {value}}) => setNewCallFlowData({...newCallFlowData, phrase_dispatcher_not_available: value})}></textarea>
              </div>
            </div>
          </div>
        </div>

        <div className="wrapper flex-container sb editing-buttons">
          <div />
          <div className="buttons">
            <button className="_bordered _red" onClick={() => $router.router.navigate('call_center.callFlows', {}, {
              reload: true
            })}>
              Cancel
            </button>
            <button disabled={!readyToSave} className="_bordered _green">
              Save
            </button>
          </div>
        </div>
      </div>
    ) : null}
  </>)
})
export default CallCenter_CallFlowsPage_New
