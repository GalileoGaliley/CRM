import axios from "axios"
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import Icon from "../../components/Icon"
import { nError } from "../../funcs"
import Permission from "../../models/Permission"
import { StoreDispatch, StoreState, mapDispatchToProps, mapStateToProps } from "../../store";
import Datetime from 'react-datetime'

import "../../styles/pages/common/entity-edit.sass"
import moment from "moment"
import Select from "../../components/Select"
import Checkbox from "../../components/Checkbox"
import { useRoute } from "react-router5"
import PermissionUser from "../../models/PermissionUser"
import classNames from "classnames"

interface Props {
  store: StoreState,
  dispatcher: StoreDispatch
}

interface PermissionData {
	permissions: {
		edit_permission: boolean,
		show_user: boolean
	},
	permission: Permission,
	users: PermissionUser[],
	edit: {
		actions: string[]
	}
}

const PermissionsPage_Item = connect(mapStateToProps, mapDispatchToProps)(function(props: Props) {

  const [readyToSave, setReadyToSave] = useState(false)

  const $router = useRoute()

  const [deleting, setDeleting] = useState(false)
  const [readyToDelete, setReadyToDelete] = useState(false)
  
  const [permissionData, setPermissionData] = useState<PermissionData | null>(null)

  const [selectedAction, setSelectedAction] = useState<string>('')

  const [newPermissionData, setNewPermissionData] = useState<Partial<Permission>>({
    name: '',
    users: '',
    actions: [] as string[]
  })

  const [availableActions, setAvailableActions] = useState<string[]>([])

  // Load info function
  async function loadInfo() {
    try {
      const { data: permissionData } = (await axios.get('/json/permission.json')) as {data: PermissionData}

      let _availableActions = [''].concat(permissionData.edit.actions.filter((action) => !permissionData.permission.actions.includes(action)))

      setPermissionData(permissionData)
      setAvailableActions(_availableActions)
      setSelectedAction(_availableActions[0])
      setNewPermissionData({
        ...newPermissionData,
        actions: permissionData.permission.actions
      })

      setTimeout(() => setReadyToSave(false), 100)
    }
    catch (error) {
      nError(error)
    }
  }

  // Load permission data
  useEffect(() => {
    loadInfo()
  }, [])

  // Add action function
  function addAction() {

    if(!newPermissionData.actions || !permissionData || !newPermissionData) return

    setNewPermissionData({
      ...newPermissionData,
      actions: [
        ...newPermissionData.actions,
        selectedAction
      ]
    })

    let _availableActions = [...permissionData?.edit.actions]

    _availableActions = permissionData.edit.actions.filter((action) => !(newPermissionData.actions as string[]).includes(action))
    _availableActions.splice(_availableActions.findIndex((_action) => selectedAction === _action), 1)

    setAvailableActions([
      ..._availableActions
    ])

    setSelectedAction('')

    setReadyToSave(true)
  }

  // Remove action function
  function removeAction(i: number) {

    let _permissionActions = [...(newPermissionData.actions as string[])]

    let _action = _permissionActions[i]
    
    _permissionActions.splice(i, 1)

    setNewPermissionData({
      ...newPermissionData,
      actions: _permissionActions
    })

    setAvailableActions([
      ...availableActions,
      _action
    ])

    setReadyToSave(true)
  }

  useEffect(() => setReadyToSave(true), [
    newPermissionData
  ])
  
  // Render function
  return (<>
    {permissionData && newPermissionData ? (
      <div className="PermissionsPage_Item entity-edit">

        <div className="wrapper flex-container sb">
          <div className="flex-container _gap-narrow">
            <h1>Permission:</h1>
            <div className="item-name">
              {permissionData.permission.name}
            </div>
          </div>
        </div>
        
        <div className="fieldset">
          
          <div className="legend">Main</div>

          <div className="fields">

            <div className="__left">
              <div className="field">
                <span>Name:</span>
                <input type="text" defaultValue={permissionData.permission.name} onChange={({target: {value}}) => setNewPermissionData({...newPermissionData, name: value})} />
              </div>
            </div>
          </div>
        </div>

        <div className="fieldset">

          <div className="flex-container sb wrap">
            <div className="legend">Actions</div>

            <div className="legend-action-wrapper">
              <label>Action:</label>
              <div className="input-wrapper">
                <Select options={availableActions.map((action) => ({
                  span: action,
                  value: action
                }))} selectedOption={selectedAction} onChange={(value) => setSelectedAction(value as string)}/>
                <button disabled={!selectedAction} className="_green" onClick={() => addAction()}>
                  Add
                </button>
              </div>
            </div>
          </div>

          <table className="table som">
            <tr>
              <th style={{width: '100%'}}>Action</th>
              <th>Allow</th>
              <th></th>
            </tr>
            {(newPermissionData.actions as string[]).map((action, i) => (
              <tr key={i}>
                <td>{action}</td>
                <td>
                  <Checkbox contents={''} value={true} />
                </td>
                <td>
                  <button className="_zeroed _iconed _red" onClick={() => removeAction(i)}>
                    <Icon icon="x-mark-1" />
                  </button>
                </td>
              </tr>
            ))}
          </table>
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

        <div className="fieldset">

          <div className="legend">Users</div>

          <table className="table">
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Function</th>
              <th>Active</th>
            </tr>
            {permissionData.users.map((user, i) => (
              <tr key={i}>
                <td>{user.firstname}</td>
                <td>{user.lastname}</td>
                <td>{user.function}</td>
                <td className={classNames({
                  'red-text': user.active === 'Inactive',
                  'green-text': user.active === 'Active',
                  'blue-text': !['Inactive', 'Active'].includes(user.active)
                })}>{user.active}</td>
              </tr>
            ))}
          </table>
        </div>

        <div className="wrapper flex-container sb editing-buttons">
          <div>
            <button className="_red" onClick={() => setDeleting(true)}>Delete Permission</button>
          </div>
          <div className="buttons">
            <button className="_bordered _red" onClick={() => $router.router.navigate('permissions', {}, {
              reload: true
            })}>
              Cancel
            </button>
            <button disabled={!readyToSave} className="_bordered _green">
              Save
            </button>
          </div>
        </div>

        {/* Item delete popup */}
        {deleting ? (
          <div className="item-delete-popup" onClick={() => setDeleting(false)}>

            <div className="wrapper" onClick={(e) => e.stopPropagation()}>
            
              <div className="title">
                Delete Permission
              </div>

              <div className="checkbox-wrapper">
                <Checkbox contents="I understand that after deleting the permission it will not be possible to recover." value={readyToDelete} onChange={(value) => setReadyToDelete(value)} />
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
export default PermissionsPage_Item
