import axios from "axios"
import { useEffect, useState } from "react";
import { connect } from "react-redux";
import { nError } from "../../../funcs"
import { StoreDispatch, StoreState, mapDispatchToProps, mapStateToProps } from "../../../store";

import Select from "../../../components/Select"
import { BaseLink, useRoute } from "react-router5"
import { CallCenter_PhoneNumber } from "../../../models/CallCenter"
import Switcher from "../../../components/Switcher"

import "../../../styles/pages/common/entity-edit.sass"
import Icon from "../../../components/Icon"
import classNames from "classnames"
import ReactInputMask from "react-input-mask"

interface Props {
  store: StoreState,
  dispatcher: StoreDispatch
}

const CallCenter_PhoneNumbersPage_New = connect(mapStateToProps, mapDispatchToProps)(function(props: Props) {

  const [readyToSave, setReadyToSave] = useState(false)

  const $router = useRoute()

  const [edit, setEdit] = useState<{

    types: string[],
    sources: string[],
    companies: string[],
    areas: string[],
    call_flows: string[]
  } | null>(null)

  const [newPhoneNumberData, setNewPhoneNumberData] = useState<Partial<CallCenter_PhoneNumber> | null>(null)
  
  // Load info function
  async function loadInfo() {
    try {
      const { data: phoneNumbersData } = (await axios.get('/json/call_center_phone_numbers.json'))

      setEdit(phoneNumbersData.edit)

      setNewPhoneNumberData({
        ...newPhoneNumberData,

        phone: '',
        active: 'On',
        type: phoneNumbersData.edit.types[0],
        source: phoneNumbersData.edit.sources[0],
        company: phoneNumbersData.edit.companies[0],
        area: phoneNumbersData.edit.areas[0],
        call_flow: phoneNumbersData.edit.call_flows[0],
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

  // Watch changes
  useEffect(() => {
    setReadyToSave(true)
  }, [
    newPhoneNumberData
  ])
  
  // Render function
  return (<>
    {newPhoneNumberData && edit ? (
      <div className="CallCenter_PhoneNumbersPage_New entity-edit">

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
          <h1>New Phone Number</h1>
        </div>
        
        <div className="fieldset">
          
          <div className="legend">Main</div>

          <div className="fields">

            <div className="__left">
              <div className="field" style={{zIndex: 6}}>
                <span>Phone Number:</span>
                
                <ReactInputMask type="text" mask="+1 (999) 999-9999" defaultValue={newPhoneNumberData.phone} onChange={({target: {value}}) => setNewPhoneNumberData({...newPhoneNumberData, phone: value})} />
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
                  <Select options={edit.types.map((type) => ({
                    span: type,
                    value: type
                  }))} selectedOption={newPhoneNumberData.type as string} onChange={(value: string) => setNewPhoneNumberData({...newPhoneNumberData, type: value})}/>
                </div>
              </div>

              <div className="field">
                <span>Sources:</span>

                <div className="input-wrapper">
                  <Select options={edit.sources.map((source) => ({
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
                  <Select options={edit.companies.map((company) => ({
                    span: company,
                    value: company
                  }))} selectedOption={newPhoneNumberData.company as string} onChange={(value: string) => setNewPhoneNumberData({...newPhoneNumberData, company: value})}/>
                </div>
              </div>

              <div className="field" style={{zIndex: 5}}>
                <span>Area:</span>

                <div className="input-wrapper">
                  <Select options={edit.areas.map((area) => ({
                    span: area,
                    value: area
                  }))} selectedOption={newPhoneNumberData.area as string} onChange={(value: string) => setNewPhoneNumberData({...newPhoneNumberData, area: value})}/>
                </div>
              </div>

              <div className="field">
                <span>Call Flow:</span>

                <div className="input-wrapper">
                  <Select options={edit.call_flows.map((call_flow) => ({
                    span: call_flow,
                    value: call_flow
                  }))} selectedOption={newPhoneNumberData.call_flow as string} onChange={(value: string) => setNewPhoneNumberData({...newPhoneNumberData, call_flow: value})}/>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="wrapper flex-container sb editing-buttons">
          <div />
          <div className="buttons">
            <button className="_bordered _red" onClick={() => $router.router.navigate('call_center.phoneNumbers', {}, {
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
export default CallCenter_PhoneNumbersPage_New
