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
import Account from "../../models/Account"
import AccountCustom from "../../models/AccountCustom"
import { StoreDispatch, StoreState, mapDispatchToProps, mapStateToProps } from "../../store";

import "../../styles/pages/common/report-list.sass"
import qs from "qs";

interface Props {
  store: StoreState,
  dispatcher: StoreDispatch
}

type FilterWord = 'source' | 'status'

interface AccountsReport {

  interface: {

    filter_words: {

      source: string[],
      status: string[],
    },

    max_pages: number,
    rows_start: number,
    rows_end: number,
    rows_all: number,
  },

  permissions: {
    show_account: boolean,
    add_account: boolean
  },

  accounts: AccountCustom[],

  edit: {
    status: string[],
    owners: {
      user_id: string,
      user: string
    }[],
    source: string[],
    time_zone: string[],
    permissions: string[],
    state: string[]
  }
}

const AccountsPage_List = connect(mapStateToProps, mapDispatchToProps)(function(props: Props) {

  const $router = useRoute()

  const activeAccount = getActiveAccount(props.store) as Account;
  const [$updater, $setUpdater] = useState<any>(Math.random())

  const [reportData, setReportData] = useState<AccountsReport | null>(null)
  const [localInterface, setLocalInterface] = useState({

    search: '',

    page: 1,

    filter_words: {

      source: [] as string[],
      status: [] as string[]
    },

    sort: {
      field: 'name',
      direction: 'up' as 'up' | 'down'
    },
    sortFields: [{
      span: 'Name',
      value: 'name'
    },{
      span: 'Email',
      value: 'email'
    },{
      span: 'Owner',
      value: 'owner'
    },{
      span: 'Date',
      value: 'created_at'
    },{
      span: 'Users',
      value: 'users'
    },{
      span: 'Phone Numbers',
      value: 'phone_numbers'
    },{
      span: 'Source',
      value: 'source'
    },{
      span: 'Status',
      value: 'status'
    }]

  })

  // Load accounts function
  async function loadAccounts() {
    httpClient.defaults.headers['Authorization'] = `Bearer ${props.store.accessToken}`;

    let activeFilters: any = {...localInterface.filter_words}
    Object.keys(localInterface.filter_words).forEach((key: any) => !activeFilters[key].length && delete activeFilters[key])

    try {
      const { data: accounts } = (await httpClient.post('/accounts/report', qs.stringify({

        limit_rows: props.store.reportsMaxRows,
        page: localInterface.page,
        sort_field: localInterface.sort.field,
        sort_type: localInterface.sort.direction === 'up' ? 'asc' : 'desc',
        filter_field: JSON.stringify(activeFilters),
        ...(localInterface.search ? {search: localInterface.search} : {})
      }))) as {data: AccountsReport}

      setReportData(accounts)
    }
    catch (error) {
      nError(error)
    }
  }

  // Load accounts on page mount
  useEffect(() => { loadAccounts() }, [
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
      <div className="AccountsPage_List" >

        { /* Page header */}
        <div className="page-header">
          <h1>Accounts</h1>
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
              <button className="_iconed _rounded add-button" onClick={() => $router.router.navigate('accounts.new')}>
                <Icon icon="plus-thin" />
                <span>Add Account</span>
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
                contents={(<span>Name</span>)}

                sortDirection={localInterface.sort.field === 'name' ? localInterface.sort.direction : undefined}
                onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {field: 'name', direction: value}})}

                onFilterFire={() => $setUpdater(Math.random())}
              />
              <ReportTableField
                contents={(<span>Email</span>)}

                sortDirection={localInterface.sort.field === 'email' ? localInterface.sort.direction : undefined}
                onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {field: 'email', direction: value}})}

                onFilterFire={() => $setUpdater(Math.random())}
              />
              <ReportTableField
                contents={(<span>Owner</span>)}

                sortDirection={localInterface.sort.field === 'owner' ? localInterface.sort.direction : undefined}
                onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {field: 'owner', direction: value}})}

                onFilterFire={() => $setUpdater(Math.random())}
              />
              <ReportTableField
                contents={(<span>Date</span>)}

                sortDirection={localInterface.sort.field === 'created_at' ? localInterface.sort.direction : undefined}
                onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {field: 'created_at', direction: value}})}

                onFilterFire={() => $setUpdater(Math.random())}
              />
              <ReportTableField
                contents={(<span>Users</span>)}

                sortDirection={localInterface.sort.field === 'users' ? localInterface.sort.direction : undefined}
                onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {field: 'users', direction: value}})}

                onFilterFire={() => $setUpdater(Math.random())}
              />
              <ReportTableField
                contents={(<span>Phone Numbers</span>)}

                sortDirection={localInterface.sort.field === 'phone_numbers' ? localInterface.sort.direction : undefined}
                onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {field: 'phone_numbers', direction: value}})}

                onFilterFire={() => $setUpdater(Math.random())}
              />
              <ReportTableField
                contents={(<span>Source</span>)}

                allFiltersSelected={isAllFiltersSelected("source")}
                onAllFiltersChange={(value) => switchFilter("source", "All", value)}

                filterWords={reportData.interface.filter_words.source.map((filterWord) => ({
                  word: filterWord,
                  selected: isFilterSelected("source", filterWord)
                }))}
                onFilterChange={(value) => switchFilter("source", value.word, value.selected)}

                sortDirection={localInterface.sort.field === 'source' ? localInterface.sort.direction : undefined}
                onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {field: 'source', direction: value}})}

                onFilterFire={() => $setUpdater(Math.random())}
              />
              <ReportTableField
                contents={(<span>Status</span>)}

                allFiltersSelected={isAllFiltersSelected("status")}
                onAllFiltersChange={(value) => switchFilter("status", "All", value)}

                filterWords={reportData.interface.filter_words.status.map((filterWord) => ({
                  word: filterWord,
                  selected: isFilterSelected("status", filterWord)
                }))}
                onFilterChange={(value) => switchFilter("status", value.word, value.selected)}

                sortDirection={localInterface.sort.field === 'status' ? localInterface.sort.direction : undefined}
                onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {field: 'status', direction: value}})}

                onFilterFire={() => $setUpdater(Math.random())}
              />
            </tr>
            {reportData.accounts.map((account, i) => (
              <tr key={i} onClick={() => $router.router.navigate('accounts.item', {
                accountId: account.account_id
              }, {reload: true})}>
                <td>{account.name}</td>
                <td>{account.email}</td>
                <td>{account.owner}</td>
                <td>{account.created_at}</td>
                <td>{account.users}</td>
                <td>{account.phone_numbers}</td>
                <td>{account.source}</td>
                <td className={classNames({
                  'red-text': account.status === 'Inactive',
                  'green-text': account.status === 'Active',
                  'blue-text': !['Inactive', 'Active'].includes(account.status),
                })}>{account.status}</td>
              </tr>
            ))}
          </table>

          {/* Medium screen table */}
          <table className={classNames('table', '__hide-on-wide', '__hide-on-mobile', {
            __respectAsidePanel: props.store.navActive.is
          })}>
            <tr></tr>
            {reportData.accounts.map((account, i) => (
              <tr key={i} onClick={() => $router.router.navigate('accounts.item', {
                accountId: account.account_id
              }, {reload: true})}>
                <td>
                  <div>{account.name}</div>
                  <div>{account.email}</div>
                </td>
                <td>
                  <div>{account.owner}</div>
                  <div>{account.created_at}</div>
                </td>
                <td>
                  <div>Users: {account.users}</div>
                  <div>Phone Numbers: {account.phone_numbers}</div>
                </td>
                <td>
                  <div>{account.source}</div>
                  <div className={classNames({
                    'red-text': account.status === 'Inactive',
                    'green-text': account.status === 'Active',
                    'blue-text': !['Inactive', 'Active'].includes(account.status),
                  })}>
                    {account.status}
                  </div>
                </td>
              </tr>
            ))}
          </table>

          {/* Mobile table items */}
          <div className={classNames('mobile-table-items', '__show-on-mobile', {
            __respectAsidePanel: props.store.navActive.is
          })}>

            {reportData.accounts.map((account, i: number) => (
              <div className="item" key={i} onClick={() => $router.router.navigate('accounts.item', {
                accountId: account.account_id
              }, {reload: true})}>

                <div className="__top">

                  <div className="__left">
                    <div><b>{account.name}</b></div>
                    <div>
                      {account.email}
                    </div>
                  </div>

                  <div className="__right">
                    <div className={classNames({
                      'red-text': account.status === 'Inactive',
                      'green-text': account.status === 'Active',
                      'blue-text': !['Inactive', 'Active'].includes(account.status),
                    })}>
                      {account.status}
                    </div>
                    <div>
                      {account.owner}
                    </div>
                  </div>
                </div>

                <div className="__bottom">

                  <div className="__left">
                    <div>
                      <span className="gray">Users:</span>
                      <span> {account.users}</span>
                    </div>
                    <div>
                      <span className="gray">Phone Numbers:</span>
                      <span> {account.phone_numbers}</span>
                    </div>
                  </div>

                  <div className="__right small">
                    <div>
                      <b>{account.source}</b>
                    </div>
                    <div>
                      <b>{account.created_at}</b>
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
export default AccountsPage_List
