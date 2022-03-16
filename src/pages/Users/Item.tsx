import axios from "axios"
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import Icon from "../../components/Icon"
import {httpClient, nError} from "../../funcs"
import User from "../../models/User"
import { StoreDispatch, StoreState, mapDispatchToProps, mapStateToProps } from "../../store";
import Datetime from 'react-datetime'

import "../../styles/pages/common/entity-edit.sass"
import moment from "moment"
import Select from "../../components/Select"
import Checkbox from "../../components/Checkbox"
import { useRoute } from "react-router5"
import UserCustom from "../../models/UserCustom"
import ReactCrop, { Crop } from "react-image-crop"
import Switcher from "../../components/Switcher"

interface Props {
  store: StoreState,
  dispatcher: StoreDispatch
}

interface UserData {
	permissions: {
		edit_user: boolean,
	},
	user: UserCustom,
	edit: {
		time_zone: string[],
		permissions: string[],
		state: string[],
	}
}

const UsersPage_Item = connect(mapStateToProps, mapDispatchToProps)(function(props: Props) {

  const [readyToSave, setReadyToSave] = useState(false)

  const $router = useRoute()

  const [editing, setEditing] = useState(false)

  const [deleting, setDeleting] = useState(false)
  const [readyToDelete, setReadyToDelete] = useState(false)
  
  const [userData, setUserData] = useState<UserData | null>(null)

  const [avatarPopup, setAvatarPopup] = useState(false)
  const [avatarImageSrc, setAvatarImageSrc] = useState('')
  const [avatarCrop, setAvatarCrop] = useState<Partial<Crop>>({
    unit: '%',
    width: 30,
    aspect: 1
  })

  const [editions, setEditions] = useState<{
    time_zone: string[],
    permissions: string[],
    state: string[]
  } | null>(null)

  const [newUserData, setNewUserData] = useState<Partial<UserCustom>>({
    
  })

  // Load info function
  async function loadInfo() {
    try {
      const { data: userData } = (await httpClient.get('/users/' + props.store.user?.user_id)) as {data: UserData}

      setUserData(userData)
      setEditions(userData.edit)
      setNewUserData(userData.user)

      setTimeout(() => setReadyToSave(false), 100)
    }
    catch (error) {
      nError(error)
    }
  }

  // Load user data
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
    newUserData
  ])
  
  // Render function
  return (<>
    {userData && editions && newUserData.time_zone ? (
      <div className="UsersPage_Item entity-edit">

        <div className="wrapper flex-container sb">
          <div className="flex-container _gap-narrow">
            <h1>User:</h1>
            <div className="item-name">
              {userData.user.firstname} {userData.user.lastname}
            </div>
          </div>

          {userData?.permissions.edit_user && !editing ? (
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
                <span>First Name:</span>
                <input type="text" disabled={!editing} defaultValue={userData.user.firstname} onChange={({target: {value}}) => setNewUserData({...newUserData, firstname: value})} />
              </div>

              <div className="field">
                <span>Last Name:</span>
                <input type="text" disabled={!editing} defaultValue={userData.user.lastname} onChange={({target: {value}}) => setNewUserData({...newUserData, lastname: value})} />
              </div>
            </div>

            <div className="__right">
              <div className="field">
                <span>Active:</span>
                <Switcher disabled={!editing} checked={newUserData.active_status === 'Active'} onChange={(value) => setNewUserData({...newUserData, active_status: value ? 'Active' : 'Inactive'})} />
              </div>

              <div className="field">
                <span>Email:</span>
                <input type="text" defaultValue={userData.user.email} disabled={true} />
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
          
          <div className="legend">Settings</div>

          <div className="fields">

            <div className="__left">
              <div className="field">
                <span>Function:</span>
                <input type="text" disabled={!editing} defaultValue={userData.user.function} onChange={({target: {value}}) => setNewUserData({...newUserData, function: value})} />
              </div>

              <div className="field">
                <span>Phone:</span>
                <input type="text" disabled={!editing} defaultValue={userData.user.phone} onChange={({target: {value}}) => setNewUserData({...newUserData, phone: value})} />
              </div>
            </div>

            <div className="__right">
              <div className="field" style={{zIndex: 7}}>
                <span>Time Zone:</span>
                <Select disabled={!editing} options={editions.time_zone.map((option) => ({
                  span: option,
                  value: option
                }))} selectedOption={newUserData.time_zone} onChange={(value: string) => setNewUserData({...newUserData, time_zone: value})}/>
              </div>

              <div className="field">
                <span>Permission:</span>
                <Select disabled={!editing} options={editions.permissions.map((option) => ({
                  span: option,
                  value: option
                }))} selectedOption={newUserData.permission as string} onChange={(value: string) => setNewUserData({...newUserData, permission: value})}/>
              </div>
            </div>
          </div>
        </div>

        <div className="fieldset">
          
          <div className="legend">Address</div>

          <div className="fields">

            <div className="__left">
              <div className="field">
                <span>Street:</span>
                <input type="text" disabled={!editing} defaultValue={userData.user.street} onChange={({target: {value}}) => setNewUserData({...newUserData, street: value})} />
              </div>

              <div className="field">
                <span>Unit/Apt:</span>
                <input type="text" disabled={!editing} defaultValue={userData.user.unit} onChange={({target: {value}}) => setNewUserData({...newUserData, unit: value})} />
              </div>

              <div className="field">
                <span>City:</span>
                <input type="text" disabled={!editing} defaultValue={userData.user.city} onChange={({target: {value}}) => setNewUserData({...newUserData, city: value})} />
              </div>
            </div>

            <div className="__right">
              <div className="field">
                <span>State:</span>
                <Select disabled={!editing} options={editions.state.map((option) => ({
                  span: option,
                  value: option
                }))} selectedOption={newUserData.State as string} onChange={(value: string) => setNewUserData({...newUserData, State: value})}/>
              </div>

              <div className="field">
                <span>Zip:</span>
                <input type="text" disabled={!editing} defaultValue={userData.user.zip} onChange={({target: {value}}) => setNewUserData({...newUserData, zip: value})} />
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
                <input type="text" defaultValue={''} disabled={ true } />
              </div>

              <div className="field">
                <span>Created by:</span>
                <input type="text" defaultValue={''} disabled={ true } />
              </div>
            </div>

            
            <div className="__right">

              <div className="field">
                <span>Last Edited:</span>
                <input type="text" defaultValue={''} disabled={ true } />
              </div>

              <div className="field">
                <span>Last Edited By:</span>
                <input type="text" defaultValue={''} disabled={ true } />
              </div>
            </div>
          </div>
        </div>

        {editing ? (
          <div className="wrapper flex-container sb editing-buttons">
            <div>
              <button className="_red" onClick={() => setDeleting(true)}>Delete User</button>
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
                  <Icon icon="user-33" />
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

        {/* Item share popup */}
        {deleting ? (
          <div className="item-delete-popup" onClick={() => setDeleting(false)}>

            <div className="wrapper" onClick={(e) => e.stopPropagation()}>
            
              <div className="title">
                Delete User
              </div>

              <div className="checkbox-wrapper">
                <Checkbox contents="I understand that after deleting the absence it will not be possible to recover." value={readyToDelete} onChange={(value) => setReadyToDelete(value)} />
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
export default UsersPage_Item
