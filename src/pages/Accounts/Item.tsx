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
import AccountCustom from "../../models/AccountCustom"
import ReactCrop, { Crop } from "react-image-crop"
import Switcher from "../../components/Switcher"
import ReactInputMask from "react-input-mask"

interface Props {
  store: StoreState,
  dispatcher: StoreDispatch
}

interface AccountData {

	permissions: {
		edit_account: boolean,
  },
  
  account: AccountCustom,
  
	edit: {
    status: string[],
    owners: {
      user_id: string,
      user: string
    }[],
    source: string[],
    time_zone: string[],
    permissions: string[],
    state: string[]
	}
}

const AccountsPage_Item = connect(mapStateToProps, mapDispatchToProps)(function(props: Props) {

  const [readyToSave, setReadyToSave] = useState(false)

  const $router = useRoute()

  const [editing, setEditing] = useState(false)

  const [inputTypes, setInputTypes] = useState({

    twilio_account_sid: 'password' as 'text' | 'password',
    twilio_call_token: 'password' as 'text' | 'password',
    twilio_token: 'password' as 'text' | 'password',
  })

  const [deleting, setDeleting] = useState(false)
  const [readyToDelete, setReadyToDelete] = useState(false)
  
  const [accountData, setAccountData] = useState<AccountData | null>(null)

  const [avatarPopup, setAvatarPopup] = useState(false)
  const [avatarImageSrc, setAvatarImageSrc] = useState('')
  const [avatarCrop, setAvatarCrop] = useState<Partial<Crop>>({
    unit: '%',
    width: 30,
    aspect: 1
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
      const { data: accountData } = await httpClient.get('/accounts') as {data: AccountData}

      setAccountData(accountData)
      setEditions(accountData.edit)
      setNewAccountData(accountData.account)

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
    {accountData && editions && newAccountData.time_zone ? (
      <div className="AccountsPage_Item entity-edit">

        <div className="wrapper flex-container sb">
          <div className="flex-container _gap-narrow">
            <h1>Account:</h1>
            <div className="item-name">
              {accountData.account.name}
            </div>
          </div>

          {accountData?.permissions.edit_account && !editing ? (
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
                <input type="text" disabled={!editing} defaultValue={accountData.account.name} onChange={({target: {value}}) => setNewAccountData({...newAccountData, name: value})} />
              </div>

              <div className="field">
                <span>Owner:</span>
                <Select disabled={!editing} options={editions.owners.map((owner) => ({
                  span: owner.user,
                  value: owner.user_id
                }))} selectedOption={newAccountData.owner as string} onChange={(value: string) => setNewAccountData({...newAccountData, owner: value})}/>
              </div>

              <div className="field">
                <span>Phone:</span>
                <ReactInputMask disabled={!editing} type="text" mask="+1 (999) 999-9999" defaultValue={newAccountData.phone} onChange={({target: {value}}) => setNewAccountData({...newAccountData, phone: value})} />
              </div>
            </div>

            <div className="__right">
              <div className="field" style={{zIndex: 5}}>
                <span>Status:</span>
                <Select disabled={!editing} options={editions.status.map((status) => ({
                  span: status,
                  value: status
                }))} selectedOption={newAccountData.status as string} onChange={(value: string) => setNewAccountData({...newAccountData, status: value})}/>
              </div>

              <div className="field">
                <span>Email:</span>
                <input type="text" defaultValue={accountData.account.email} disabled={!editing} />
              </div>

              <div className="field">
                <span>Source:</span>
                <Select disabled={!editing} options={editions.source.map((source) => ({
                  span: source,
                  value: source
                }))} selectedOption={newAccountData.source as string} onChange={(value: string) => setNewAccountData({...newAccountData, source: value})}/>
              </div>
            </div>

            <div className="avatar-editing">
              <button className="_zeroed _iconed" onClick={() => editing && setAvatarPopup(true)}>
                <Icon icon="user-20" />
              </button>
            </div>
          </div>
        </div>

        <div className="fieldset">
          
          <div className="legend">Statistics</div>

          <div className="fields">

            <div className="__left">
              <div className="field">
                <span>Users:</span>
                <input type="text" disabled={true} defaultValue={accountData.account.users} onChange={({target: {value}}) => setNewAccountData({...newAccountData, users: value})} />
              </div>
            </div>

            <div className="__right">
              <div className="field">
                <span>Phone Numbers:</span>
                <input type="text" disabled={true} defaultValue={accountData.account.phone_numbers} onChange={({target: {value}}) => setNewAccountData({...newAccountData, phone_numbers: value})} />
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
                  <input disabled={!editing} type={inputTypes.twilio_account_sid} readOnly={inputTypes.twilio_account_sid !== 'text'} defaultValue={newAccountData.twilio_account_sid} onChange={({target: {value}}) => setNewAccountData({...newAccountData, twilio_account_sid: value})} />
                  <button className="_zeroed _iconed" onClick={() => setInputTypes({...inputTypes, twilio_account_sid: inputTypes.twilio_account_sid === 'text' ? 'password' : 'text'})}>
                    <Icon icon="eye-4"/>
                  </button>
                </div>
              </div>

              <div className="field">
                <span>Call Token:</span>
                <div className="form-field _iconed">
                  <input disabled={!editing} type={inputTypes.twilio_call_token} readOnly={inputTypes.twilio_call_token !== 'text'} defaultValue={newAccountData.twilio_call_token} onChange={({target: {value}}) => setNewAccountData({...newAccountData, twilio_call_token: value})} />
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
                  <input disabled={!editing} type={inputTypes.twilio_token} readOnly={inputTypes.twilio_token !== 'text'} defaultValue={newAccountData.twilio_token} onChange={({target: {value}}) => setNewAccountData({...newAccountData, twilio_token: value})} />
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
                <Select disabled={!editing} options={editions.permissions.map((permission) => ({
                  span: permission,
                  value: permission
                }))} selectedOption={newAccountData.permission as string} onChange={(value: string) => setNewAccountData({...newAccountData, permission: value})}/>
              </div>

              <div className="field">
                <span>Slack Url:</span>
                <input type="text" disabled={!editing} defaultValue={accountData.account.slack_url} onChange={({target: {value}}) => setNewAccountData({...newAccountData, slack_url: value})} />
              </div>
            </div>

            <div className="__right">

              <div className="field">
                <span>Time Zone:</span>
                <Select disabled={!editing} options={editions.time_zone.map((time_zone) => ({
                  span: time_zone,
                  value: time_zone
                }))} selectedOption={newAccountData.time_zone as string} onChange={(value: string) => setNewAccountData({...newAccountData, time_zone: value})}/>
              </div>

              <div className="field">
                <span>Slack:</span>
                <Switcher disabled={!editing} checked={newAccountData.slack_active} onChange={(value) => setNewAccountData({...newAccountData, slack_active: value})} />
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
                <input type="text" disabled={!editing} defaultValue={accountData.account.mailing_street} onChange={({target: {value}}) => setNewAccountData({...newAccountData, mailing_street: value})} />
              </div>

              <div className="field">
                <span>Unit/Apt:</span>
                <input type="text" disabled={!editing} defaultValue={accountData.account.mailing_unit} onChange={({target: {value}}) => setNewAccountData({...newAccountData, mailing_unit: value})} />
              </div>

              <div className="field">
                <span>City:</span>
                <input type="text" disabled={!editing} defaultValue={accountData.account.mailing_city} onChange={({target: {value}}) => setNewAccountData({...newAccountData, mailing_city: value})} />
              </div>
            </div>

            <div className="__right">
              <div className="field">
                <span>State:</span>
                <Select disabled={!editing} options={editions.state.map((option) => ({
                  span: option,
                  value: option
                }))} selectedOption={newAccountData.mailing_state as string} onChange={(value: string) => setNewAccountData({...newAccountData, mailing_state: value})}/>
              </div>

              <div className="field">
                <span>Zip:</span>
                <input type="text" disabled={!editing} defaultValue={accountData.account.mailing_zip} onChange={({target: {value}}) => setNewAccountData({...newAccountData, mailing_zip: value})} />
              </div>
            </div>
          </div>
        </div>

        <div className="fieldset">
          
          <div className="flex-container sb wrap">
            <div className="legend">Billing Address</div>

            {editing ? (
              <div className="legend-action-wrapper">
                <label>Same as Mailing Address:</label>

                <div className="input-wrapper">
                  <Checkbox contents='' value={newAccountData.same_address} onChange={(value) => setNewAccountData({...newAccountData, same_address: value})} />
                </div>
              </div>
            ) : null}
          </div>

          {!editing || !newAccountData.same_address ? (
            <div className="fields">

              <div className="__left">
                <div className="field">
                  <span>Street:</span>
                  <input type="text" disabled={!editing} defaultValue={accountData.account.billing_street} onChange={({target: {value}}) => setNewAccountData({...newAccountData, billing_street: value})} />
                </div>

                <div className="field">
                  <span>Unit/Apt:</span>
                  <input type="text" disabled={!editing} defaultValue={accountData.account.billing_unit} onChange={({target: {value}}) => setNewAccountData({...newAccountData, billing_unit: value})} />
                </div>

                <div className="field">
                  <span>City:</span>
                  <input type="text" disabled={!editing} defaultValue={accountData.account.billing_city} onChange={({target: {value}}) => setNewAccountData({...newAccountData, billing_city: value})} />
                </div>
              </div>

              <div className="__right">
                <div className="field">
                  <span>State:</span>
                  <Select disabled={!editing} options={editions.state.map((option) => ({
                    span: option,
                    value: option
                  }))} selectedOption={newAccountData.billing_state as string} onChange={(value: string) => setNewAccountData({...newAccountData, billing_state: value})}/>
                </div>

                <div className="field">
                  <span>Zip:</span>
                  <input type="text" disabled={!editing} defaultValue={accountData.account.billing_zip} onChange={({target: {value}}) => setNewAccountData({...newAccountData, billing_zip: value})} />
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="fieldset">
          
          <div className="legend">Info</div>

          <div className="fields">

            <div className="__left">
              <div className="field">
                <span>Date Created:</span>
                <input type="text" defaultValue={newAccountData.created_at} disabled={ true } />
              </div>

              <div className="field">
                <span>Created by:</span>
                <input type="text" defaultValue={newAccountData.created_by} disabled={ true } />
              </div>
            </div>

            
            <div className="__right">

              <div className="field">
                <span>Last Edited:</span>
                <input type="text" defaultValue={newAccountData.last_edited_at} disabled={ true } />
              </div>

              <div className="field">
                <span>Last Edited By:</span>
                <input type="text" defaultValue={newAccountData.last_edited_by} disabled={ true } />
              </div>
            </div>
          </div>
        </div>

        {editing ? (
          <div className="wrapper flex-container sb editing-buttons">
            <div>
              <button className="_red" onClick={() => setDeleting(true)}>Delete Account</button>
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

        {/* Item delete popup */}
        {deleting ? (
          <div className="item-delete-popup" onClick={() => setDeleting(false)}>

            <div className="wrapper" onClick={(e) => e.stopPropagation()}>
            
              <div className="title">
                Delete Account
              </div>

              <div className="checkbox-wrapper">
                <Checkbox contents="I understand that after deleting the account it will not be possible to recover." value={readyToDelete} onChange={(value) => setReadyToDelete(value)} />
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
export default AccountsPage_Item
