import axios from "axios"
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import Icon from "../../components/Icon"
import {httpClient, nError} from "../../funcs"
import Absence from "../../models/Absence"
import { StoreDispatch, StoreState, mapDispatchToProps, mapStateToProps } from "../../store";
import Datetime from 'react-datetime'

import "../../styles/pages/common/entity-edit.sass"
import moment from "moment"
import Select from "../../components/Select"
import Checkbox from "../../components/Checkbox"

interface Props {
  store: StoreState,
  dispatcher: StoreDispatch
}

interface AbsenceData {
  
  permissions: {
    
    edit_absence: boolean,
  },

  absence: Absence,

  edit: {
    service_resource: string,
    area: string
  }[]
}

const AbsencesPage_Item = connect(mapStateToProps, mapDispatchToProps)(function(props: Props) {

  const [readyToSave, setReadyToSave] = useState(false)

  const [editing, setEditing] = useState(false)

  const [deleting, setDeleting] = useState(false)
  const [readyToDelete, setReadyToDelete] = useState(false)
  
  const [absenceData, setAbsenceData] = useState<AbsenceData | null>(null)

  const [newAbsenceData, setNewAbsenceData] = useState<Partial<Absence>>({
    
  })
  
  // Load info function
  async function loadInfo() {
    try {
      const { data: absenceData } = (await httpClient.get('/absences')) as {data: AbsenceData}

      setAbsenceData(absenceData)

      setNewAbsenceData({
        ...absenceData.absence,
        absence_start: new Date(absenceData.absence.absence_start),
        absence_end: new Date(absenceData.absence.absence_end),
      })

      setTimeout(() => setReadyToSave(false), 100)
    }
    catch (error) {
      nError(error)
    }
  }

  // Load absence data
  useEffect(() => {
    loadInfo()
  }, [])

  useEffect(() => setReadyToSave(true), [
    newAbsenceData
  ])

  // Handle service resource changing
  useEffect(() => {

    let sr = newAbsenceData.service_resource

    if (!absenceData) return
    
    setAbsenceData({
      ...absenceData,
      absence: {
        ...absenceData.absence,
        area: absenceData.edit.find((item) => item.service_resource === sr)?.area as string
      }
    })

  }, [newAbsenceData.service_resource])
  
  // Render function
  return (<>
    {absenceData && newAbsenceData.absence_start ? (
      <div className="AbsencesPage_Item entity-edit">

        <div className="wrapper flex-container sb">
          <h1>Absence</h1>

          {absenceData?.permissions.edit_absence && !editing ? (
            <button className="_wa _green" onClick={() => setEditing(true)}>
              Edit
            </button>
          ) : null}
        </div>
        
        <div className="fieldset">
          
          <div className="legend">Main</div>

          <div className="fields">

            <div className="__left">
              <div className="field" style={{zIndex: 6}}>
                <span>Service resource:</span>
                <Select disabled={!editing} options={absenceData.edit.map((option) => ({
                  span: option.service_resource,
                  value: option.service_resource
                }))} selectedOption={newAbsenceData.service_resource as string} onChange={(value) => setNewAbsenceData({...newAbsenceData, service_resource: value as string})}/>
              </div>

              <div className="field">
                <span>Area:</span>
                <Select disabled={true} options={absenceData.edit.map((option) => ({
                  span: option.area,
                  value: option.area
                }))} selectedOption={absenceData.absence.area} onChange={(value) => setAbsenceData({...absenceData, absence: {...absenceData.absence, area: value as string}})}/>
              </div>
            </div>

            
            <div className="__right">

              <div className="field">
                <span>Absence start:</span>
                <Datetime inputProps={{ disabled: !editing }} value={newAbsenceData.absence_start as Date} onChange={(value) => setNewAbsenceData({...newAbsenceData, absence_start: moment.isMoment(value) ? value.toDate() : (absenceData as AbsenceData).absence.absence_start})} />
              </div>

              <div className="field">
                <span>Absence end:</span>
                <Datetime inputProps={{ disabled: !editing }} value={newAbsenceData.absence_end as Date} onChange={(value) => setNewAbsenceData({...newAbsenceData, absence_end: moment.isMoment(value) ? value.toDate() : (absenceData as AbsenceData).absence.absence_end})} />
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
                <input type="text" defaultValue={absenceData?.absence.created_at} disabled={ true } />
              </div>

              <div className="field">
                <span>Created by:</span>
                <input type="text" defaultValue={absenceData?.absence.created_by} disabled={ true } />
              </div>
            </div>

            
            <div className="__right">

              <div className="field">
                <span>Last Edited:</span>
                <input type="text" defaultValue={absenceData?.absence.last_edited_at} disabled={ true } />
              </div>

              <div className="field">
                <span>Last Edited By:</span>
                <input type="text" defaultValue={absenceData?.absence.last_edited_by} disabled={ true } />
              </div>
            </div>
          </div>
        </div>

        {editing ? (
          <div className="wrapper flex-container sb editing-buttons">
            <div>
              <button className="_red" onClick={() => setDeleting(true)}>Delete Absence</button>
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

        {/* Item share popup */}
        {deleting ? (
          <div className="item-delete-popup" onClick={() => setDeleting(false)}>

            <div className="wrapper" onClick={(e) => e.stopPropagation()}>
            
              <div className="title">
                Delete Absence
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
export default AbsencesPage_Item
