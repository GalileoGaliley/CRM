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
import Client from "../../models/Client"
import { StoreDispatch, StoreState, mapDispatchToProps, mapStateToProps } from "../../store";

import "../../styles/pages/common/report-list.sass"
import storage from "redux-persist/lib/storage";
import qs from "qs";
import Account from "../../models/Account";

interface Props {
  store: StoreState,
  dispatcher: StoreDispatch
}

type FilterWord = 'source'

interface ClientsReport {

  interface: {

    filter_words: {

      source: string[],
    },

    max_pages: number,
    rows_start: number,
    rows_end: number,
    rows_all: number,
  },

  permissions: {
    show_client: boolean,
  },

  dashboard: {

    all: string,
    unpaid: string,
    new_this_month: string,
    new_last_month: string
  },

  clients: Client[]
}

const ClientsPage_List = connect(mapStateToProps, mapDispatchToProps)(function(props: Props) {

  const $router = useRoute();
  const activeAccount = getActiveAccount(props.store) as Account
  const [$updater, $setUpdater] = useState<any>(Math.random())

  const [reportData, setReportData] = useState<ClientsReport | null>(null)
  const [localInterface, setLocalInterface] = useState({

    search: '',

    page: 1,
    max_rows: 100 as 50 | 100 | 250 | 500,

    filter_words: {

      source: [] as string[],
    },

    sort: {
      field: 'name',
      direction: 'up' as 'up' | 'down'
    },
    sortFields: [{
      span: 'Name',
      value: 'name'
    },
    {
      span: 'Date',
      value: 'created_at'
    },{
      span: 'Main Phone',
      value: 'phone'
    },{
      span: 'Source',
      value: 'source'
    },{
      span: 'Jobs',
      value: 'jobs'
    },{
      span: 'Appointments',
      value: 'appointments'
    },{
      span: 'Recalls',
      value: 'recalls'
    },{
      span: 'Total',
      value: 'total'
    },{
      span: 'Paid',
      value: 'paid'
    },{
      span: 'Unpaid',
      value: 'unpaid'
    }]

  })

  // Load clients function
  async function loadClients() {
    let activeFilters: any = {...localInterface.filter_words}
    Object.keys(localInterface.filter_words).forEach((key: any) => !activeFilters[key].length && delete activeFilters[key])
    let reqData = {
      account_id:activeAccount.account_id,
      limit_rows: props.store.reportsMaxRows,
      page: localInterface.page,
      sort_field: localInterface.sort.field,
      sort_type: localInterface.sort.direction === 'up' ? 'asc' : 'desc',
      filter_field: JSON.stringify(activeFilters),
      ...(localInterface.search ? {search: localInterface.search} : {})
    };
    try {
      const { data: clients } = (await httpClient.post('/clients/report',qs.stringify(reqData))) as {data: ClientsReport}

      setReportData(clients)


    }
    catch (error) {

      nError(error)
    }
  }

  // Load clients on page mount

  useEffect(() => { loadClients()}, [
    $updater,
    localInterface.page
  ])
  // Is filter selected function
  function isFilterSelected(field: FilterWord, value: string) {
    return localInterface.filter_words[field].includes(value)
  }

  function isAllFiltersSelected(field: "source") {
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
      <div className="ClientsPage_List" >
      
        { /* Reports grid */}
        <div className="reports-grid">
        
          <div className="cell">

            <div className="amount">{reportData.dashboard.all}</div>
            <div className="legend">All Clients</div>
          </div>

          <div className="cell">

            <div className="amount">{reportData.dashboard.unpaid}</div>
            <div className="legend">Unpaid</div>
          </div>

          <div className="cell">

            <div className="amount">{reportData.dashboard.new_this_month}</div>
            <div className="legend">New This Month</div>
          </div>

          <div className="cell">

            <div className="amount">{reportData.dashboard.new_last_month}</div>
            <div className="legend">New Last Month</div>
          </div>
        </div>

        { /* Page header */}
        <div className="page-header">
          <h1>Clients</h1>
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
          onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {...localInterface.sort, direction: value}})}
          onSortFire={() => 0}

          addButton={(
            <div className="add-button-wrapper">
              <button className="_iconed _rounded add-button" onClick={() => $router.router.navigate('clients.new', {}, {reload: true})}>
                <Icon icon="plus-thin" />
                <span>Add Client</span>
                <Icon icon="user-29" />
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
                contents={(<span>Main phone</span>)}

                sortDirection={localInterface.sort.field === 'phone' ? localInterface.sort.direction : undefined}
                onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {field: 'phone', direction: value}})}

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
                contents={(<span>Jobs</span>)}

                sortDirection={localInterface.sort.field === 'jobs' ? localInterface.sort.direction : undefined}
                onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {field: 'jobs', direction: value}})}

                onFilterFire={() => $setUpdater(Math.random())}
              />
              <ReportTableField
                contents={(<span>Appointments</span>)}

                sortDirection={localInterface.sort.field === 'appointments' ? localInterface.sort.direction : undefined}
                onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {field: 'appointments', direction: value}})}

                onFilterFire={() => $setUpdater(Math.random())}
              />
              <ReportTableField
                contents={(<span>Recalls</span>)}

                sortDirection={localInterface.sort.field === 'recalls' ? localInterface.sort.direction : undefined}
                onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {field: 'recalls', direction: value}})}

                onFilterFire={() => $setUpdater(Math.random())}
              />
              <ReportTableField
                contents={(<span>Total</span>)}

                sortDirection={localInterface.sort.field === 'total' ? localInterface.sort.direction : undefined}
                onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {field: 'total', direction: value}})}

                onFilterFire={() => $setUpdater(Math.random())}
              />
              <ReportTableField
                contents={(<span>Paid</span>)}

                sortDirection={localInterface.sort.field === 'paid' ? localInterface.sort.direction : undefined}
                onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {field: 'paid', direction: value}})}

                onFilterFire={() => $setUpdater(Math.random())}
              />
              <ReportTableField
                contents={(<span>Unpaid</span>)}

                sortDirection={localInterface.sort.field === 'unpaid' ? localInterface.sort.direction : undefined}
                onSortDirectionChange={(value) => setLocalInterface({...localInterface, sort: {field: 'unpaid', direction: value}})}

                onFilterFire={() => $setUpdater(Math.random())}
              />
            </tr>
            {reportData.clients.map((client, i) => (
              <tr key={i} onClick={() => $router.router.navigate('clients.item', {
                clientId: client.client_id
              }, {reload: true})}>
                <td>{client.name}</td>
                <td>{client.main_phone}</td>
                <td>{client.source}</td>
                <td>{client.jobs}</td>
                <td>{client.appointments}</td>
                <td>{client.recalls}</td>
                <td>{client.total}</td>
                <td>{client.paid}</td>
                <td>{client.unpaid}</td>
              </tr>
            ))}
          </table>

          {/* Medium screen table */}
          <table className={classNames('table', '__hide-on-wide', '__hide-on-mobile', {
            __respectAsidePanel: props.store.navActive.is
          })}>
            <tr></tr>
            {reportData.clients.map((client, i) => (
              <tr key={i} onClick={() => $router.router.navigate('clients.item', {
                clientId: client.client_id
              }, {reload: true})}>
                <td>
                  <div>{client.name}</div>
                  <div>{client.main_phone}</div>
                </td>
                <td>
                  <div>{client.source}</div>
                  <div>Jobs: {client.jobs}</div>
                </td>
                <td>
                  <div>Appointments: {client.appointments}</div>
                  <div>Recalls: {client.recalls}</div>
                </td>
                <td>
                  <div>Total: {client.total}</div>
                  <div>Paid: {client.paid}</div>
                </td>
                <td>
                  <div>Unpaid: {client.unpaid}</div>
                  <div>&nbsp;</div>
                </td>
              </tr>
            ))}
          </table>

          {/* Mobile table items */}
          <div className={classNames('mobile-table-items', '__show-on-mobile', {
            __respectAsidePanel: props.store.navActive.is
          })}>

            {reportData.clients.map((client, i: number) => (
              <div className="item" key={i} onClick={() => $router.router.navigate('clients.item', {
                clientId: client.client_id
              }, {reload: true})}>

                <div className="__top">

                  <div className="__left">
                    <div><b>{client.name}</b></div>
                    <div>
                      {client.main_phone}
                    </div>
                  </div>

                  <div className="__right">
                    <div>
                      Total: <b>{client.total}</b>
                    </div>
                    <div>
                      Paid: <b>{client.paid}</b>
                    </div>
                    <div>
                      Unpaid: <b>{client.unpaid}</b>
                    </div>
                  </div>
                </div>

                <div className="__bottom">

                  <div className="__left">
                    <div>
                      <span className="gray">Jobs:</span>
                      <span> {client.jobs}</span>
                    </div>
                    <div>
                      <span className="gray">Recalls:</span>
                      <span> {client.recalls}</span>
                    </div>
                    <div>
                      <span className="gray">Appointments:</span>
                      <span> {client.appointments}</span>
                    </div>
                  </div>

                  <div className="__right small">
                    <div>
                      <b>{client.source}</b>
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
export default ClientsPage_List
