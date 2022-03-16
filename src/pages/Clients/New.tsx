import axios from "axios"
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import Icon from "../../components/Icon"
import { nError } from "../../funcs"
import Client from "../../models/Client"
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

const ClientsPage_New = connect(mapStateToProps, mapDispatchToProps)(function(props: Props) {

  const $router = useRoute()

  const [readyToSave, setReadyToSave] = useState(false)
  
  const [newClientData, setNewClientData] = useState<Partial<Client>>({
    firstname: '',
    lastname: '',
    company_name: '',
    source: ''
  })

  const [clientDataEdit, setNewClientDataEdit] = useState<{
    source: string[],
  } | null>(null)
  
  // Load info function
  async function loadInfo() {
    try {
      const { data: clientData } = (await axios.get('/json/client.json'))

      setNewClientDataEdit(clientData.edit)

      setTimeout(() => setReadyToSave(false), 100)
    }
    catch (error) {
      nError(error)
    }
  }

  // Load client data
  useEffect(() => {
    loadInfo()
  }, [])

  useEffect(() => setReadyToSave(true), [
    newClientData
  ])
  
  // Render function
  return (<>
    {clientDataEdit ? (
      <div className="ClientsPage_Item ClientPage_New entity-edit">

        <div className="wrapper flex-container sb">
          <h1>New Client</h1>
        </div>
        
        <div className="fieldset">
          
          <div className="legend">Main</div>

          <div className="fields">

            <div className="__left">
              <div className="field">
                <span>First Name:</span>
                <input type="text" defaultValue={newClientData.firstname} onChange={({target: {value}}) => setNewClientData({...newClientData, firstname: value})} />
              </div>

              <div className="field">
                <span>Last Name:</span>
                <input type="text" defaultValue={newClientData.lastname} onChange={({target: {value}}) => setNewClientData({...newClientData, lastname: value})} />
              </div>
            </div>

            <div className="__right">
              <div className="field">
                <span>Company:</span>
                <input type="text" defaultValue={newClientData.company_name} onChange={({target: {value}}) => setNewClientData({...newClientData, company_name: value})} />
              </div>

              <div className="field">
                <span>Source:</span>
                <Select options={clientDataEdit.source.map((option) => ({
                  span: option,
                  value: option
                }))} selectedOption={newClientData.source as string} onChange={(value) => setNewClientData({...newClientData, source: value as string})}/>
              </div>
            </div>
          </div>
        </div>

        <div className="wrapper flex-container sb editing-buttons">
          <div></div>
          <div className="buttons">
            <button className="_bordered _red" onClick={() => $router.router.navigate('clients', {}, {reload: true})}>
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
export default ClientsPage_New
