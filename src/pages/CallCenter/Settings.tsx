import axios from "axios"
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import Icon from "../../components/Icon"
import { nError } from "../../funcs"
import { StoreDispatch, StoreState, mapDispatchToProps, mapStateToProps } from "../../store";
import Datetime from 'react-datetime'

import "../../styles/pages/common/entity-edit.sass"
import moment from "moment"
import Select from "../../components/Select"
import Checkbox from "../../components/Checkbox"
import { BaseLink, useRoute } from "react-router5"
import Switcher from "../../components/Switcher"
import classNames from "classnames"

interface Props {
  store: StoreState,
  dispatcher: StoreDispatch
}

interface SettingsData {
	permissions: {
		edit_call_settings: boolean
	},
  call_settings: {
    
    active: boolean,
    twilio_account_sid: string,
    twilio_call_token: string,
    twilio_token: string,

    created_at: string,
    created_by: string,
    last_edited_at: string,
    last_edited_by: string
  }
}

const CallCenter_SettingsPage_Item = connect(mapStateToProps, mapDispatchToProps)(function(props: Props) {

  const [readyToSave, setReadyToSave] = useState(false)

  const $router = useRoute()
  
  const [settingsData, setSettingsData] = useState<SettingsData | null>(null)

  const [newSettingsData, setNewSettingsData] = useState<{[key: string]: any}>({
    
  })

  const [inputTypes, setInputTypes] = useState({

    twilio_account_sid: 'password' as 'text' | 'password',
    twilio_call_token: 'password' as 'text' | 'password',
    twilio_token: 'password' as 'text' | 'password',
  })

  // Load info function
  async function loadInfo() {
    try {
      const { data: settingsData } = (await axios.get('/json/call_center_settings.json')) as {data: SettingsData}

      setSettingsData(settingsData)
      setNewSettingsData({
        ...newSettingsData,
        ...settingsData.call_settings
      })

      setTimeout(() => setReadyToSave(false), 100)
    }
    catch (error) {
      nError(error)
    }
  }

  // Load setting data
  useEffect(() => {
    loadInfo()
  }, [])

  // Watch changes
  useEffect(() => {
    setReadyToSave(true)
  }, [
    newSettingsData
  ])
  
  // Render function
  return (<>
    {newSettingsData ? (
      <div className="CallCenter_SettingsPage_Item entity-edit">

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
        
        <div className="fieldset">
          
          <div className="legend">Main</div>

          <div className="fields">

            <div className="__left">
              <div className="field">
                <span>Call center:</span>
                <Switcher checked={newSettingsData.active} onChange={(value) => setNewSettingsData({...newSettingsData, active: value})} />
              </div>
            </div>
          </div>
        </div>

        <div className="fieldset">
          
          <div className="legend">Twilio</div>

          <div className="fields">

            <div className="__left">
              <div className="field">
                <span>Account SID:</span>
                <div className="form-field _iconed">
                  <input type={inputTypes.twilio_account_sid} readOnly={inputTypes.twilio_account_sid !== 'text'} defaultValue={newSettingsData.twilio_account_sid} onChange={({target: {value}}) => setNewSettingsData({...newSettingsData, twilio_account_sid: value})} />
                  <button className="_zeroed _iconed" onClick={() => setInputTypes({...inputTypes, twilio_account_sid: inputTypes.twilio_account_sid === 'text' ? 'password' : 'text'})}>
                    <Icon icon="eye-4"/>
                  </button>
                </div>
              </div>

              <div className="field">
                <span>Call Token:</span>
                <div className="form-field _iconed">
                  <input type={inputTypes.twilio_call_token} readOnly={inputTypes.twilio_call_token !== 'text'} defaultValue={newSettingsData.twilio_call_token} onChange={({target: {value}}) => setNewSettingsData({...newSettingsData, twilio_call_token: value})} />
                  <button className="_zeroed _iconed" onClick={() => setInputTypes({...inputTypes, twilio_call_token: inputTypes.twilio_call_token === 'text' ? 'password' : 'text'})}>
                    <Icon icon="eye-4"/>
                  </button>
                </div>
              </div>
            </div>

            
            <div className="__right">

              <div className="field">
                <span>Token:</span>
                <div className="form-field _iconed">
                  <input type={inputTypes.twilio_token} readOnly={inputTypes.twilio_token !== 'text'} defaultValue={newSettingsData.twilio_token} onChange={({target: {value}}) => setNewSettingsData({...newSettingsData, twilio_token: value})} />
                  <button className="_zeroed _iconed" onClick={() => setInputTypes({...inputTypes, twilio_token: inputTypes.twilio_token === 'text' ? 'password' : 'text'})}>
                    <Icon icon="eye-4"/>
                  </button>
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
                <span>Last Edited:</span>
                <input type="text" defaultValue={newSettingsData.last_edited_at} disabled={ true } />
              </div>
            </div>

            
            <div className="__right">

              <div className="field">
                <span>Last Edited By:</span>
                <input type="text" defaultValue={newSettingsData.last_edited_by} disabled={ true } />
              </div>
            </div>
          </div>
        </div>

        <div className="wrapper flex-container sb editing-buttons">
          <div />
          <div className="buttons">
            <button className="_bordered _red" onClick={() => $router.router.navigate('call_center', {}, {
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
export default CallCenter_SettingsPage_Item
