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
import { CallCenter_Dispatcher } from "../../../models/CallCenter"
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

type FilterWord = 'phone' | 'softphone' | 'active'

interface DispatchersReport {

  interface: {

    filter_words: {

      phone: string[],
      softphone: string[],
      active: string[],
    },

    max_pages: number,
    rows_start: number,
    rows_end: number,
    rows_all: number,
  },

  permissions: {
    show_dispatcher: boolean,
    add_dispatcher: boolean
  },

  dispatchers: CallCenter_Dispatcher[]
}

const CallCenter_DispatchersPage_List = connect(mapStateToProps, mapDispatchToProps)(function(props: Props) {

  const $router = useRoute()

  const activeAccount = getActiveAccount(props.store) as Account;
  const [$updater, $setUpdater] = useState<any>(Math.random())

  const [reportData, setReportData] = useState<DispatchersReport | null>(null)
  const [localInterface, setLocalInterface] = useState({

    search: '',

    page: 1,

    filter_words: {

      phone: [] as string[],
      softphone: [] as string[],
      active: [] as string[],
    },

    sort: {
      field: 'name',
      direction: 'up' as 'up' | 'down'
    },
    sortFields: [{
      span: 'Name',
      value: 'name'
    },{
      span: 'User',
      value: 'user'
    },{
      span: 'Phone',
      value: 'phone'
    },{
      span: 'Phone',
      value: 'is_phone'
    },{
      span: 'Softphone',
      value: 'is_softphone'
    },{
      span: 'Groups',
      value: 'groups'
    },{
      span: 'Active',
      value: 'active'
    }]

  })

  // Load dispatchers function
  async function loadDispatchers() {

    httpClient.defaults.headers['Authorization'] = `Bearer ${props.store.accessToken}`
    
    let activeFilters: any = {...localInterface.filter_words}
    Object.keys(localInterface.filter_words).forEach((key: any) => !activeFilters[key].length && delete activeFilters[key])

    try {
      const { data: dipsatchersReport } = (await httpClient.post('/dispatchers/report', qs.stringify({
        account_id: activeAccount.account_id,
        limit_rows: props.store.reportsMaxRows,
        page: localInterface.page,
        sort_field: localInterface.sort.field,
        sort_type: localInterface.sort.direction === 'up' ? 'asc' : 'desc',
        filter_field: JSON.stringify(activeFilters),
        ...(localInterface.search ? {search: localInterface.search} : {})
      }))) as {data: DispatchersReport}

      setReportData(dipsatchersReport)
    }
    catch (error) {
      nError(error)
    }
  }

  // Load clients on page mount
  useEffect(() => { loadDispatchers() }, [
    $updater,
    localInterface.page,
  ])

  // Is filter selected function
  function isFilterSelected(field: FilterWord, value: string) {
    return localInterface.filter_words[field].includes(value)
  }

  function isAllFiltersSelected(field: FilterWord) {
    return localInterface.filter_words[field].length === 0
  }

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
      <div className="CallCenter_DispatchersPage_List" >

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
              <button className="_iconed _rounded add-button" onClick={() => $router.router.navigate('call_center.dispatchers.new', {}, {reload: true})}>
                <Icon icon="plus-thin" />
                <span>Add Dispatcher</span>
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
                contents={(<span>User</span>)}

                sortDirection={localInterface.sort.field === 'user' ? localInterface.sort.direction : undefined}
                onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {field: 'user', direction: value}})}

                onFilterFire={() => $setUpdater(Math.random())}
              />
              <ReportTableField
                contents={(<span>Phone</span>)}

                sortDirection={localInterface.sort.field === 'phone' ? localInterface.sort.direction : undefined}
                onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {field: 'phone', direction: value}})}

                onFilterFire={() => $setUpdater(Math.random())}
              />
              <ReportTableField
                contents={(<span>Phone</span>)}

                allFiltersSelected={isAllFiltersSelected("phone")}
                onAllFiltersChange={(value) => switchFilter("phone", "All", value)}

                filterWords={reportData.interface.filter_words.phone.map((filterWord) => ({
                  word: filterWord,
                  selected: isFilterSelected("phone", filterWord)
                }))}
                onFilterChange={(value) => switchFilter("phone", value.word, value.selected)}

                sortDirection={localInterface.sort.field === 'is_phone' ? localInterface.sort.direction : undefined}
                onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {field: 'is_phone', direction: value}})}

                onFilterFire={() => $setUpdater(Math.random())}
              />
              <ReportTableField
                contents={(<span>Softphone</span>)}

                allFiltersSelected={isAllFiltersSelected("softphone")}
                onAllFiltersChange={(value) => switchFilter("softphone", "All", value)}

                filterWords={reportData.interface.filter_words.softphone.map((filterWord) => ({
                  word: filterWord,
                  selected: isFilterSelected("softphone", filterWord)
                }))}
                onFilterChange={(value) => switchFilter("softphone", value.word, value.selected)}

                sortDirection={localInterface.sort.field === 'is_softphone' ? localInterface.sort.direction : undefined}
                onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {field: 'is_softphone', direction: value}})}

                onFilterFire={() => $setUpdater(Math.random())}
              />
              <ReportTableField
                contents={(<span>Groups</span>)}

                sortDirection={localInterface.sort.field === 'groups' ? localInterface.sort.direction : undefined}
                onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {field: 'groups', direction: value}})}

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
            {reportData.dispatchers.map((dispatcher, i) => (
              <tr key={i} onClick={() => $router.router.navigate('call_center.dispatchers.item', {}, {reload: true})}>
                <td>{dispatcher.name}</td>
                <td>{dispatcher.user}</td>
                <td>{dispatcher.phone}</td>
                <td><Checkbox contents='' value={dispatcher.is_phone} /></td>
                <td><Checkbox contents='' value={dispatcher.is_softphone} /></td>
                <td>{dispatcher.groups}</td>
                <td className={classNames({
                  'red-text': dispatcher.active === 'Off',
                  'green-text': dispatcher.active === 'On',
                })}>{dispatcher.active}</td>
              </tr>
            ))}
          </table>

          {/* Medium screen table */}
          <table className={classNames('table', '__hide-on-wide', '__hide-on-mobile', {
            __respectAsidePanel: props.store.navActive.is
          })}>
            <tr></tr>
            {reportData.dispatchers.map((dispatcher, i) => (
              <tr key={i} onClick={() => $router.router.navigate('call_center.dispatchers.item', {}, {reload: true})}>
                <td>
                  <div>{dispatcher.name}</div>
                  <div>{dispatcher.user}</div>
                </td>
                <td>
                  <div>{dispatcher.phone}</div>
                  <div>&nbsp;</div>
                </td>
                <td>
                  <div className="flex-container"><span>Phone:</span> <Checkbox contents='' value={dispatcher.is_phone} /></div>
                  <div className="flex-container"><span>Softphone:</span> <Checkbox contents='' value={dispatcher.is_softphone} /></div>
                </td>
                <td>
                  <div>{dispatcher.groups}</div>
                  <div className={classNames({
                  'red-text': dispatcher.active === 'Inactive',
                  'green-text': dispatcher.active === 'Active',
                })}>{dispatcher.active}</div>
                </td>
              </tr>
            ))}
          </table>

          {/* Mobile table items */}
          <div className={classNames('mobile-table-items', '__show-on-mobile', {
            __respectAsidePanel: props.store.navActive.is
          })}>

            {reportData.dispatchers.map((dispatcher, i: number) => (
              <div className="item" key={i} onClick={() => $router.router.navigate('call_center.dispatchers.item', {}, {reload: true})}>

                <div className="__top">

                  <div className="__left">
                    <div><b>{dispatcher.name}</b></div>
                    <div>
                      {dispatcher.user}
                    </div>
                  </div>

                  <div className="__right small">
                    <div className={classNames({
                      'red-text': dispatcher.active === 'Inactive',
                      'green-text': dispatcher.active === 'Active',
                    })}>
                      {dispatcher.active}
                    </div>
                    <div>
                      {dispatcher.phone}
                    </div>
                  </div>
                </div>

                <div className="__bottom">

                  <div className="__left">
                    <div className="flex-container">
                      <span className="gray">Phone:</span>
                      <span> <Checkbox contents='' value={dispatcher.is_phone} /></span>
                    </div>
                    <div className="flex-container">
                      <span className="gray">Softphone:</span>
                      <span> <Checkbox contents='' value={dispatcher.is_softphone} /></span>
                    </div>
                  </div>

                  <div className="__right small">
                    <div>
                      <b>{dispatcher.groups}</b>
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
export default CallCenter_DispatchersPage_List
