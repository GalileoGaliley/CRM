import axios from "axios"
import classNames from "classnames"
import { useEffect, useState } from "react";
import { connect } from "react-redux";
import { BaseLink, useRoute } from "react-router5"
import Checkbox from "../../../components/Checkbox"
import Icon from "../../../components/Icon"
import ReportFilters from "../../../components/reports/Filters"
import ReportTableControls from "../../../components/reports/TableControls"
import ReportTableField from "../../../components/reports/TableField"
import { httpClient, nError } from "../../../funcs/base"
import { CallCenter_CallFlow } from "../../../models/CallCenter"
import Client from "../../../models/Client"
import { StoreDispatch, StoreState, mapDispatchToProps, mapStateToProps } from "../../../store";

import "../../../styles/pages/common/report-list.sass"
import qs from "qs";
import {getActiveAccount} from "../../../funcs";
import Account from "../../../models/Account";

interface Props {
  store: StoreState,
  dispatcher: StoreDispatch
}

interface CallFlowsReport {

  interface: {

    max_pages: number,
    rows_start: number,
    rows_end: number,
    rows_all: number,
  },

  permissions: {
    show_call_flow: boolean,
    add_call_flow: boolean
  },

  call_flows: CallCenter_CallFlow[]
}

const CallCenter_CallFlowsPage_List = connect(mapStateToProps, mapDispatchToProps)(function(props: Props) {

  const $router = useRoute()

  const activeAccount = getActiveAccount(props.store) as Account;
  const [$updater, $setUpdater] = useState<any>(Math.random())

  const [reportData, setReportData] = useState<CallFlowsReport | null>(null)
  const [localInterface, setLocalInterface] = useState({

    search: '',

    page: 1,

    sort: {
      field: 'name',
      direction: 'up' as 'up' | 'down'
    },
    sortFields: [{
      span: 'Name',
      value: 'name'
    },{
      span: 'Groups',
      value: 'call_groups'
    }]

  })

  // Load callFlows function
  async function loadCallFlows() {

    httpClient.defaults.headers['Authorization'] = `Bearer ${props.store.accessToken}`

    try {
      const { data: dipsatchersReport } = (await httpClient.post('/callflows/report', qs.stringify({
        account_id: activeAccount.account_id,
        limit_rows: props.store.reportsMaxRows,
        page: localInterface.page,
        sort_field: localInterface.sort.field,
        sort_type: localInterface.sort.direction === 'up' ? 'asc' : 'desc',
        ...(localInterface.search ? {search: localInterface.search} : {})
      }))) as {data: CallFlowsReport}

      setReportData(dipsatchersReport)
    }
    catch (error) {
      nError(error)
    }
  }

  // Load clients on page mount
  useEffect(() => { loadCallFlows() }, [
    $updater,
    localInterface.page,
  ])

  // Render function
  return (<>
    {reportData ? (
      <div className="CallCenter_CallFlowsPage_List" >

        {/* Top navigation */}
        <div className="top-nav">
          <BaseLink router={$router.router} routeName="call_center.phoneNumbers" className={classNames({_active: $router.route.name === "call_center.phoneNumbers"})}>
            <Icon icon="phone-1" />
            <span>Phone Numbers</span>
          </BaseLink>

          <BaseLink router={$router.router} routeName="call_center.dispatchers" className={classNames({_active: $router.route.name === "call_center.dispatchers"})}>
            <Icon icon="user-1" />
            <span>Dispatchers</span>
          </BaseLink>

          <BaseLink router={$router.router} routeName="call_center.groups" className={classNames({_active: $router.route.name === "call_center.groups"})}>
            <Icon icon="user-29" />
            <span>Groups</span>
          </BaseLink>

          <BaseLink router={$router.router} routeName="call_center.callFlows" className={classNames({_active: $router.route.name === "call_center.callFlows"})}>
            <Icon icon="share-7" />
            <span>Call Flows</span>
          </BaseLink>

          <BaseLink router={$router.router} routeName="call_center.settings" className={classNames({_active: $router.route.name === "call_center.settings"})}>
            <Icon icon="gear-1" />
            <span>Settings</span>
          </BaseLink>
        </div>

        { /* List filters */}
        <ReportFilters
          onSearchInputChange={(value) => setLocalInterface({...localInterface, search: value})}

          onUpdate={() => $setUpdater(Math.random())}
        />

        {/* Table controls */}
        <ReportTableControls
          zIndex={5}

          onMaxRowsChange={() => {
            $setUpdater(Math.random())
          }}

          amount={{
            total: reportData.interface.rows_all,
            start: reportData.interface.rows_start,
            end: reportData.interface.rows_end
          }}

          page={localInterface.page}
          maxPages={reportData.interface.max_pages}
          onPagesStart={() => setLocalInterface({...localInterface, page: 1})}
          onPrevPage={() => setLocalInterface({...localInterface, page: localInterface.page-1})}
          onNextPage={() => setLocalInterface({...localInterface, page: localInterface.page+1})}
          onPagesEnd={() => setLocalInterface({...localInterface, page: reportData.interface.max_pages})}
          
          sort={localInterface.sort}
          sortFields={localInterface.sortFields}
          onSortFieldChange={(value) => setLocalInterface({...localInterface, sort: {...localInterface.sort, field: value}})}
          onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {...localInterface.sort, direction: value}})}
          onSortFire={() => $setUpdater(Math.random())}

          addButton={(
            <div className="add-button-wrapper">
              <button className="_iconed _rounded add-button" onClick={() => $router.router.navigate('call_center.callFlows.new', {}, {reload: true})}>
                <Icon icon="plus-thin" />
                <span>Add Call Flow</span>
                <Icon icon="share-7" />
              </button>
            </div>
          )}
        />

        <div className="contents">

          {/* Wide desktop table */}
          <table className={classNames('table', '__show-on-wide', {
            __respectAsidePanel: props.store.navActive.is
          })}>
            <tr>
              <ReportTableField
                contents={(<span>Name</span>)}

                sortDirection={localInterface.sort.field === 'name' ? localInterface.sort.direction : undefined}
                onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {field: 'name', direction: value}})}

                onFilterFire={() => $setUpdater(Math.random())}
              />
              <ReportTableField
                contents={(<span>Groups</span>)}

                sortDirection={localInterface.sort.field === 'call_groups' ? localInterface.sort.direction : undefined}
                onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {field: 'call_groups', direction: value}})}

                onFilterFire={() => $setUpdater(Math.random())}
              />
            </tr>
            {reportData.call_flows.map((callFlow, i) => (
              <tr key={i} onClick={() => $router.router.navigate('call_center.callFlows.item', {}, {reload: true})}>
                <td>{callFlow.name}</td>
                <td>{callFlow.call_groups}</td>
              </tr>
            ))}
          </table>

          {/* Medium screen table */}
          <table className={classNames('table', '__hide-on-wide', '__hide-on-mobile', {
            __respectAsidePanel: props.store.navActive.is
          })}>
            <tr>
              <th>Name</th>
              <th>Groups</th>
            </tr>
            {reportData.call_flows.map((callFlow, i) => (
              <tr key={i} onClick={() => $router.router.navigate('call_center.callFlows.item', {}, {reload: true})}>
                <td>{callFlow.name}</td>
                <td>{callFlow.call_groups}</td>
              </tr>
            ))}
          </table>

          {/* Mobile table items */}
          <div className={classNames('mobile-table-items', '__show-on-mobile', {
            __respectAsidePanel: props.store.navActive.is
          })}>

            {reportData.call_flows.map((callFlow, i: number) => (
              <div className="item" key={i} onClick={() => $router.router.navigate('call_center.callFlows.item', {}, {reload: true})}>

                <div className="__top">

                  <div className="__left">
                    <div><b>{callFlow.name}</b></div>
                    <div>
                      {callFlow.call_groups}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Table controls */}
        <ReportTableControls
          isUnder={true}

          onMaxRowsChange={() => $setUpdater(Math.random())}

          amount={{
            total: reportData.interface.rows_all,
            start: reportData.interface.rows_start,
            end: reportData.interface.rows_end
          }}

          page={localInterface.page}
          maxPages={reportData.interface.max_pages}
          onPagesStart={() => setLocalInterface({...localInterface, page: 1})}
          onPrevPage={() => setLocalInterface({...localInterface, page: localInterface.page-1})}
          onNextPage={() => setLocalInterface({...localInterface, page: localInterface.page+1})}
          onPagesEnd={() => setLocalInterface({...localInterface, page: reportData.interface.max_pages})}
          
          sort={localInterface.sort}
          sortFields={localInterface.sortFields}
          onSortFieldChange={(value) => setLocalInterface({...localInterface, sort: {...localInterface.sort, field: value}})}
          onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {...localInterface.sort, direction: value}})}
          onSortFire={() => $setUpdater(Math.random())}
        />
      </div>
    ) : null}
  </>)
})
export default CallCenter_CallFlowsPage_List
