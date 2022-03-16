import axios from "axios"
import classNames from "classnames"
import { useEffect, useState } from "react";
import { connect } from "react-redux";
import { BaseLink, useRoute } from "react-router5"
import Icon from "../../../components/Icon"
import ReportFilters from "../../../components/reports/Filters"
import ReportTableControls from "../../../components/reports/TableControls"
import ReportTableField from "../../../components/reports/TableField"
import { httpClient, nError } from "../../../funcs/base"
import { CallCenter_PhoneNumber } from "../../../models/CallCenter"
import Client from "../../../models/Client"
import { StoreDispatch, StoreState, mapDispatchToProps, mapStateToProps } from "../../../store";

import "../../../styles/pages/common/report-list.sass"
import {getActiveAccount} from "../../../funcs";
import Account from "../../../models/Account";
import qs from "qs";

interface Props {
  store: StoreState,
  dispatcher: StoreDispatch
}

type FilterWord = 'type' | 'source' | 'area' | 'company' | 'call_flow' | 'active'

interface PhoneNumbersReport {

  interface: {

    filter_words: {

      type: string[],
      source: string[],
      area: string[],
      company: string[],
      call_flow: string[],
      active: string[]
    },

    max_pages: number,
    rows_start: number,
    rows_end: number,
    rows_all: number,
  },

  permissions: {
    show_phone_number: boolean,
    add_phone_number: boolean
  },

  phone_numbers: CallCenter_PhoneNumber[]
}

const CallCenter_PhoneNumbersPage_List = connect(mapStateToProps, mapDispatchToProps)(function(props: Props) {

  const $router = useRoute()

  const activeAccount = getActiveAccount(props.store) as Account;
  const [$updater, $setUpdater] = useState<any>(Math.random())

  const [reportData, setReportData] = useState<PhoneNumbersReport | null>(null)
  const [localInterface, setLocalInterface] = useState({

    search: '',

    page: 1,

    filter_words: {

      type: [] as string[],
      source: [] as string[],
      area: [] as string[],
      company: [] as string[],
      call_flow: [] as string[],
      active: [] as string[],
    },

    sort: {
      field: 'phone',
      direction: 'up' as 'up' | 'down'
    },
    sortFields: [{
      span: 'Phone Number',
      value: 'phone'
    },{
      span: 'Friendly Name',
      value: 'friendly_name'
    },{
      span: 'Type',
      value: 'type'
    },{
      span: 'Source',
      value: 'source'
    },{
      span: 'Area',
      value: 'area'
    },{
      span: 'Company',
      value: 'company'
    },{
      span: 'Call Flow',
      value: 'call_flow'
    },{
      span: 'Available',
      value: 'active'
    }]

  })

  // Load clients function
  async function loadClients() {

    httpClient.defaults.headers['Authorization'] = `Bearer ${props.store.accessToken}`
    
    let activeFilters: any = {...localInterface.filter_words}
    Object.keys(localInterface.filter_words).forEach((key: any) => !activeFilters[key].length && delete activeFilters[key])

    try {
      const { data: clients } = (await httpClient.post('/phonenumbers/report', qs.stringify({
        account_id: activeAccount.account_id,
        limit_rows: props.store.reportsMaxRows,
        page: localInterface.page,
        sort_field: localInterface.sort.field,
        sort_type: localInterface.sort.direction === 'up' ? 'asc' : 'desc',
        filter_field: JSON.stringify(activeFilters),
        ...(localInterface.search ? {search: localInterface.search} : {})
      }))) as {data: PhoneNumbersReport}

      setReportData(clients)
    }
    catch (error) {
      nError(error)
    }

  }

  // Load clients on page mount
  useEffect(() => { loadClients() }, [
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
      <div className="CallCenter_PhoneNumbersPage_List" >

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

          onUpdate={() => {
            $setUpdater(Math.random())
          }}
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
          onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {...localInterface.sort, direction: value}})}
          onSortFire={() => $setUpdater(Math.random())}

          addButton={(
            <div className="add-button-wrapper">
              <button className="_iconed _rounded add-button" onClick={() => $router.router.navigate('call_center.phoneNumbers.new', {}, {reload: true})}>
                <Icon icon="plus-thin" />
                <span>Add Phone</span>
                <Icon icon="phone-1" />
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
                contents={(<span>Phone Number</span>)}

                sortDirection={localInterface.sort.field === 'phone' ? localInterface.sort.direction : undefined}
                onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {field: 'phone', direction: value}})}

                onFilterFire={() => $setUpdater(Math.random())}
              />
              <ReportTableField
                contents={(<span>Friendly Name</span>)}

                sortDirection={localInterface.sort.field === 'friendly_name' ? localInterface.sort.direction : undefined}
                onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {field: 'friendly_name', direction: value}})}

                onFilterFire={() => $setUpdater(Math.random())}
              />
              <ReportTableField
                contents={(<span>Type</span>)}

                allFiltersSelected={isAllFiltersSelected("type")}
                onAllFiltersChange={(value) => switchFilter("type", "All", value)}

                filterWords={reportData.interface.filter_words.type.map((filterWord) => ({
                  word: filterWord,
                  selected: isFilterSelected("type", filterWord)
                }))}
                onFilterChange={(value) => switchFilter("type", value.word, value.selected)}

                sortDirection={localInterface.sort.field === 'type' ? localInterface.sort.direction : undefined}
                onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {field: 'type', direction: value}})}

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
                contents={(<span>Area</span>)}

                allFiltersSelected={isAllFiltersSelected("area")}
                onAllFiltersChange={(value) => switchFilter("area", "All", value)}

                filterWords={reportData.interface.filter_words.area.map((filterWord) => ({
                  word: filterWord,
                  selected: isFilterSelected("area", filterWord)
                }))}
                onFilterChange={(value) => switchFilter("area", value.word, value.selected)}

                sortDirection={localInterface.sort.field === 'area' ? localInterface.sort.direction : undefined}
                onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {field: 'area', direction: value}})}

                onFilterFire={() => $setUpdater(Math.random())}
              />
              <ReportTableField
                contents={(<span>Company</span>)}

                allFiltersSelected={isAllFiltersSelected("company")}
                onAllFiltersChange={(value) => switchFilter("company", "All", value)}

                filterWords={reportData.interface.filter_words.company.map((filterWord) => ({
                  word: filterWord,
                  selected: isFilterSelected("company", filterWord)
                }))}
                onFilterChange={(value) => switchFilter("company", value.word, value.selected)}

                sortDirection={localInterface.sort.field === 'company' ? localInterface.sort.direction : undefined}
                onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {field: 'company', direction: value}})}

                onFilterFire={() => $setUpdater(Math.random())}
              />
              <ReportTableField
                contents={(<span>Call Flow</span>)}

                allFiltersSelected={isAllFiltersSelected("call_flow")}
                onAllFiltersChange={(value) => switchFilter("call_flow", "All", value)}

                filterWords={reportData.interface.filter_words.call_flow.map((filterWord) => ({
                  word: filterWord,
                  selected: isFilterSelected("call_flow", filterWord)
                }))}
                onFilterChange={(value) => switchFilter("call_flow", value.word, value.selected)}

                sortDirection={localInterface.sort.field === 'call_flow' ? localInterface.sort.direction : undefined}
                onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {field: 'call_flow', direction: value}})}

                onFilterFire={() => $setUpdater(Math.random())}
              />
              <ReportTableField
                contents={(<span>Available</span>)}

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
            {reportData.phone_numbers.map((phoneNumber, i) => (
              <tr key={i} onClick={() => $router.router.navigate('call_center.phoneNumbers.item', {}, {reload: true})}>
                <td>
                  <div className="flex-container">
                    <span>{phoneNumber.phone}</span>
                    <button className="_zeroed _iconed">
                      <Icon icon="gear-1"/>
                    </button>
                  </div>
                </td>
                <td>{phoneNumber.friendly_name}</td>

                <td className={classNames({
                  'red-text': phoneNumber.type === 'System',
                  'green-text': phoneNumber.type === 'Source',
                  'blue-text': !['System', 'Source'].includes(phoneNumber.type)
                })}>{phoneNumber.type}</td>

                <td>{phoneNumber.source}</td>
                <td>{phoneNumber.area}</td>
                <td>{phoneNumber.company}</td>
                <td>{phoneNumber.call_flow}</td>

                <td className={classNames({
                  'red-text': phoneNumber.active === 'Off',
                  'green-text': phoneNumber.active === 'On',
                })}>{phoneNumber.active}</td>
              </tr>
            ))}
          </table>

          {/* Medium screen table */}
          <table className={classNames('table', '__hide-on-wide', '__hide-on-mobile', {
            __respectAsidePanel: props.store.navActive.is
          })}>
            <tr></tr>
            {reportData.phone_numbers.map((phoneNumber, i) => (
              <tr key={i} onClick={() => $router.router.navigate('call_center.phoneNumbers.item', {}, {reload: true})}>
                <td>
                  <div>{phoneNumber.phone}</div>
                  <div>{phoneNumber.friendly_name}</div>
                </td>
                <td>
                  <div>{phoneNumber.source}</div>
                  <div>{phoneNumber.area}</div>
                </td>
                <td>
                  <div>{phoneNumber.company}</div>
                  <div className={classNames({
                  'red-text': phoneNumber.type === 'System',
                  'green-text': phoneNumber.type === 'Source',
                  'blue-text': !['System', 'Source'].includes(phoneNumber.type)
                })}>{phoneNumber.type}</div>
                </td>
                <td>
                  <div>{phoneNumber.call_flow}</div>
                  <div className={classNames({
                  'red-text': phoneNumber.active === 'Off',
                  'green-text': phoneNumber.active === 'On',
                })}>{phoneNumber.active}</div>
                </td>
              </tr>
            ))}
          </table>

          {/* Mobile table items */}
          <div className={classNames('mobile-table-items', '__show-on-mobile', {
            __respectAsidePanel: props.store.navActive.is
          })}>

            {reportData.phone_numbers.map((phoneNumber, i: number) => (
              <div className="item" key={i} onClick={() => $router.router.navigate('call_center.phoneNumbers.item', {}, {reload: true})}>

                <div className="__top">

                  <div className="__left">
                    <div><b>{phoneNumber.phone}</b></div>
                    <div>
                      {phoneNumber.friendly_name}
                    </div>
                  </div>

                  <div className="__right">
                    <div>
                      {phoneNumber.company}
                    </div>
                    <div className={classNames({
                      'red-text': phoneNumber.type === 'System',
                      'green-text': phoneNumber.type === 'Source',
                      'blue-text': !['System', 'Source'].includes(phoneNumber.type)
                    })}>
                      {phoneNumber.type}
                    </div>
                    <div className={classNames({
                      'red-text': phoneNumber.active === 'Off',
                      'green-text': phoneNumber.active === 'On',
                    })}>
                      {phoneNumber.active}
                    </div>
                  </div>
                </div>

                <div className="__bottom">

                  <div className="__left">
                    <div>
                      <span className="gray">Area:</span>
                      <span> {phoneNumber.area}</span>
                    </div>
                    <div>
                      <span className="gray">Source:</span>
                      <span> {phoneNumber.source}</span>
                    </div>
                  </div>

                  <div className="__right small">
                    <div>
                      <b>{phoneNumber.call_flow}</b>
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
export default CallCenter_PhoneNumbersPage_List
