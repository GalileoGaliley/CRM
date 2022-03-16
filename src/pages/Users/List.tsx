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
import User from "../../models/User"
import { StoreDispatch, StoreState, mapDispatchToProps, mapStateToProps } from "../../store";

import "../../styles/pages/common/report-list.sass"
import qs from "qs";
import Account from "../../models/Account";

interface Props {
  store: StoreState,
  dispatcher: StoreDispatch
}

type FilterWord = 'function' | 'time_zone' | 'permissions' | 'active'

interface UsersReport {

  interface: {

    filter_words: {

      function: string[],
      time_zone: string[],
      permissions: string[],
      active: string[]
    },

    max_pages: number,
    rows_start: number,
    rows_end: number,
    rows_all: number,
  },

  permissions: {
    show_user: boolean,
    add_user: boolean
  },

  users: User[],

  edit: {
    time_zone: string[],
    permissions: string[],
    state: string[]
  }
}

const UsersPage_List = connect(mapStateToProps, mapDispatchToProps)(function(props: Props) {

  const $router = useRoute()

  const activeAccount = getActiveAccount(props.store) as Account;
  const [$updater, $setUpdater] = useState<any>(Math.random())

  const [reportData, setReportData] = useState<UsersReport | null>(null)
  const [localInterface, setLocalInterface] = useState({

    search: '',

    page: 1,

    filter_words: {

      function: [] as string[],
      time_zone: [] as string[],
      permissions: [] as string[],
      active: [] as string[],
    },

    sort: {
      field: 'first_name',
      direction: 'up' as 'up' | 'down'
    },
    sortFields: [{
      span: 'First Name',
      value: 'first_name'
    },{
      span: 'Last Name',
      value: 'last_name'
    },{
      span: 'Function',
      value: 'function'
    },{
      span: 'Phone',
      value: 'phone'
    },{
      span: 'Email',
      value: 'email'
    },{
      span: 'Time Zone',
      value: 'time_zone'
    },{
      span: 'Permissions',
      value: 'permissions'
    },{
      span: 'Active',
      value: 'active'
    }]

  })

  // Load users function
  async function loadUsers() {
    httpClient.defaults.headers['Authorization'] = `Bearer ${props.store.accessToken}`;

    let activeFilters: any = {...localInterface.filter_words}
    Object.keys(localInterface.filter_words).forEach((key: any) => !activeFilters[key].length && delete activeFilters[key])

    try {
      const { data: users } = (await httpClient.post('/users/report', qs.stringify({
        account_id: activeAccount.account_id,
        limit_rows: props.store.reportsMaxRows,
        page: localInterface.page,
        sort_field: localInterface.sort.field,
        sort_type: localInterface.sort.direction === 'up' ? 'asc' : 'desc',
        filter_field: JSON.stringify(activeFilters),
        ...(localInterface.search ? {search: localInterface.search} : {})
      }))) as {data: UsersReport}
      setReportData(users)

      const { data: user } = (await httpClient.get('/users/' + '88888001fd67db3si8'));

    }
    catch (error) {
      nError(error)
    }
  }

  // Load users on page mount
  useEffect(() => { loadUsers() }, [
    $updater,
    localInterface.page
  ])

  // Is filter selected function
  function isFilterSelected(field: FilterWord, value: string) {
    return localInterface.filter_words[field].includes(value)
  }

  // Is all filters selected function
  function isAllFiltersSelected(field: FilterWord) {
    return localInterface.filter_words[field].length === 0
  }

  // Filter switch function
  function switchFilter(field: FilterWord, value: string, toggle: boolean) {

    let _arr = [...localInterface.filter_words[field]]

    if (toggle && value === "All") { _arr = [] }
    
    else if (!toggle) {

      while (true) {
        let i = _arr.findIndex((filter) => filter === value)
        if(i === -1) break
        _arr.splice(i, 1)
      }
    }
      
    else {

      if (reportData?.interface.filter_words[field].every((option) => _arr.concat([value]).includes(option)))
        _arr = []

      else if(_arr.findIndex((filter) => filter === value) === -1)
        _arr.push(value)
    }

    setLocalInterface({...localInterface, filter_words: {...localInterface.filter_words, [field]: _arr}})
  }

  // Render function
  return (<>
    {reportData ? (
      <div className="UsersPage_List" >

        { /* Page header */}
        <div className="page-header">
          <h1>Users</h1>
        </div>

        { /* List filters */}
        <ReportFilters
          onSearchInputChange={(value) => setLocalInterface({...localInterface, search: value})}

          onUpdate={() => {
            $setUpdater(Math.random())
          }}
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
          onSortDirectionChange={(value) => setLocalInterface({ ...localInterface, sort: { ...localInterface.sort, direction: value } })}
          onSortFire={() => 0}
          
          addButton={(
            <div className="add-button-wrapper">
              <button className="_iconed _rounded add-button" onClick={() => $router.router.navigate('users.new')}>
                <Icon icon="plus-thin" />
                <span>Add user</span>
                <Icon icon="user-1" />
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
                contents={(<span>First Name</span>)}

                sortDirection={localInterface.sort.field === 'first_name' ? localInterface.sort.direction : undefined}
                onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {field: 'first_name', direction: value}})}

                onFilterFire={() => $setUpdater(Math.random())}
              />
              <ReportTableField
                contents={(<span>Last Name</span>)}

                sortDirection={localInterface.sort.field === 'last_name' ? localInterface.sort.direction : undefined}
                onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {field: 'last_name', direction: value}})}

                onFilterFire={() => $setUpdater(Math.random())}
              />
              <ReportTableField
                contents={(<span>Function</span>)}

                sortDirection={localInterface.sort.field === 'function' ? localInterface.sort.direction : undefined}
                onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {field: 'function', direction: value}})}

                onFilterFire={() => $setUpdater(Math.random())}
              />
              <ReportTableField
                contents={(<span>Phone</span>)}

                sortDirection={localInterface.sort.field === 'phone' ? localInterface.sort.direction : undefined}
                onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {field: 'phone', direction: value}})}

                onFilterFire={() => $setUpdater(Math.random())}
              />
              <ReportTableField
                contents={(<span>Email</span>)}

                sortDirection={localInterface.sort.field === 'email' ? localInterface.sort.direction : undefined}
                onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {field: 'email', direction: value}})}

                onFilterFire={() => $setUpdater(Math.random())}
              />
              <ReportTableField
                contents={(<span>Time zone</span>)}

                allFiltersSelected={isAllFiltersSelected("time_zone")}
                onAllFiltersChange={(value) => switchFilter("time_zone", "All", value)}

                filterWords={reportData.interface.filter_words.time_zone.map((filterWord) => ({
                  word: filterWord,
                  selected: isFilterSelected("time_zone", filterWord)
                }))}
                onFilterChange={(value) => switchFilter("time_zone", value.word, value.selected)}

                sortDirection={localInterface.sort.field === 'time_zone' ? localInterface.sort.direction : undefined}
                onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {field: 'time_zone', direction: value}})}

                onFilterFire={() => $setUpdater(Math.random())}
              />
              <ReportTableField
                contents={(<span>Permissions</span>)}

                allFiltersSelected={isAllFiltersSelected("permissions")}
                onAllFiltersChange={(value) => switchFilter("permissions", "All", value)}

                filterWords={reportData.interface.filter_words.permissions.map((filterWord) => ({
                  word: filterWord,
                  selected: isFilterSelected("permissions", filterWord)
                }))}
                onFilterChange={(value) => switchFilter("permissions", value.word, value.selected)}

                sortDirection={localInterface.sort.field === 'permissions' ? localInterface.sort.direction : undefined}
                onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {field: 'permissions', direction: value}})}

                onFilterFire={() => $setUpdater(Math.random())}
              />
              <ReportTableField
                contents={(<span>Active</span>)}

                allFiltersSelected={isAllFiltersSelected("active")}
                onAllFiltersChange={(value) => switchFilter("active", "All", value)}

                filterWords={reportData.interface.filter_words.active.map((filterWord) => ({
                  word: filterWord,
                  selected: isFilterSelected("active", filterWord)
                }))}
                onFilterChange={(value) => switchFilter("active", value.word, value.selected)}

                sortDirection={localInterface.sort.field === 'active' ? localInterface.sort.direction : undefined}
                onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {field: 'active', direction: value}})}

                onFilterFire={() => $setUpdater(Math.random())}
              />
            </tr>
            {reportData.users.map((user, i) => (
              <tr key={i} onClick={() => $router.router.navigate('users.item', {
                userId: user.user_id
              }, {reload: true})}>
                <td>{user.first_name}</td>
                <td>{user.last_name}</td>
                <td>{user.function}</td>
                <td>{user.phone}</td>
                <td>{user.email}</td>
                <td>{user.time_zone}</td>
                <td>{user.permissions}</td>
                <td className={classNames({
                  'red-text': user.active === 'Inactive',
                  'green-text': user.active === 'Active',
                  'blue-text': user.active === 'Waiting',
                })}>{user.active}</td>
              </tr>
            ))}
          </table>

          {/* Medium screen table */}
          <table className={classNames('table', '__hide-on-wide', '__hide-on-mobile', {
            __respectAsidePanel: props.store.navActive.is
          })}>
            <tr></tr>
            {reportData.users.map((user, i) => (
              <tr key={i} onClick={() => $router.router.navigate('users.item', {
                userId: user.user_id
              }, {reload: true})}>
                <td>
                  <div>{user.first_name} {user.last_name}</div>
                  <div>{user.email}</div>
                </td>
                <td>
                  <div>{user.phone}</div>
                  <div>{user.time_zone}</div>
                </td>
                <td>
                  <div>Function: {user.function}</div>
                  <div>Permissions: {user.permissions}</div>
                </td>
                <td>
                  <div className={classNames({
                    'red-text': user.active === 'Inactive',
                    'green-text': user.active === 'Active',
                    'blue-text': user.active === 'Waiting',
                  })}>
                    {user.active}
                  </div>
                  <div>&nbsp;</div>
                </td>
              </tr>
            ))}
          </table>

          {/* Mobile table items */}
          <div className={classNames('mobile-table-items', '__show-on-mobile', {
            __respectAsidePanel: props.store.navActive.is
          })}>

            {reportData.users.map((user, i: number) => (
              <div className="item" key={i} onClick={() => $router.router.navigate('users.item', {
                userId: user.user_id
              }, {reload: true})}>

                <div className="__top">

                  <div className="__left">
                    <div><b>{user.first_name} {user.last_name}</b></div>
                    <div>
                      {user.email}
                    </div>
                  </div>

                  <div className="__right">
                    <div className={classNames({
                      'red-text': user.active === 'Inactive',
                      'green-text': user.active === 'Active',
                      'blue-text': user.active === 'Waiting',
                    })}>
                      {user.active}
                    </div>
                    <div>
                      {user.phone}
                    </div>
                  </div>
                </div>

                <div className="__bottom">

                  <div className="__left">
                    <div>
                      <span className="gray">Functions:</span>
                      <span> {user.function}</span>
                    </div>
                    <div>
                      <span className="gray">Permissions:</span>
                      <span> {user.permissions}</span>
                    </div>
                  </div>

                  <div className="__right small">
                    <div>
                      {user.time_zone}
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
export default UsersPage_List
