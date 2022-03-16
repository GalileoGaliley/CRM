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
import AccountPermission from "../../models/AccountPermission"
import { StoreDispatch, StoreState, mapDispatchToProps, mapStateToProps } from "../../store";

import "../../styles/pages/common/report-list.sass"
import Account from "../../models/Account";
import qs from "qs";

interface Props {
  store: StoreState,
  dispatcher: StoreDispatch
}

interface AccountPermissionsReport {

  interface: {

    max_pages: number,
    rows_start: number,
    rows_end: number,
    rows_all: number,
  },

  accountPermissions: {
    show_account_permission: boolean,
    add_account_permission: boolean
  },

  permissions_rows: AccountPermission[],

  edit: {
    actions: string[]
  }
}

const AccountPermissionsPage_List = connect(mapStateToProps, mapDispatchToProps)(function(props: Props) {

  const $router = useRoute()

  const activeAccount = getActiveAccount(props.store) as Account;
  const [$updater, $setUpdater] = useState<any>(Math.random())

  const [reportData, setReportData] = useState<AccountPermissionsReport | null>(null)
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

  // Load accountPermissions function
  async function loadAccountPermissions() {

    try {
      const { data: accountPermissions } = (await httpClient.post('/permissions/accounts/report', qs.stringify({

        limit_rows: props.store.reportsMaxRows,
        page: localInterface.page,
        sort_field: localInterface.sort.field,
        sort_type: localInterface.sort.direction === 'up' ? 'asc' : 'desc',
        ...(localInterface.search ? {search: localInterface.search} : {})
      }))) as {data: AccountPermissionsReport}

      setReportData(accountPermissions)
    }
    catch (error) {
      nError(error)
    }
  }


  // Load accountPermissions on page mount
  useEffect(() => { loadAccountPermissions() }, [
    $updater,
    localInterface.page
  ])

  // Render function
  return (<>
    {reportData ? (
      <div className="AccountPermissionsPage_List" >

        { /* Page header */}
        <div className="page-header">
          <h1>Account`s Permissions</h1>
        </div>

        { /* List filters */}
        <ReportFilters
          onSearchInputChange={(value) => setLocalInterface({...localInterface, search: value})}

          onUpdate={() => {
            $setUpdater(Math.random());
          }}
        />

        {/* Table controls */}
        <ReportTableControls
          zIndex={5}

          onMaxRowsChange={() => {
            $setUpdater(Math.random());

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
          onSortDirectionChange={(value) => setLocalInterface({ ...localInterface, sort: { ...localInterface.sort, direction: value } })}
          onSortFire={() => 0}
        
          addButton={(
            <div className="add-button-wrapper">
              <button className="_iconed _rounded add-button" onClick={() => $router.router.navigate('accounts_permissions.new')}>
                <Icon icon="plus-thin" />
                <span>Add Account`s Permission</span>
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
                contents={(<span>Accounts</span>)}

                sortDirection={localInterface.sort.field === 'accounts' ? localInterface.sort.direction : undefined}
                onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {field: 'accounts', direction: value}})}

                onFilterFire={() => $setUpdater(Math.random())}
              />
            </tr>
            {reportData.permissions_rows.map((accountPermission, i) => (
              <tr key={i} onClick={() => $router.router.navigate('accounts_permissions.item', {
                permissionId: accountPermission.account_permission_id
              }, {
                reload: true
              })}>
                <td>{accountPermission.name}</td>
                <td>{accountPermission.accounts}</td>
              </tr>
            ))}
          </table>

          {/* Medium desktop table */}
          <table className={classNames('table', '__hide-on-wide', '__hide-on-mobile', {
            __respectAsidePanel: props.store.navActive.is
          })}>
            <tr>
              <th>Name</th>
              <th>Accounts</th>
            </tr>
            {reportData.permissions_rows.map((accountPermission, i) => (
              <tr key={i} onClick={() => $router.router.navigate('accounts_permissions.item', {
                permissionId: accountPermission.account_permission_id
              }, {
                reload: true
              })}>
                <td>{accountPermission.name}</td>
                <td>{accountPermission.accounts}</td>
              </tr>
            ))}
          </table>

          {/* Mobile table items */}
          <div className={classNames('mobile-table-items', '__show-on-mobile', {
            __respectAsidePanel: props.store.navActive.is
          })}>

            {reportData.permissions_rows.map((accountPermission, i: number) => (
              <div className="item" key={i} onClick={() => $router.router.navigate('accounts_permissions.item', {
                permissionId: accountPermission.account_permission_id
              }, {
                reload: true
              })}>

                <div className="__top">

                  <div className="__left">
                    <div><b>{accountPermission.name}</b></div>
                    <div>
                      {accountPermission.accounts || <span>&nbsp;</span>}
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
export default AccountPermissionsPage_List
