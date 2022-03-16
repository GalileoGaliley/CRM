import axios from "axios"
import classNames from "classnames"
import { useEffect, useState } from "react";
import { connect } from "react-redux";
import { useRoute } from "react-router5"
import Icon from "../../components/Icon"
import ReportFilters from "../../components/reports/Filters"
import ReportTableControls from "../../components/reports/TableControls"
import ReportTableField from "../../components/reports/TableField"
import {getActiveAccount, httpClient, nError} from "../../funcs"
import Permission from "../../models/Permission"
import { StoreDispatch, StoreState, mapDispatchToProps, mapStateToProps } from "../../store";

import "../../styles/pages/common/report-list.sass"
import qs from "qs";
import Account from "../../models/Account";

interface Props {
  store: StoreState,
  dispatcher: StoreDispatch
}

interface PermissionsReport {

  interface: {

    max_pages: number,
    rows_start: number,
    rows_end: number,
    rows_all: number,
  },

  permissions: {
    show_permission: boolean,
    add_permission: boolean
  },

  permissions_rows: Permission[],

  edit: {
    actions: string[]
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const PermissionsPage_List = connect(mapStateToProps, mapDispatchToProps)(function(props: Props) {

  const $router = useRoute()

  const activeAccount = getActiveAccount(props.store) as Account;
  const [$updater, $setUpdater] = useState<any>(Math.random())

  const [reportData, setReportData] = useState<PermissionsReport | null>(null)
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
      span: 'Users',
      value: 'users'
    }]

  })

  // Load permissions function
  async function loadPermissions() {

    try {
      const { data: permissions } = (await httpClient.post('/permissions/users/report', qs.stringify({
        account_id: activeAccount.account_id,
        limit_rows: props.store.reportsMaxRows,
        page: localInterface.page,
        sort_field: localInterface.sort.field,
        sort_type: localInterface.sort.direction === 'up' ? 'asc' : 'desc',
        ...(localInterface.search ? {search: localInterface.search} : {})
      }))) as {data: PermissionsReport}

      setReportData(permissions)
    }
    catch (error) {
      nError(error)
    }
  }

  // Load permissions on page mount
  useEffect(() => { loadPermissions() }, [
    $updater,
    localInterface.page
  ])

  // Render function
  return (<>
    {reportData ? (
      <div className="PermissionsPage_List" >

        { /* Page header */}
        <div className="page-header">
          <h1>Permissions</h1>
        </div>

        { /* List filters */}
        <ReportFilters
          onSearchInputChange={(value) => setLocalInterface({...localInterface, search: value})}

          onUpdate={() => $setUpdater(Math.random())}
        />

        {/* Table controls */}
        <ReportTableControls
          zIndex={5}

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
          onSortDirectionChange={(value) => setLocalInterface({ ...localInterface, sort: { ...localInterface.sort, direction: value } })}
          onSortFire={() => 0}
        
          addButton={(
            <div className="add-button-wrapper">
              <button className="_iconed _rounded add-button" onClick={() => $router.router.navigate('permissions.new')}>
                <Icon icon="plus-thin" />
                <span>Add permission</span>
                <Icon icon="shield-28" />
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
                contents={(<span>Users</span>)}

                sortDirection={localInterface.sort.field === 'users' ? localInterface.sort.direction : undefined}
                onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {field: 'users', direction: value}})}

                onFilterFire={() => $setUpdater(Math.random())}
              />
            </tr>
            {reportData.permissions_rows.map((permission, i) => (
              <tr key={i} onClick={() => $router.router.navigate('permissions.item', {
                permissionId: permission.permission_id
              }, {
                reload: true
              })}>
                <td>{permission.name}</td>
                <td>{permission.users}</td>
              </tr>
            ))}
          </table>

          {/* Medium desktop table */}
          <table className={classNames('table', '__hide-on-wide', '__hide-on-mobile', {
            __respectAsidePanel: props.store.navActive.is
          })}>
            <tr>
              <th>Name</th>
              <th>Users</th>
            </tr>
            {reportData.permissions_rows.map((permission, i) => (
              <tr key={i} onClick={() => $router.router.navigate('permissions.item', {
                permissionId: permission.permission_id
              }, {
                reload: true
              })}>
                <td>{permission.name}</td>
                <td>{permission.users}</td>
              </tr>
            ))}
          </table>

          {/* Mobile table items */}
          <div className={classNames('mobile-table-items', '__show-on-mobile', {
            __respectAsidePanel: props.store.navActive.is
          })}>

            {reportData.permissions_rows.map((permission, i: number) => (
              <div className="item" key={i} onClick={() => $router.router.navigate('permissions.item', {
                permissionId: permission.permission_id
              }, {
                reload: true
              })}>

                <div className="__top">

                  <div className="__left">
                    <div><b>{permission.name}</b></div>
                    <div>
                      {permission.users || <span>&nbsp;</span>}
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
          onSortFire={() => 0}
        />
      </div>
    ) : null}
  </>)
})
export default PermissionsPage_List
