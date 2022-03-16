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

interface Props {
  store: StoreState,
  dispatcher: StoreDispatch
}

const PermissionsPage_New = connect(mapStateToProps, mapDispatchToProps)(function(props: Props) {

  const [readyToSave, setReadyToSave] = useState(false)

  const $router = useRoute()

  const [actions, setActions] = useState<string[] | null>(null)
  const [availableActions, setAvailableActions] = useState<string[]>([])
  const [selectedAction, setSelectedAction] = useState<string>('')
  const [newPermissionData, setNewPermissionData] = useState<Partial<Permission>>({
    name: '',
    actions: [] as string[]
  })
  
  // Load info function
  async function loadInfo() {
    try {
      const { data: permissionsData } = (await axios.get('/json/permissions.json'))

      setActions(permissionsData.edit.actions)
      setAvailableActions([''].concat(permissionsData.edit.actions))
      setSelectedAction(availableActions[0])

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

    if(!newPermissionData.actions || !newPermissionData) return

    setNewPermissionData({
      ...newPermissionData,
      actions: [
        ...newPermissionData.actions,
        selectedAction
      ]
    })

    let _availableActions = [...availableActions]

    _availableActions = _availableActions.filter((action) => !(newPermissionData.actions as string[]).includes(action))
    _availableActions.splice(_availableActions.findIndex((_action) => selectedAction === _action), 1)

    setAvailableActions([
      ..._availableActions
    ])

    setSelectedAction(_availableActions[0])

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
    {availableActions ? (
      <div className="PermissionsPage_New entity-edit">

        <div className="wrapper flex-container sb">
          <h1>New permission</h1>
        </div>
        
        <div className="fieldset">
          
          <div className="legend">Main</div>

          <div className="fields">

            <div className="__left">
              <div className="field">
                <span>Name:</span>
                <input type="text" onChange={({target: {value}}) => setNewPermissionData({...newPermissionData, name: value})} />
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

        <div className="wrapper flex-container sb editing-buttons">
          <div />
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
      </div>
    ) : null}
  </>)
})
export default PermissionsPage_New
