import axios from "axios"
import classNames from "classnames"
import { useEffect, useState } from "react";
import { connect } from "react-redux";
import { BaseLink, useRoute } from "react-router5"
import Checkbox from "../../components/Checkbox"
import Icon from "../../components/Icon"
import ReportFilters from "../../components/reports/Filters"
import ReportTableControls from "../../components/reports/TableControls"
import ReportTableField from "../../components/reports/TableField"
import { httpClient, nError } from "../../funcs/base"
import { StoreDispatch, StoreState, mapDispatchToProps, mapStateToProps } from "../../store";

import "../../styles/pages/common/report-list.sass"
import ServiceResource from "../../models/ServiceResource"
import qs from "qs";
import {getActiveAccount} from "../../funcs";
import Account from "../../models/Account";
import dashboard from "../Dashboard";

interface Props {
  store: StoreState,
  dispatcher: StoreDispatch
}

type FilterWord = 'area' | 'time_zone' | 'active'

interface ServiceResourcesReport {

  interface: {

    filter_words: {

      area: string[],
      time_zone: string[],
      active: string[],
    },

    max_pages: number,
    rows_start: number,
    rows_end: number,
    rows_all: number,
  },

  permissions: {
    show_service_resource: boolean,
    add_service_resource: boolean
  },

  service_resources: ServiceResource[]
}

const ServiceResourcesPage_List = connect(mapStateToProps, mapDispatchToProps)(function(props: Props) {

  const $router = useRoute()

  const activeAccount = getActiveAccount(props.store) as Account;
  const [$updater, $setUpdater] = useState<any>(Math.random())

  const [reportData, setReportData] = useState<ServiceResourcesReport | null>(null)
  const [localInterface, setLocalInterface] = useState({

    search: '',

    page: 1,

    filter_words: {

      area: [] as string[],
      time_zone: [] as string[],
      active: [] as string[],
    },

    sort: {
      field: 'nickname',
      direction: 'up' as 'up' | 'down'
    },
    sortFields: [{
      span: 'Name',
      value: 'nickname'
    },{
      span: 'User',
      value: 'user'
    },{
      span: 'Area',
      value: 'area'
    },{
      span: 'Time Zone',
      value: 'time_zone'
    },{
      span: 'Active',
      value: 'active'
    }]

  })

  // Load serviceResources function
  async function loadServiceResources() {

    httpClient.defaults.headers['Authorization'] = `Bearer ${props.store.accessToken}`
    
    let activeFilters: any = {...localInterface.filter_words}
    Object.keys(localInterface.filter_words).forEach((key: any) => !activeFilters[key].length && delete activeFilters[key])

    try {
      const { data: dipsatchersReport } = (await httpClient.post('/serviceresources/report', qs.stringify({
        account_id: activeAccount.account_id,
        limit_rows: props.store.reportsMaxRows,
        page: localInterface.page,
        sort_field: localInterface.sort.field,
        sort_type: localInterface.sort.direction === 'up' ? 'asc' : 'desc',
        filter_field: JSON.stringify(activeFilters),
        ...(localInterface.search ? {search: localInterface.search} : {})
      }))) as {data: ServiceResourcesReport}

      setReportData(dipsatchersReport)
    }
    catch (error) {
      nError(error)
    }
  }

  // Load clients on page mount
  useEffect(() => { loadServiceResources() }, [
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
      <div className="CallCenter_ServiceResourcesPage_List" >

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
              <button className="_iconed _rounded add-button" onClick={() => $router.router.navigate('service_resources.new', {}, {reload: true})}>
                <Icon icon="plus-thin" />
                <span>Add Service Resource</span>
                <Icon icon="construction-3" />
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

                sortDirection={localInterface.sort.field === 'nickname' ? localInterface.sort.direction : undefined}
                onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {field: 'nickname', direction: value}})}

                onFilterFire={() => $setUpdater(Math.random())}
              />
              <ReportTableField
                contents={(<span>User</span>)}

                sortDirection={localInterface.sort.field === 'user' ? localInterface.sort.direction : undefined}
                onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {field: 'user', direction: value}})}

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
                contents={(<span>Time Zone</span>)}

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
            {reportData.service_resources.map((serviceResource, i) => (
              <tr key={i} onClick={() => $router.router.navigate('service_resources.item', {
                serviceResourceId: serviceResource.service_resource_id
              }, {reload: true})}>
                <td>{serviceResource.nickname}</td>
                <td>{serviceResource.user}</td>
                <td>{serviceResource.area}</td>
                <td>{serviceResource.time_zone}</td>
                <td className={classNames({
                  'red-text': serviceResource.active === 'Inactive',
                  'green-text': serviceResource.active === 'Active',
                  'blue-text': serviceResource.active === 'Pending',
                })}>{serviceResource.active}</td>
              </tr>
            ))}
          </table>

          {/* Medium screen table */}
          <table className={classNames('table', '__hide-on-wide', '__hide-on-mobile', {
            __respectAsidePanel: props.store.navActive.is
          })}>
            <tr></tr>
            {reportData.service_resources.map((serviceResource, i) => (
              <tr key={i} onClick={() => $router.router.navigate('service_resources.item', {
                serviceResourceId: serviceResource.service_resource_id
              }, {reload: true})}>
                <td>
                  <div>{serviceResource.nickname}</div>
                  <div>{serviceResource.user}</div>
                </td>
                <td>
                  <div>{serviceResource.area}</div>
                  <div>{serviceResource.time_zone}</div>
                </td>
                <td>
                  <div className={classNames({
                    'red-text': serviceResource.active === 'Inactive',
                    'green-text': serviceResource.active === 'Active',
                    'blue-text': serviceResource.active === 'Pending',
                  })}>{serviceResource.active}</div>
                  <div>&nbsp;</div>
                </td>
              </tr>
            ))}
          </table>

          {/* Mobile table items */}
          <div className={classNames('mobile-table-items', '__show-on-mobile', {
            __respectAsidePanel: props.store.navActive.is
          })}>

            {reportData.service_resources.map((serviceResource, i: number) => (
              <div className="item" key={i} onClick={() => $router.router.navigate('service_resources.item', {
                serviceResourceId: serviceResource.service_resource_id
              }, {reload: true})}>

                <div className="__top">

                  <div className="__left">
                    <div><b>{serviceResource.nickname}</b></div>
                    <div>
                      {serviceResource.user}
                    </div>
                  </div>

                  <div className="__right small">
                    <div className={classNames({
                      'red-text': serviceResource.active === 'Inactive',
                      'green-text': serviceResource.active === 'Active',
                      'blue-text': serviceResource.active === 'Pending',
                    })}>
                      {serviceResource.active}
                    </div>
                  </div>
                </div>

                <div className="__bottom">

                  <div className="__left">

                  </div>

                  <div className="__right small">
                    <div>
                      <b>{serviceResource.area}</b>
                    </div>
                    <div>
                      <b>{serviceResource.time_zone}</b>
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
export default ServiceResourcesPage_List
