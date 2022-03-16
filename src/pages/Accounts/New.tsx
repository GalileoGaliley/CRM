import axios from "axios"
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import Icon from "../../components/Icon"
import {httpClient, nError} from "../../funcs"
import Account from "../../models/Account"
import { StoreDispatch, StoreState, mapDispatchToProps, mapStateToProps } from "../../store";
import Datetime from 'react-datetime'

import "../../styles/pages/common/entity-edit.sass"
import moment from "moment"
import Select from "../../components/Select"
import Checkbox from "../../components/Checkbox"
import { useRoute } from "react-router5"
import Switcher from "../../components/Switcher"
import ReactCrop, { Crop } from "react-image-crop"
import AccountCustom from "../../models/AccountCustom"
import ReactInputMask from "react-input-mask"

interface Props {
  store: StoreState,
  dispatcher: StoreDispatch
}

const AccountsPage_New = connect(mapStateToProps, mapDispatchToProps)(function(props: Props) {

  const [readyToSave, setReadyToSave] = useState(false)

  const $router = useRoute()

  const [avatarPopup, setAvatarPopup] = useState(false)
  const [avatarImageSrc, setAvatarImageSrc] = useState('')
  const [avatarCrop, setAvatarCrop] = useState<Partial<Crop>>({
    unit: '%',
    width: 30,
    aspect: 1
  })

  const [inputTypes, setInputTypes] = useState({

    twilio_account_sid: 'password' as 'text' | 'password',
    twilio_call_token: 'password' as 'text' | 'password',
    twilio_token: 'password' as 'text' | 'password',
  })

  const [editions, setEditions] = useState<{
    time_zone: string[],
    source: string[],
    status: string[],
    owners: {
      user: string,
      user_id: string
    }[],
    permissions: string[],
    state: string[]
  } | null>(null)

  const [newAccountData, setNewAccountData] = useState<Partial<AccountCustom>>({
    
  })
  
  // Load info function
  async function loadInfo() {
    try {
      const { data: accountsData } = await httpClient.get('/accounts')

      setEditions(accountsData.edit)
      setNewAccountData({
        name: '',
        owner: '',
        phone: '',
        status: '',
        email: '',
        source: '',
        users: '',
        phone_numbers: '',
        twilio_account_sid: '',
        twilio_call_token: '',
        twilio_token: '',
        slack_url: '',
        slack_active: true,
        mailing_street: '',
        mailing_unit: '',
        mailing_city: '',
        mailing_zip: '',
        mailing_state: accountsData.edit.state[0],
        billing_street: '',
        billing_unit: '',
        billing_city: '',
        billing_zip: '',
        billing_state: accountsData.edit.state[0],
      })

      setTimeout(() => setReadyToSave(false), 100)
    }
    catch (error) {
      nError(error)
    }
  }

  // Load account data
  useEffect(() => {
    loadInfo()
  }, [])

  // On select file function
  function onSelectFile(e: any) {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () =>
        setAvatarImageSrc(reader.result as string)
      );
      reader.readAsDataURL(e.target.files[0]);
    }
  }

  useEffect(() => setReadyToSave(true), [
    newAccountData
  ])
  
  // Render function
  return (<>
    {editions ? (
      <div className="AccountsPage_New entity-edit">

        <div className="wrapper flex-container sb">
          <h1>New account</h1>
        </div>
        
        <div className="fieldset">
          
          <div className="legend">Main</div>

          <div className="fields">

            <div className="__left">
              <div className="field">
                <span>Name:</span>
                <input type="text" defaultValue={newAccountData.name} onChange={({target: {value}}) => setNewAccountData({...newAccountData, name: value})} />
              </div>

              <div className="field">
                <span>Owner:</span>
                <Select options={editions.owners.map((owner) => ({
                  span: owner.user,
                  value: owner.user_id
                }))} selectedOption={newAccountData.owner as string} onChange={(value: string) => setNewAccountData({...newAccountData, owner: value})}/>
              </div>

              <div className="field">
                <span>Phone:</span>
                <ReactInputMask type="text" mask="+1 (999) 999-9999" defaultValue={newAccountData.phone} onChange={({target: {value}}) => setNewAccountData({...newAccountData, phone: value})} />
              </div>
            </div>

            <div className="__right">
              <div className="field" style={{zIndex: 5}}>
                <span>Status:</span>
                <Select options={editions.status.map((status) => ({
                  span: status,
                  value: status
                }))} selectedOption={newAccountData.status as string} onChange={(value: string) => setNewAccountData({...newAccountData, status: value})}/>
              </div>

              <div className="field">
                <span>Email:</span>
                <input type="text" defaultValue={newAccountData.email} />
              </div>

              <div className="field">
                <span>Source:</span>
                <Select options={editions.source.map((source) => ({
                  span: source,
                  value: source
                }))} selectedOption={newAccountData.source as string} onChange={(value: string) => setNewAccountData({...newAccountData, source: value})}/>
              </div>
            </div>

            <div className="avatar-editing">
              <button className="_zeroed _iconed" onClick={() => setAvatarPopup(true)}>
                <Icon icon="user-20" />
              </button>
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
                  <input type={inputTypes.twilio_account_sid} readOnly={inputTypes.twilio_account_sid !== 'text'} defaultValue={newAccountData.twilio_account_sid} onChange={({target: {value}}) => setNewAccountData({...newAccountData, twilio_account_sid: value})} />
                  <button className="_zeroed _iconed" onClick={() => setInputTypes({...inputTypes, twilio_account_sid: inputTypes.twilio_account_sid === 'text' ? 'password' : 'text'})}>
                    <Icon icon="eye-4"/>
                  </button>
                </div>
              </div>

              <div className="field">
                <span>Call Token:</span>
                <div className="form-field _iconed">
                  <input type={inputTypes.twilio_call_token} readOnly={inputTypes.twilio_call_token !== 'text'} defaultValue={newAccountData.twilio_call_token} onChange={({target: {value}}) => setNewAccountData({...newAccountData, twilio_call_token: value})} />
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
                  <input type={inputTypes.twilio_token} readOnly={inputTypes.twilio_token !== 'text'} defaultValue={newAccountData.twilio_token} onChange={({target: {value}}) => setNewAccountData({...newAccountData, twilio_token: value})} />
                  <button className="_zeroed _iconed" onClick={() => setInputTypes({...inputTypes, twilio_token: inputTypes.twilio_token === 'text' ? 'password' : 'text'})}>
                    <Icon icon="eye-4"/>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="fieldset">
          
          <div className="legend">Settings</div>

          <div className="fields">

            <div className="__left">

              <div className="field">
                <span>Permission:</span>
                <Select options={editions.permissions.map((permission) => ({
                  span: permission,
                  value: permission
                }))} selectedOption={newAccountData.permission as string} onChange={(value: string) => setNewAccountData({...newAccountData, permission: value})}/>
              </div>
              
              <div className="field">
                <span>Slack Url:</span>
                <input type="text" defaultValue={newAccountData.slack_url} onChange={({target: {value}}) => setNewAccountData({...newAccountData, slack_url: value})} />
              </div>
            </div>

            <div className="__right">

              <div className="field">
                <span>Time Zone:</span>
                <Select options={editions.time_zone.map((time_zone) => ({
                  span: time_zone,
                  value: time_zone
                }))} selectedOption={newAccountData.time_zone as string} onChange={(value: string) => setNewAccountData({...newAccountData, time_zone: value})}/>
              </div>
              
              <div className="field">
                <span>Slack:</span>
                <Switcher checked={newAccountData.slack_active} onChange={(value) => setNewAccountData({...newAccountData, slack_active: value})} />
              </div>
            </div>
          </div>
        </div>

        <div className="fieldset">
          
          <div className="legend">Mailing Address</div>

          <div className="fields">

            <div className="__left">
              <div className="field">
                <span>Street:</span>
                <input type="text" defaultValue={newAccountData.mailing_street} onChange={({target: {value}}) => setNewAccountData({...newAccountData, mailing_street: value})} />
              </div>

              <div className="field">
                <span>Unit/Apt:</span>
                <input type="text" defaultValue={newAccountData.mailing_unit} onChange={({target: {value}}) => setNewAccountData({...newAccountData, mailing_unit: value})} />
              </div>

              <div className="field">
                <span>City:</span>
                <input type="text" defaultValue={newAccountData.mailing_city} onChange={({target: {value}}) => setNewAccountData({...newAccountData, mailing_city: value})} />
              </div>
            </div>

            <div className="__right">
              <div className="field">
                <span>State:</span>
                <Select options={editions.state.map((option) => ({
                  span: option,
                  value: option
                }))} selectedOption={newAccountData.mailing_state as string} onChange={(value: string) => setNewAccountData({...newAccountData, mailing_state: value})}/>
              </div>

              <div className="field">
                <span>Zip:</span>
                <input type="text" defaultValue={newAccountData.mailing_zip} onChange={({target: {value}}) => setNewAccountData({...newAccountData, mailing_zip: value})} />
              </div>
            </div>
          </div>
        </div>

        <div className="fieldset">
          
          <div className="flex-container sb wrap">
            <div className="legend">Billing Address</div>

            <div className="legend-action-wrapper">
              <label>Same as Mailing Address:</label>

              <div className="input-wrapper">
                <Checkbox contents='' value={newAccountData.same_address} onChange={(value) => setNewAccountData({...newAccountData, same_address: value})} />
              </div>
            </div>
          </div>

          {!newAccountData.same_address ? (
            <div className="fields">

              <div className="__left">
                <div className="field">
                  <span>Street:</span>
                  <input type="text" defaultValue={newAccountData.billing_street} onChange={({target: {value}}) => setNewAccountData({...newAccountData, billing_street: value})} />
                </div>

                <div className="field">
                  <span>Unit/Apt:</span>
                  <input type="text" defaultValue={newAccountData.billing_unit} onChange={({target: {value}}) => setNewAccountData({...newAccountData, billing_unit: value})} />
                </div>

                <div className="field">
                  <span>City:</span>
                  <input type="text" defaultValue={newAccountData.billing_city} onChange={({target: {value}}) => setNewAccountData({...newAccountData, billing_city: value})} />
                </div>
              </div>

              <div className="__right">
                <div className="field">
                  <span>State:</span>
                  <Select options={editions.state.map((option) => ({
                    span: option,
                    value: option
                  }))} selectedOption={newAccountData.billing_state as string} onChange={(value: string) => setNewAccountData({...newAccountData, billing_state: value})}/>
                </div>

                <div className="field">
                  <span>Zip:</span>
                  <input type="text" defaultValue={newAccountData.billing_zip} onChange={({target: {value}}) => setNewAccountData({...newAccountData, billing_zip: value})} />
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="wrapper flex-container sb editing-buttons">
          <div />
          <div className="buttons">
            <button className="_bordered _red" onClick={() => $router.router.navigate('accounts', {}, {
              reload: true
            })}>
              Cancel
            </button>
            <button disabled={!readyToSave} className="_bordered _green">
              Save
            </button>
          </div>
        </div>

        {avatarPopup ? (
          <div className="popup imageCrop" onClick={() => setAvatarPopup(false)}>

            <div className="wrapper" onClick={(e) => e.stopPropagation()}>
              
              <div>
                <input type="file" accept="image/*" onChange={onSelectFile} id="file-uploader" />
                <button className="_wa _iconed _bordered _blue" onClick={() => document.getElementById('file-uploader')?.click()}>
                  <Icon icon="account-33" />
                  <span>Upload a File</span>
                </button>
              </div>

              <div>
                {avatarImageSrc && (
                  <ReactCrop
                    src={avatarImageSrc}
                    crop={avatarCrop}
                    onChange={(value) => setAvatarCrop(value)}
                  />
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    ) : null}
  </>)
})
export default AccountsPage_New
