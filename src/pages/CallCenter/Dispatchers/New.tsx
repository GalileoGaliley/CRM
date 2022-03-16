import axios from "axios"
import { useEffect, useState } from "react";
import { connect } from "react-redux";
import { nError } from "../../../funcs"
import { StoreDispatch, StoreState, mapDispatchToProps, mapStateToProps } from "../../../store";

import Select from "../../../components/Select"
import { BaseLink, useRoute } from "react-router5"
import { CallCenter_Dispatcher } from "../../../models/CallCenter"
import Switcher from "../../../components/Switcher"

import "../../../styles/pages/common/entity-edit.sass"
import Checkbox from "../../../components/Checkbox"
import Icon from "../../../components/Icon"
import classNames from "classnames"
import ReactInputMask from "react-input-mask"

interface Props {
  store: StoreState,
  dispatcher: StoreDispatch
}

const CallCenter_DispatchersPage_New = connect(mapStateToProps, mapDispatchToProps)(function(props: Props) {

  const [readyToSave, setReadyToSave] = useState(false)

  const $router = useRoute()

  const [edit, setEdit] = useState<{

    users: {
      user_id: string,
      user: string
    }[]
  } | null>(null)

  const [newDispatcherData, setNewDispatcherData] = useState<Partial<CallCenter_Dispatcher> | null>(null)
  
  // Load info function
  async function loadInfo() {
    try {
      const { data: dispatchersData } = (await axios.get('/json/call_center_dispatchers.json'))

      setEdit(dispatchersData.edit)

      setNewDispatcherData({
        ...newDispatcherData,

        name: '',
        active: 'Active',

        user: dispatchersData.edit.users[0],

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

  // Watch changes
  useEffect(() => {
    setReadyToSave(true)
  }, [
    newDispatcherData
  ])
  
  // Render function
  return (<>
    {newDispatcherData && edit ? (
      <div className="CallCenter_DispatchersPage_New entity-edit">

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
          <h1>New Dispatcher</h1>
        </div>
        
        <div className="fieldset">
          
          <div className="legend">Main</div>

          <div className="fields">

            <div className="__left">
              <div className="field">
                <span>Name:</span>
                <input type="text" onChange={({target: {value}}) => setNewDispatcherData({...newDispatcherData, name: value})} />
              </div>
            </div>

            <div className="__right">
              <div className="field">
                <span>Active:</span>
                <Switcher checked={newDispatcherData.active === 'Active'} onChange={(value) => setNewDispatcherData({...newDispatcherData, active: value ? 'Active' : 'Inactive'})} />
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
                  <Select options={edit.users.map((user) => ({
                    span: user.user,
                    value: user.user_id
                  }))} selectedOption={newDispatcherData.user as string} onChange={(value: string) => setNewDispatcherData({...newDispatcherData, user: value})}/>
                </div>
              </div>

              <div className="field">
                <span>Phone:</span>

                <ReactInputMask type="text" mask="+1 (999) 999-9999" defaultValue={newDispatcherData.phone} onChange={({target: {value}}) => setNewDispatcherData({...newDispatcherData, phone: value})} />
              </div>
            </div>

            <div className="__right">

              <div className="field">
                <span>Softphone:</span>

                <Checkbox contents='' value={newDispatcherData.is_softphone} onChange={(value) => setNewDispatcherData({...newDispatcherData, is_softphone: value})} />
              </div>

              <div className="field">
                <span>Phone:</span>

                <Checkbox contents='' value={newDispatcherData.is_phone} onChange={(value) => setNewDispatcherData({...newDispatcherData, is_phone: value})} />
              </div>
            </div>
          </div>
        </div>

        <div className="wrapper flex-container sb editing-buttons">
          <div />
          <div className="buttons">
            <button className="_bordered _red" onClick={() => $router.router.navigate('call_center.dispatchers', {}, {
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
export default CallCenter_DispatchersPage_New
