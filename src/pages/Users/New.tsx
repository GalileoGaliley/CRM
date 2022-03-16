import axios from "axios"
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import Icon from "../../components/Icon"
import { nError } from "../../funcs"
import User from "../../models/User"
import { StoreDispatch, StoreState, mapDispatchToProps, mapStateToProps } from "../../store";
import Datetime from 'react-datetime'

import "../../styles/pages/common/entity-edit.sass"
import moment from "moment"
import Select from "../../components/Select"
import Checkbox from "../../components/Checkbox"
import { useRoute } from "react-router5"
import Switcher from "../../components/Switcher"
import ReactCrop, { Crop } from "react-image-crop"
import UserCustom from "../../models/UserCustom"

interface Props {
  store: StoreState,
  dispatcher: StoreDispatch
}

const UsersPage_New = connect(mapStateToProps, mapDispatchToProps)(function(props: Props) {

  const [readyToSave, setReadyToSave] = useState(false)

  const $router = useRoute()

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
      const { data: usersData } = (await axios.get('/json/users.json'))

      setEditions(usersData.edit)
      setNewUserData({
        firstname: '',
        lastname: '',
        function: '',
        phone: '',
        street: '',
        unit: '',
        city: '',
        zip: '',
        time_zone: usersData.edit.time_zone[0],
        permission: usersData.edit.permissions[0],
        State: usersData.edit.state[0],
        active_status: ''
      })

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
    {editions && newUserData.time_zone ? (
      <div className="UsersPage_New entity-edit">

        <div className="wrapper flex-container sb">
          <h1>New user</h1>
        </div>
        
        <div className="fieldset">
          
          <div className="legend">Main</div>

          <div className="fields">

            <div className="__left">
              <div className="field">
                <span>First Name:</span>
                <input type="text" onChange={({target: {value}}) => setNewUserData({...newUserData, firstname: value})} />
              </div>

              <div className="field">
                <span>Last Name:</span>
                <input type="text" onChange={({target: {value}}) => setNewUserData({...newUserData, lastname: value})} />
              </div>
            </div>

            <div className="__right">
              <div className="field">
                <span>Active:</span>
                <Switcher checked={newUserData.active_status === 'Active'} onChange={(value) => setNewUserData({...newUserData, active_status: value ? 'Active' : 'Inactive'})} />
              </div>

              <div className="field">
                <span>Email:</span>
                <input type="text" onChange={({target: {value}}) => setNewUserData({...newUserData, email: value})} />
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
          
          <div className="legend">Settings</div>

          <div className="fields">

            <div className="__left">
              <div className="field">
                <span>Function:</span>
                <input type="text" onChange={({target: {value}}) => setNewUserData({...newUserData, function: value})} />
              </div>

              <div className="field">
                <span>Phone:</span>
                <input type="text" onChange={({target: {value}}) => setNewUserData({...newUserData, phone: value})} />
              </div>
            </div>

            <div className="__right">
              <div className="field" style={{zIndex: 7}}>
                <span>Time Zone:</span>
                <Select options={editions.time_zone.map((option) => ({
                  span: option,
                  value: option
                }))} selectedOption={newUserData.time_zone} onChange={(value: string) => setNewUserData({...newUserData, time_zone: value})}/>
              </div>

              <div className="field">
                <span>Permission:</span>
                <Select options={editions.permissions.map((option) => ({
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
                <input type="text" onChange={({target: {value}}) => setNewUserData({...newUserData, street: value})} />
              </div>

              <div className="field">
                <span>Unit/Apt:</span>
                <input type="text" onChange={({target: {value}}) => setNewUserData({...newUserData, unit: value})} />
              </div>

              <div className="field">
                <span>City:</span>
                <input type="text" onChange={({target: {value}}) => setNewUserData({...newUserData, city: value})} />
              </div>
            </div>

            <div className="__right">
              <div className="field">
                <span>State:</span>
                <Select options={editions.state.map((option) => ({
                  span: option,
                  value: option
                }))} selectedOption={newUserData.State as string} onChange={(value: string) => setNewUserData({...newUserData, State: value})}/>
              </div>

              <div className="field">
                <span>Zip:</span>
                <input type="text" onChange={({target: {value}}) => setNewUserData({...newUserData, zip: value})} />
              </div>
            </div>
          </div>
        </div>

        <div className="wrapper flex-container sb editing-buttons">
          <div />
          <div className="buttons">
            <button className="_bordered _red" onClick={() => $router.router.navigate('users', {}, {
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
      </div>
    ) : null}
  </>)
})
export default UsersPage_New
