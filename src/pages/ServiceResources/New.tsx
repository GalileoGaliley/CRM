import axios from "axios"
import { useEffect, useState } from "react";
import { connect } from "react-redux";
import { nError } from "../../funcs/base"
import { StoreDispatch, StoreState, mapDispatchToProps, mapStateToProps } from "../../store";

import Select from "../../components/Select"
import { useRoute } from "react-router5"
import Switcher from "../../components/Switcher"

import "../../styles/pages/common/entity-edit.sass"
import Checkbox from "../../components/Checkbox"
import ReactInputMask from "react-input-mask"
import ServiceResource from "../../models/ServiceResource"

interface Props {
  store: StoreState,
  dispatcher: StoreDispatch
}

const ServiceResourcesPage_New = connect(mapStateToProps, mapDispatchToProps)(function(props: Props) {

  const [readyToSave, setReadyToSave] = useState(false)

  const $router = useRoute()

  const [edit, setEdit] = useState<{

    users: {
      user_id: string,
      user: string
    }[],
    time_zone: string[],
    area: string[]
  } | null>(null)

  const [newServiceResourceData, setNewServiceResourceData] = useState<Partial<ServiceResource> | null>(null)
  
  // Load info function
  async function loadInfo() {
    try {
      const { data: serviceResourcesData } = (await axios.get('/json/service_resources.json'))

      setEdit(serviceResourcesData.edit)

      setNewServiceResourceData({
        ...newServiceResourceData,

        nickname: '',
        active: true,

        user: '',
        time_zone: '',
        area: '',

        phone: '',
        slack_channel: '',
        slack_member_id: '',

        is_phone: false,
        is_slack: false,
      })

      setTimeout(() => setReadyToSave(false), 100)
    }
    catch (error) {
      nError(error)
    }
  }

  // Load serviceResource data
  useEffect(() => {
    loadInfo()
  }, [])

  // Watch changes
  useEffect(() => {
    setReadyToSave(true)
  }, [
    newServiceResourceData
  ])
  
  // Render function
  return (<>
    {newServiceResourceData && edit ? (
      <div className="ServiceResourcesPage_New entity-edit">

        <div className="wrapper flex-container sb">
          <h1>New Service Resource</h1>
        </div>
        
        <div className="fieldset">
          
          <div className="legend">Main</div>

          <div className="fields">

            <div className="__left">
              <div className="field">
                <span>NickName:</span>
                
                <input type="text" defaultValue={newServiceResourceData.nickname} onChange={({target: {value}}) => setNewServiceResourceData({...newServiceResourceData, nickname: value})} />
              </div>
            </div>

            
            <div className="__right">

              <div className="field">
                <span>Active:</span>
                
                <Switcher checked={newServiceResourceData.active as boolean} onChange={(value) => setNewServiceResourceData({...newServiceResourceData, active: value})} />
              </div>
            </div>
          </div>
        </div>

        <div className="fieldset">

          <div className="legend">Settings</div>

          <div className="fields">

            <div className="__left">

              <div className="field" style={{zIndex: 6}}>
                <span>User:</span>

                <Select options={edit.users.map((user) => ({
                  span: user.user,
                  value: user.user_id
                }))} selectedOption={newServiceResourceData.area as string} onChange={(value: string) => setNewServiceResourceData({...newServiceResourceData, area: value})}/>
              </div>

              <div className="field" style={{zIndex: 5}}>
                <span>Area:</span>
                <Select options={edit.area.map((option) => ({
                  span: option,
                  value: option
                }))} selectedOption={newServiceResourceData.area as string} onChange={(value: string) => setNewServiceResourceData({...newServiceResourceData, area: value})}/>
              </div>
            </div>

            <div className="__right">

              <div className="field">
                <span>Time Zone:</span>
                <Select options={edit.time_zone.map((option) => ({
                  span: option,
                  value: option
                }))} selectedOption={newServiceResourceData.time_zone as string} onChange={(value: string) => setNewServiceResourceData({...newServiceResourceData, time_zone: value})}/>
              </div>
            </div>
          </div>
        </div>

        <div className="fieldset">

          <div className="legend">Notifications</div>

          <div className="fields">

            <div className="__left">

              <div className="field">
                <span>Phone:</span>
                <ReactInputMask type="text" mask="+1 (999) 999-9999" defaultValue={newServiceResourceData.phone} onChange={({target: {value}}) => setNewServiceResourceData({...newServiceResourceData, phone: value})} />
              </div>

              <div className="field">
                <span>Slack Channel:</span>

                <input type="text" defaultValue={newServiceResourceData.slack_channel} onChange={({target: {value}}) => setNewServiceResourceData({...newServiceResourceData, slack_channel: value})} />
              </div>

              <div className="field">
                <span>Slack Member ID:</span>

                <input type="text" defaultValue={newServiceResourceData.slack_member_id} onChange={({target: {value}}) => setNewServiceResourceData({...newServiceResourceData, slack_member_id: value})} />
              </div>

            </div>

            <div className="__right">

              <div className="field">
                <span>Phone:</span>

                <Checkbox contents='' value={newServiceResourceData.is_phone} onChange={(value) => setNewServiceResourceData({...newServiceResourceData, is_phone: value})} />
              </div>

              <div className="field">
                <span>Is Slack:</span>

                <Checkbox contents='' value={newServiceResourceData.is_slack} onChange={(value) => setNewServiceResourceData({...newServiceResourceData, is_slack: value})} />
              </div>

            </div>
          </div>
        </div>

        <div className="wrapper flex-container sb editing-buttons">
          <div />
          <div className="buttons">
            <button className="_bordered _red" onClick={() => $router.router.navigate('service_resources', {}, {
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
export default ServiceResourcesPage_New
