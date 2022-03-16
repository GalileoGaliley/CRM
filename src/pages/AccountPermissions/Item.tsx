import axios from "axios"
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import Icon from "../../components/Icon"
import { nError } from "../../funcs"
import AccountPermission from "../../models/AccountPermission"
import { StoreDispatch, StoreState, mapDispatchToProps, mapStateToProps } from "../../store";
import Datetime from 'react-datetime'

import "../../styles/pages/common/entity-edit.sass"
import moment from "moment"
import Select from "../../components/Select"
import Checkbox from "../../components/Checkbox"
import { useRoute } from "react-router5"
import PermissionAccount from "../../models/PermissionAccount"
import classNames from "classnames"

interface Props {
  store: StoreState,
  dispatcher: StoreDispatch
}

interface AccountPermissionData {

	permissions: {
		edit_account_permission: boolean,
		show_account: boolean
  },
  
  permission: AccountPermission,
  
  accounts: PermissionAccount[],
  
	edit: {
		actions: string[]
	}
}

const AccountPermissionsPage_Item = connect(mapStateToProps, mapDispatchToProps)(function(props: Props) {

  const [readyToSave, setReadyToSave] = useState(false)

  const $router = useRoute()

  const [deleting, setDeleting] = useState(false)
  const [readyToDelete, setReadyToDelete] = useState(false)
  
  const [permissionData, setAccountPermissionData] = useState<AccountPermissionData | null>(null)

  const [selectedAction, setSelectedAction] = useState<string>('')

  const [newAccountPermissionData, setNewAccountPermissionData] = useState<Partial<AccountPermission>>({
    name: '',
    accounts: '',
    actions: [] as string[]
  })

  const [availableActions, setAvailableActions] = useState<string[]>([])

  // Load info function
  async function loadInfo() {
    try {
      const { data: permissionData } = (await axios.get('/json/account_permission.json')) as {data: AccountPermissionData}

      let _availableActions = [''].concat(permissionData.edit.actions.filter((action) => !permissionData.permission.actions.includes(action)))

      setAccountPermissionData(permissionData)
      setAvailableActions(_availableActions)
      setSelectedAction(_availableActions[0])
      setNewAccountPermissionData({
        ...newAccountPermissionData,
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

    if(!newAccountPermissionData.actions || !permissionData || !newAccountPermissionData) return

    setNewAccountPermissionData({
      ...newAccountPermissionData,
      actions: [
        ...newAccountPermissionData.actions,
        selectedAction
      ]
    })

    let _availableActions = [...permissionData?.edit.actions]

    _availableActions = permissionData.edit.actions.filter((action) => !(newAccountPermissionData.actions as string[]).includes(action))
    _availableActions.splice(_availableActions.findIndex((_action) => selectedAction === _action), 1)

    setAvailableActions([
      ..._availableActions
    ])

    setSelectedAction('')

    setReadyToSave(true)
  }

  // Remove action function
  function removeAction(i: number) {

    let _permissionActions = [...(newAccountPermissionData.actions as string[])]

    let _action = _permissionActions[i]
    
    _permissionActions.splice(i, 1)

    setNewAccountPermissionData({
      ...newAccountPermissionData,
      actions: _permissionActions
    })

    setAvailableActions([
      ...availableActions,
      _action
    ])

    setReadyToSave(true)
  }

  useEffect(() => setReadyToSave(true), [
    newAccountPermissionData
  ])
  
  // Render function
  return (<>
    {permissionData && newAccountPermissionData ? (
      <div className="AccountPermissionsPage_Item entity-edit">

        <div className="wrapper flex-container sb">
          <div className="flex-container _gap-narrow">
            <h1>Account`s Permission:</h1>
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
                <input type="text" defaultValue={permissionData.permission.name} onChange={({target: {value}}) => setNewAccountPermissionData({...newAccountPermissionData, name: value})} />
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
            {(newAccountPermissionData.actions as string[]).map((action, i) => (
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
                <input type="text" defaultValue={newAccountPermissionData.created_at} disabled={ true } />
              </div>

              <div className="field">
                <span>Created by:</span>
                <input type="text" defaultValue={newAccountPermissionData.created_by} disabled={ true } />
              </div>
            </div>

            
            <div className="__right">

              <div className="field">
                <span>Last Edited:</span>
                <input type="text" defaultValue={newAccountPermissionData.last_edited_at} disabled={ true } />
              </div>

              <div className="field">
                <span>Last Edited By:</span>
                <input type="text" defaultValue={newAccountPermissionData.last_edited_by} disabled={ true } />
              </div>
            </div>
          </div>
        </div>

        <div className="fieldset">

          <div className="legend">Accounts</div>

          <table className="table">
            <tr>
              <th>Name</th>
              <th>Owner</th>
              <th>Status</th>
            </tr>
            {permissionData.accounts.map((account, i) => (
              <tr key={i}>
                <td>{account.Name}</td>
                <td>{account.owner}</td>
                <td className={classNames({
                  'red-text': account.status === 'Inactive',
                  'green-text': account.status === 'Active',
                  'blue-text': !['Inactive', 'Active'].includes(account.status)
                })}>{account.status}</td>
              </tr>
            ))}
          </table>
        </div>

        <div className="wrapper flex-container sb editing-buttons">
          <div>
            <button className="_red" onClick={() => setDeleting(true)}>Delete Account`s Permission</button>
          </div>
          <div className="buttons">
            <button className="_bordered _red" onClick={() => $router.router.navigate('accounts_permissions', {}, {
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
                Delete Account`s Permission
              </div>

              <div className="checkbox-wrapper">
                <Checkbox contents="I understand that after deleting the account`s permission it will not be possible to recover." value={readyToDelete} onChange={(value) => setReadyToDelete(value)} />
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
export default AccountPermissionsPage_Item
