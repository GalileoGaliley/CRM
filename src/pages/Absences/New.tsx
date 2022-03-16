import axios from "axios"
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import Icon from "../../components/Icon"
import { nError } from "../../funcs"
import Absence from "../../models/Absence"
import { StoreDispatch, StoreState, mapDispatchToProps, mapStateToProps } from "../../store";

import "../../styles/pages/common/entity-edit.sass"
import moment from "moment"
import Select from "../../components/Select"
import Checkbox from "../../components/Checkbox"
import { useRoute } from "react-router5"
import { DateTime } from "luxon"

import DateTimeComponent from "react-datetime"

interface Props {
  store: StoreState,
  dispatcher: StoreDispatch
}

const AbsencesPage_New = connect(mapStateToProps, mapDispatchToProps)(function(props: Props) {

  const $router = useRoute()

  const [readyToSave, setReadyToSave] = useState(false)
  
  const [newAbsenceData, setNewAbsenceData] = useState<Partial<Absence>>({
    service_resource: '',
    area: '',
    absence_start: DateTime.now().plus({hours: 1}).set({minute: 0}).toJSDate(),
    absence_end: DateTime.now().plus({hours: 1}).set({minute: 0}).toJSDate()
  })

  const [absenceDataEdit, setNewAbsenceDataEdit] = useState<{
    service_resource: string,
    area: string
  }[] | null>(null)
  
  // Load info function
  async function loadInfo() {
    try {
      const { data: absenceData } = (await axios.get('/json/absences.json'))

      setNewAbsenceDataEdit(absenceData.edit)

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

    if(!absenceDataEdit) return
    
    setNewAbsenceData({
      ...newAbsenceData,
      area: absenceDataEdit.find((item) => item.service_resource === sr)?.area as string
    })

  }, [newAbsenceData.service_resource])
  
  // Render function
  return (<>
    {absenceDataEdit ? (
      <div className="AbsencesPage_Item AbsencePage_New entity-edit">

        <div className="wrapper flex-container sb">
          <h1>Absence</h1>
        </div>
        
        <div className="fieldset">
          
          <div className="legend">Main</div>

          <div className="fields">

            <div className="__left">
              <div className="field" style={{zIndex: 6}}>
                <span>Service resource:</span>
                <Select options={absenceDataEdit.map((option) => ({
                  span: option.service_resource,
                  value: option.service_resource
                }))} selectedOption={newAbsenceData.service_resource as string} onChange={(value) => setNewAbsenceData({...newAbsenceData, service_resource: value as string})}/>
              </div>

              <div className="field">
                <span>Area:</span>
                <Select disabled={true} options={absenceDataEdit.map((option) => ({
                  span: option.area,
                  value: option.area
                }))} selectedOption={newAbsenceData.area as string} onChange={(value) => 2}/>
              </div>
            </div>

            
            <div className="__right">

              <div className="field">
                <span>Absence start:</span>
                <DateTimeComponent value={newAbsenceData.absence_start as Date} onChange={(value) => setNewAbsenceData({...newAbsenceData, absence_start: moment.isMoment(value) ? value.toDate() : newAbsenceData.absence_start})} />
              </div>

              <div className="field">
                <span>Absence end:</span>
                <DateTimeComponent value={newAbsenceData.absence_end as Date} onChange={(value) => setNewAbsenceData({...newAbsenceData, absence_end: moment.isMoment(value) ? value.toDate() : newAbsenceData.absence_end})} />
              </div>
            </div>
          </div>
        </div>

        <div className="wrapper flex-container sb editing-buttons">
          <div></div>
          <div className="buttons">
            <button className="_bordered _red" onClick={() => $router.router.navigate('absences', {}, {reload: true})}>
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
export default AbsencesPage_New
