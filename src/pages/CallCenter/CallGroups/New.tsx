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
import { CallCenter_Dispatcher } from "../../../models/CallCenter"
import classNames from "classnames"

interface Props {
  store: StoreState,
  dispatcher: StoreDispatch
}

const emptyDispatcher: CallCenter_Dispatcher = {
  dispatcher_id: '',
  name: '',
  user: '',
  phone: '',
  is_phone: false,
  is_softphone: false,
  active: 'Active',
  groups: '',
  "created_at": "05/04/2021 09:32am",
  "created_by": "Alex",
  "last_edited_at": "05/04/2021 10:34am",
  "last_edited_by": "Alex"
}

const CallCenter_CallGroupsPage_New = connect(mapStateToProps, mapDispatchToProps)(function(props: Props) {

  const [readyToSave, setReadyToSave] = useState(false)

  const $router = useRoute()

  const [dispatchers, setDispatchers] = useState<CallCenter_Dispatcher[] | null>(null)
  const [availableDispatchers, setAvailableDispatchers] = useState<CallCenter_Dispatcher[]>([])
  const [selectedDispatcher, setSelectedDispatcher] = useState<CallCenter_Dispatcher>(emptyDispatcher)
  const [newCallGroupData, setNewCallGroupData] = useState({
    name: '',
    dispatchers: [] as CallCenter_Dispatcher[]
  })
  
  // Load info function
  async function loadInfo() {
    try {
      const { data: callGroupsData } = (await axios.get('/json/call_center_call_groups.json'))

      setDispatchers(callGroupsData.edit.dispatchers)
      setAvailableDispatchers([emptyDispatcher].concat(callGroupsData.edit.dispatchers))
      setSelectedDispatcher([emptyDispatcher].concat(callGroupsData.edit.dispatchers)[0])

      setTimeout(() => setReadyToSave(false), 100)
    }
    catch (error) {
      nError(error)
    }
  }

  // Load callGroup data
  useEffect(() => {
    loadInfo()
  }, [])

  // Add dispatcher function
  function addDispatcher() {

    if (!newCallGroupData.dispatchers || !newCallGroupData) return

    const newDispatchersList = [
      ...newCallGroupData.dispatchers,
      selectedDispatcher
    ]

    setNewCallGroupData({
      ...newCallGroupData,
      dispatchers: newDispatchersList
    })

    let _availableDispatchers = [...availableDispatchers]

    _availableDispatchers = _availableDispatchers.filter(($dispatcher) => {
      
      return newDispatchersList.findIndex((dispatcher) => {
        return dispatcher.name === $dispatcher.name
      }) === -1
    })

    setAvailableDispatchers([
      ..._availableDispatchers
    ])

    setSelectedDispatcher(emptyDispatcher)

    setReadyToSave(true)
  }

  // Remove dispatcher function
  function removeDispatcher(i: number) {

    let _callGroupDispatchers = [...newCallGroupData.dispatchers]

    let _dispatcher = _callGroupDispatchers[i]
    
    _callGroupDispatchers.splice(i, 1)

    setNewCallGroupData({
      ...newCallGroupData,
      dispatchers: _callGroupDispatchers
    })

    setAvailableDispatchers([
      ...availableDispatchers,
      _dispatcher
    ])

    setReadyToSave(true)
  }

  useEffect(() => setReadyToSave(true), [
    newCallGroupData
  ])
  
  // Render function
  return (<>
    {true ? (
      <div className="CallCenter_CallGroupsPage_New entity-edit">

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
          <h1>New Call Group</h1>
        </div>
        
        <div className="fieldset">
          
          <div className="legend">Main</div>

          <div className="fields">

            <div className="__left">
              <div className="field">
                <span>Name:</span>
                <input type="text" onChange={({target: {value}}) => setNewCallGroupData({...newCallGroupData, name: value})} />
              </div>
            </div>
          </div>
        </div>

        <div className="fieldset">

          <div className="flex-container sb wrap">
            <div className="legend">Dispatchers</div>

            <div className="legend-action-wrapper">
              <label>Dispatcher:</label>
              <div className="input-wrapper">
                <Select options={availableDispatchers.map((dispatcher) => ({
                  span: dispatcher.name,
                  value: dispatcher.name
                }))} selectedOption={selectedDispatcher.name} onChange={(value) => setSelectedDispatcher(availableDispatchers.find((_dispatcher) => _dispatcher.name === value) as CallCenter_Dispatcher)}/>
                <button disabled={!selectedDispatcher.name} className="_green" onClick={() => addDispatcher()}>
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
              <th>User</th>
              <th>Phone</th>
              <th>Phone</th>
              <th>Softphone</th>
              <th>Active</th>
              <th></th>
            </tr>
            {(newCallGroupData.dispatchers as CallCenter_Dispatcher[]).map((dispatcher, i) => (
              <tr key={i}>
                <td>{dispatcher.name}</td>
                <td>{dispatcher.user}</td>
                <td>{dispatcher.phone}</td>
                <td>
                  <Checkbox contents={''} value={dispatcher.is_phone} />
                </td>
                <td>
                  <Checkbox contents={''} value={dispatcher.is_softphone} />
                </td>
                <td className={classNames({
                  'red-text': dispatcher.active === 'Off',
                  'green-text': dispatcher.active === 'On',
                })}>{dispatcher.active}</td>
                <td>
                  <button className="_zeroed _iconed _red" onClick={() => removeDispatcher(i)}>
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

              {newCallGroupData.dispatchers.map((dispatcher, i: number) => (
              <div className="item" key={i} onClick={() => $router.router.navigate('call_center.dispatchers.item', {}, {reload: true})}>

                <div className="__top">

                  <div className="__left">
                    <div><b>{dispatcher.name}</b></div>
                    <div>
                      {dispatcher.user}
                    </div>
                  </div>

                  <div className="__right small">
                    <div className={classNames({
                      'red-text': dispatcher.active === 'Inactive',
                      'green-text': dispatcher.active === 'Active',
                    })}>
                      {dispatcher.active}
                    </div>
                    <div>
                      {dispatcher.phone}
                    </div>
                  </div>
                </div>

                <div className="__bottom">

                  <div className="__left">
                    <div className="flex-container">
                      <span className="gray">Phone:</span>
                      <span> <Checkbox contents='' value={dispatcher.is_phone} /></span>
                    </div>
                    <div className="flex-container">
                      <span className="gray">Softphone:</span>
                      <span> <Checkbox contents='' value={dispatcher.is_softphone} /></span>
                    </div>
                  </div>

                  <div className="__right small">
                    <div>
                        <button className="_zeroed _iconed _red" onClick={(e) => { e.stopPropagation(); removeDispatcher(i) }}>
                        <Icon icon="x-mark-1" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            </div>
          </div>
        </div>

        <div className="wrapper flex-container sb editing-buttons">
          <div />
          <div className="buttons">
            <button className="_bordered _red" onClick={() => $router.router.navigate('call_center.groups', {}, {
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
export default CallCenter_CallGroupsPage_New
