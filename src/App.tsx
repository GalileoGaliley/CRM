import classNames from "classnames"
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { BaseLink, useRoute } from "react-router5"
import { Scrollbar } from "react-scrollbars-custom";
import Icon from "./components/Icon"
import { getActiveAccount, httpClient, signOut } from "./funcs";
import businessAccountIconImg from "./images/business-account_icon.svg";
import logoImg from "./images/logo.svg";
import AuthPage from "./pages/Auth"
import BookingPage from "./pages/Booking"
import DashboardPage from "./pages/Dashboard"
import EstimatesPage from "./pages/Estimates"
import InvoicesPage from "./pages/Invoices"
import PaymentsPage from "./pages/Payments"
import SchedulePage from "./pages/Schedule"
import SmsPage from "./pages/Sms"
import TicketsPage from "./pages/Tickets"
import { StoreDispatch, StoreState, mapDispatchToProps, mapStateToProps } from "./store";

import { Transition } from 'react-transition-group'
import AccountMenu from "./components/AccountMenu"
import HelpMenu from "./components/HelpMenu"
import SupportPage__Faq from "./pages/support/faq"
import SupportPage__Tickets from "./pages/support/tickets"
import SupportPage__Contacts from "./pages/support/contacts"
import NotificationsWidget from "./components/NotificationsWidget"
import AppointmentsPage_List from "./pages/Appointments/List"
import Account from "./models/Account"
import qs from "qs"
import Menus from "./models/Menus"
import User from "./models/User"
import ClientsPage_List from "./pages/Clients/List"
import AbsencesPage_List from "./pages/Absences/List"
import ListsPage_Appliances from "./pages/Lists/Appliances"
import ListsPage_Brands from "./pages/Lists/Brands"
import ListsPage_Sources from "./pages/Lists/Sources"
import ListsPage_Areas from "./pages/Lists/Areas"
import JobsPage_List from "./pages/Jobs/List"
import AbsencesPage_Item from "./pages/Absences/Item"
import JobsPage_Item from "./pages/Jobs/Item"
import Page403 from "./pages/Page403"
import CallsPage_List from "./pages/Calls/List"
import CallsSourcesPage_List from "./pages/Calls/SourcesList"
import CallsNumbersPage_List from "./pages/Calls/NumbersList"
import CallsAreaPage_List from "./pages/Calls/Area"
import PermissionsPage_List from "./pages/Permissions/List"
import PermissionsPage_Item from "./pages/Permissions/Item"
import PermissionsPage_New from "./pages/Permissions/New"
import UsersPage_List from "./pages/Users/List"
import UsersPage_New from "./pages/Users/New"
import UsersPage_Item from "./pages/Users/Item"
import AbsencesPage_New from "./pages/Absences/New"
import CallCenter_PhoneNumbersPage_List from "./pages/CallCenter/PhoneNumbers/List"
import CallCenter_DispatchersPage_List from "./pages/CallCenter/Dispatchers/List"
import CallCenter_CallGroupsPage_List from "./pages/CallCenter/CallGroups/List"
import CallCenter_SettingsPage_Item from "./pages/CallCenter/Settings"
import CallCenter_CallFlowsPage_List from "./pages/CallCenter/CallFlows/List"
import CallCenter_PhoneNumbersPage_New from "./pages/CallCenter/PhoneNumbers/New"
import CallCenter_DispatchersPage_New from "./pages/CallCenter/Dispatchers/New"
import CallCenter_CallGroupsPage_New from "./pages/CallCenter/CallGroups/New"
import CallCenter_PhoneNumbersPage_Item from "./pages/CallCenter/PhoneNumbers/Item"
import CallCenter_DispatchersPage_Item from "./pages/CallCenter/Dispatchers/Item"
import CallCenter_CallGroupsPage_Item from "./pages/CallCenter/CallGroups/Item"
import AccountPermissionsPage_List from "./pages/AccountPermissions/List"
import AccountPermissionsPage_Item from "./pages/AccountPermissions/Item"
import AccountPermissionsPage_New from "./pages/AccountPermissions/New"
import AccountsPage_List from "./pages/Accounts/List"
import AccountsPage_Item from "./pages/Accounts/Item"
import AccountsPage_New from "./pages/Accounts/New"
import ServiceResourcesPage_List from "./pages/ServiceResources/List"
import ServiceResourcesPage_Item from "./pages/ServiceResources/Item"
import ServiceResourcesPage_New from "./pages/ServiceResources/New"
import CallCenter_CallFlowsPage_Item from "./pages/CallCenter/CallFlows/Item"
import CallCenter_CallFlowsPage_New from "./pages/CallCenter/CallFlows/New"
import ClientsPage_Item from "./pages/Clients/Item"
import AppointmentsPage_Item from "./pages/Appointments/Item"
import ClientsPage_New from "./pages/Clients/New"
import router from "./router";


interface Props {
  store: StoreState,
  dispatcher: StoreDispatch
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const App = connect(mapStateToProps, mapDispatchToProps)(function App(props: Props) {

  const $router = useRoute()

  const [activeNavButton, setActiveNavButton] = useState<string | null>(null)
  const [searchPanelExpanded, setSearchPanelExpanded] = useState(false)

  // Is page is permitted to access function
  const isPageAllowed = (page: string) => {

    if(!props.store.menus) return null

    let pages = []

    for (let [key, value] of Object.entries(props.store.menus)) {

      for (let [_key, _value] of Object.entries(value)) {
        
        pages.push((_value as any).name)
      }
    }

    return pages.includes(page.split('.')[0])
  }

  const isNavItemAllowed = (page: string) =>
    props.store.menus ? props.store.menus[props.store.navMode].findIndex((item) => item.name === page.split('.')[0]) !== -1 : null

  function onNavSwitchNotchHover() {
    props.dispatcher.setNavActive({
      floating: true,
      is: true
    })
  }

  function onNavSwitchNotchLeft() {
    if (!props.store.navActive.floating) return;

    props.dispatcher.setNavActive({
      floating: true,
      is: false
    })

    setTimeout(() => {
      props.dispatcher.setNavActive({
        floating: false,
        is: false
      })
    }, 210)
  }

  // Redirect if no auth function
  function redirectIfNoAuth() {
    if (
      ![
        'auth'
      ].includes($router.route.name) &&
      !props.store.accessToken
    ) {
      $router.router.navigate('auth')
    }
  }
  useEffect(redirectIfNoAuth, [])

  // Handle account changing
  useEffect(() => {
    if (props.store.selectedAccount === null) return
    let SA : number = props.store.selectedAccount;
    const activeAccount = getActiveAccount(props.store) as Account

    let $user: User

    // Get user info
    httpClient.post('/users/profile', qs.stringify({ account_id: activeAccount.account_id }), {
      headers: {
        'Accept': 'application/jsons',
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    }).then(({ data: { user } }) => {

      $user = user[SA]

      // Get user menus
      return httpClient.get(`/menus/${user[SA].user_id}`)
    }).then(({data: menus}) => {
      for (let i = 0; i < menus.main.length; i++){
          if(menus.main[i].name == "sms" || menus.main[i].name == 'sms'){
              menus.main.splice(i, 1);
          }
      }

      props.dispatcher.setUser($user);

      props.dispatcher.setMenus(menus);
      // Redirect to dashboard
      if (props.store.redirectRoute) {
        $router.router.navigate(props.store.redirectRoute.name, props.store.redirectRoute.params, {reload: true});
      }
      else {
        $router.router.navigate('dashboard', {}, {
          reload: true
        })
      }
    })

  }, [props.store.selectedAccount])

  // Handle account select on mount
  useEffect(() => {

    if (
      props.store.accessToken &&
      !props.store.user &&
      $router.route.name !== 'auth'
    ) {

      httpClient.defaults.headers['Authorization'] = `Bearer ${props.store.accessToken}`

      props.dispatcher.setRedirectRoute($router.router.getState())

      $router.router.navigate('auth', {
        mode: 'account-select'
      }, {reload: true})
    }
  }, [])

  // Handle route name changes
  useEffect(() => {

    httpClient.defaults.headers['Authorization'] = `Bearer ${props.store.accessToken}`

    // Close nav and other widgets on mobile devices
    if (window.innerWidth < 768) {
      props.dispatcher.setNavActive({
        floating: false,
        is: false
      })
      setActiveNavButton(null)
    }

    // Handle page permission
    if (!['auth', 'dashboard', '403'].includes($router.router.getState().name)) {

      if (isPageAllowed($router.router.getState().name) === false) {
        $router.router.navigate('403')
      }
    }
  }, [$router.route.name])

  // Redirect to auth page function

  
  // Render function
  return (<>
    
    { /* Header */ }
    { props.store.user ? (
      <header>

        { /* Project about */ }
        <div className="ProjectHeaders">

          { /* Mobile nav switcher */ }
          <button
            className={ classNames(["_zeroed", "_iconed", "mobile-nav-switcher", { _active: props.store.navActive.is }]) }
            onClick={(e) => { e.stopPropagation(); props.dispatcher.setNavActive({ ...props.store.navActive, is: !props.store.navActive.is }) } }
          >
            <Icon icon="menu-1" />
          </button>
          <img src={ logoImg } alt="" onClick={() => $router.router.navigate('dashboard', {}, {reload: true})} />

          <div className="headers" onClick={() => $router.router.navigate('dashboard', {}, {reload: true})}>
            <h1>Expert @ FS</h1>
            <h2>Manage your business!</h2>
          </div>

          { /* Mobile header account menu */ }
          <div className="mobile-account-menu-switcher">

            <button
              className="_zeroed _iconed"
              onClick={(e) => { e.stopPropagation(); setActiveNavButton(activeNavButton ? null : 'mobileAccountMenu') }}
            >
              <Icon icon="user-20" />
            </button>

            <Transition in={activeNavButton === "mobileAccountMenu"} timeout={210} mountOnEnter={true} unmountOnExit={true}>
              {(state) => (
                <div style={{width: '180px'}} className={classNames("menu-container", "_approach-left", `transition-fade-${state}`)}>
                  <AccountMenu full={true} onActiveNavButtonChange={setActiveNavButton} />
                </div>
              )}
            </Transition>

          </div>
        </div>

        { /* Nav switch button */ }
        <div className="nav-switch-button">
          <button
            className={ classNames(["_iconed", "_zeroed", { _active: props.store.navActive.is }]) }
            onClick={ () => props.dispatcher.setNavActive({ ...props.store.navActive, is: !props.store.navActive.is }) }
          >
            <Icon icon="menu-1" />
          </button>
        </div>

        { /* Search panel */ }
        <div className={ classNames(["search-panel", { _forcedShown: props.store.navActive.is }]) }>
          <button
            className="_iconed _zeroed"
            onClick={ () => setSearchPanelExpanded(!searchPanelExpanded) }
          >
            <Icon icon="magnifier-5" />
          </button>

          <div className={ classNames(["search-input", { _shown: searchPanelExpanded }]) }>
            <input type="text" />
            <button className="_iconed _wa">
              <Icon icon="magnifier-5" />
            </button>
          </div>
        </div>

        { /* Nav switchers */ }
        <div className={ classNames(["nav-switchers", { _forcedShown: props.store.navActive.is }]) }>

          <button
            className={classNames({ _active: props.store.navMode === "main" })}
            onClick={() => props.dispatcher.setNavMode("main")}
          >
            <Icon icon="logo" viewBox="0 0 63.31 69.32" />
          </button>

          <button>
            <Icon icon="email-1" />
          </button>

          <button
            className={classNames({ _active: props.store.navMode === "settings" })}
            onClick={() => props.dispatcher.setNavMode("settings")}
          >
            <Icon icon="gear-1" />
          </button>
        </div>

        { /* Nav buttons */ }
        <div className="nav-buttons">
          <div>
            <button
              className={classNames("_zeroed", "_iconed", { _active: activeNavButton === "helpMenu" })}
              onClick={() => setActiveNavButton('helpMenu')}
            >
              <Icon icon="help-1" />
            </button>

            <Transition in={activeNavButton === "helpMenu"} timeout={210} mountOnEnter={true} unmountOnExit={true}>
              {(state) => (
                <div style={{width: '210px'}} className={classNames("menu-container", "_approach-left", `transition-fade-${state}`)}>
                  <HelpMenu />
                </div>
              )}
            </Transition>
          </div>
          <div>
            <button
              className={classNames("_zeroed", "_iconed", { _active: activeNavButton === "notificationsWidget" })}
              onClick={() => setActiveNavButton('notificationsWidget')}
            >
              <Icon icon="bell-1" />
            </button>

            <Transition in={activeNavButton === "notificationsWidget"} timeout={210} mountOnEnter={true} unmountOnExit={true}>
              {(state) => (
                <div style={{width: '250px'}} className={classNames("menu-container", "_approach-left", `transition-fade-${state}`)}>
                  <NotificationsWidget />
                </div>
              )}
            </Transition>
          </div>

          <div className="__account-menu-switcher">

            <button
              className={classNames("_zeroed", "_iconed")}
              onClick={() => setActiveNavButton('accountMenu')}
            >
              <Icon icon="user-20" />
            </button>

            <Transition in={activeNavButton === "accountMenu"} timeout={210} mountOnEnter={true} unmountOnExit={true}>
              {(state) => (
                <div style={{width: '180px'}} className={classNames("menu-container", "_approach-left", `transition-fade-${state}`)}>
                  <AccountMenu />
                </div>
              )}
            </Transition>
          </div>
          <div>
            <button className="_zeroed _iconed">
              <Icon icon="phone-6" />
            </button>
          </div>
        </div>
      </header>
    ) : null }

    { /* Main block */ }
    <main className={classNames({_authPage: $router.route.name === 'auth'})}>

      { /* Aside panel */ }
      {props.store.user ? (
        <aside
          className={classNames({ _active: props.store.navActive.is, _floating: props.store.navActive.floating })}
          onMouseLeave={() => onNavSwitchNotchLeft()}
        >
          { /* Aside navigation */}
          <Scrollbar
            renderer={props => {
              const { elementRef, ...restProps } = props
              return <nav {...restProps} ref={elementRef} />
            }}
          >
            {props.store.navMode === "main" ? (
              <BaseLink
                router={$router.router}
                routeName="dashboard"
                className={classNames({ _active: $router.route.name === "dashboard" })}
              >
                <Icon icon="chart-5" />
                <span>Dashboard</span>
                <div className="__bg"></div>
              </BaseLink>
            ) : null}

            {props.store.menus ? (<>
              {isNavItemAllowed('schedule') ? (
                <BaseLink
                  router={$router.router}
                  routeName="schedule"
                  className={classNames({ _active: $router.route.name === "schedule" })}
                >
                  <Icon icon="calendar-4" />
                  <span>Schedule</span>
                  <div className="__bg"></div>
                </BaseLink>
              ) : null}

              {isNavItemAllowed('booking') ? (
                <BaseLink
                  router={$router.router}
                  routeName="booking"
                  className={classNames({ _active: $router.route.name === "booking" })}
                >
                  <Icon icon="calendar-9" />
                  <span>Booking</span>
                  <div className="__bg"></div>
                </BaseLink>
              ) : null}

              {isNavItemAllowed('calls') ? (
                <BaseLink
                  router={$router.router}
                  routeName="calls"
                  className={classNames({ _active: $router.route.name.startsWith('calls') })}
                >
                  <Icon icon="phone-1" />
                  <span>Calls</span>
                  <div className="__bg"></div>
                </BaseLink>
              ) : null}

              {isNavItemAllowed('sms') ? (
                <BaseLink
                  router={$router.router}
                  routeName="sms"
                  className={classNames({ _active: $router.route.name === "sms" })}
                >
                  <Icon icon="sms-6" />
                  <span>SMS</span>
                  <div className="__bg"></div>
                </BaseLink>
              ) : null}

              {isNavItemAllowed('clients') ? (
                <BaseLink
                  router={$router.router}
                  routeName="clients"
                  className={classNames({ _active: $router.route.name === "clients" })}
                >
                  <Icon icon="user-29" />
                  <span>Clients</span>
                  <div className="__bg"></div>
                </BaseLink>
              ) : null}

              {isNavItemAllowed('appointments') ? (
                <BaseLink
                  router={$router.router}
                  routeName="appointments"
                  className={classNames({ _active: $router.route.name === "appointments" })}
                >
                  <Icon icon="calendar-6" />
                  <span>Appointments</span>
                  <div className="__bg"></div>
                </BaseLink>
              ) : null}

              {isNavItemAllowed('jobs') ? (
                <BaseLink
                  router={$router.router}
                  routeName="jobs"
                  className={classNames({ _active: $router.route.name === "jobs" })}
                >
                  <Icon icon="wrench-25" />
                  <span>Jobs</span>
                  <div className="__bg"></div>
                </BaseLink>
              ) : null}

              {isNavItemAllowed('estimates') ? (
                <BaseLink
                  router={$router.router}
                  routeName="estimates"
                  className={classNames({ _active: $router.route.name === "estimates" })}
                >
                  <Icon icon="calculator-6" />
                  <span>Estimates</span>
                  <div className="__bg"></div>
                </BaseLink>
              ) : null}

              {isNavItemAllowed('invoices') ? (
                <BaseLink
                  router={$router.router}
                  routeName="invoices"
                  className={classNames({ _active: $router.route.name === "invoices" })}
                >
                  <Icon icon="currency-3" />
                  <span>Invoices</span>
                  <div className="__bg"></div>
                </BaseLink>
              ) : null}

              {isNavItemAllowed('payments') ? (
                <BaseLink
                  router={$router.router}
                  routeName="payments"
                  className={classNames({ _active: $router.route.name === "payments" })}
                >
                  <Icon icon="coin-6" />
                  <span>Payments</span>
                  <div className="__bg"></div>
                </BaseLink>
              ) : null}

              {isNavItemAllowed('absences') ? (
                <BaseLink
                  router={$router.router}
                  routeName="absences"
                  className={classNames({ _active: $router.route.name === "absences" })}
                >
                  <Icon icon="time-16" />
                  <span>Absences</span>
                  <div className="__bg"></div>
                </BaseLink>
              ) : null}

              {isNavItemAllowed('tickets') ? (
                <BaseLink
                  router={$router.router}
                  routeName="tickets"
                  className={classNames({ _active: $router.route.name === "tickets" })}
                >
                  <Icon icon="debit-4" />
                  <span>Tickets</span>
                  <div className="__bg"></div>
                </BaseLink>
              ) : null}

              {isNavItemAllowed('lists') ? (
                <BaseLink
                  router={$router.router}
                  routeName="lists"
                  className={classNames({ _active: $router.route.name.startsWith('lists') })}
                >
                  <Icon icon="task-1" />
                  <span>Lists</span>
                  <div className="__bg"></div>
                </BaseLink>
              ) : null}

              {isNavItemAllowed('users') ? (
                <BaseLink
                  router={$router.router}
                  routeName="users"
                  className={classNames({ _active: $router.route.name.startsWith('users') })}
                >
                  <Icon icon="user-21" />
                  <span>Users</span>
                  <div className="__bg"></div>
                </BaseLink>
              ) : null}

              {isNavItemAllowed('accounts') ? (
                <BaseLink
                  router={$router.router}
                  routeName="accounts"
                  className={classNames({ _active: $router.route.name.startsWith('accounts') && $router.route.name[8] !== '_' })}
                >
                  <Icon icon="building-20" />
                  <span>Accounts</span>
                  <div className="__bg"></div>
                </BaseLink>
              ) : null}

              {isNavItemAllowed('permissions') ? (
                <BaseLink
                  router={$router.router}
                  routeName="permissions"
                  className={classNames({ _active: $router.route.name.startsWith('permissions') })}
                >
                  <Icon icon="key-3" />
                  <span>Permissions</span>
                  <div className="__bg"></div>
                </BaseLink>
              ) : null}

              {isNavItemAllowed('accounts_permissions') ? (
                <BaseLink
                  router={$router.router}
                  routeName="accounts_permissions"
                  className={classNames({ _active: $router.route.name.startsWith('accounts_permissions') })}
                >
                  <Icon icon="lock-7" />
                  <span>Account`s Permissions</span>
                  <div className="__bg"></div>
                </BaseLink>
              ) : null}

              {isNavItemAllowed('call_center') ? (
                <BaseLink
                  router={$router.router}
                  routeName="call_center"
                  className={classNames({ _active: $router.route.name.startsWith('call_center') })}
                >
                  <Icon icon="delivery-8" />
                  <span>Call Center</span>
                  <div className="__bg"></div>
                </BaseLink>
              ) : null}

              {isNavItemAllowed('service_resources') ? (
                <BaseLink
                  router={$router.router}
                  routeName="service_resources"
                  className={classNames({ _active: $router.route.name.startsWith('service_resources') })}
                >
                  <Icon icon="construction-3" />
                  <span>Service Resources</span>
                  <div className="__bg"></div>
                </BaseLink>
              ) : null}
            </>) : null}
          </Scrollbar>
        </aside>
      ) : null}

      { /* Section */ }
      <section className={classNames('pageSection', {__withNav: props.store.navActive.is})}>
        
        { /* Pages */ }
        { !props.store.user && $router.route.name === "auth" && <AuthPage /> }
        { $router.route.name === "403" && <Page403 /> }

        {props.store.user ? (<>
          { $router.route.name === "dashboard" && <DashboardPage /> }
          { $router.route.name === "schedule" && <SchedulePage /> }
          { $router.route.name === "booking" && <BookingPage /> }

          { $router.route.name === "calls" && <CallsPage_List /> }
          { $router.route.name === "calls.sources" && <CallsSourcesPage_List /> }
          { $router.route.name === "calls.numbers" && <CallsNumbersPage_List /> }
          { $router.route.name === "calls.areas" && <CallsAreaPage_List /> }

          { $router.route.name === "permissions" && <PermissionsPage_List /> }
          { $router.route.name === "permissions.item" && <PermissionsPage_Item /> }
          { $router.route.name === "permissions.new" && <PermissionsPage_New /> }

          { $router.route.name === "accounts_permissions" && <AccountPermissionsPage_List /> }
          { $router.route.name === "accounts_permissions.item" && <AccountPermissionsPage_Item /> }
          { $router.route.name === "accounts_permissions.new" && <AccountPermissionsPage_New /> }

          { $router.route.name === "users" && <UsersPage_List /> }
          { $router.route.name === "users.new" && <UsersPage_New /> }
          { $router.route.name === "users.item" && <UsersPage_Item /> }

          { $router.route.name === "accounts" && <AccountsPage_List /> }
          { $router.route.name === "accounts.item" && <AccountsPage_Item /> }
          { $router.route.name === "accounts.new" && <AccountsPage_New /> }

          { $router.route.name === "service_resources" && <ServiceResourcesPage_List /> }
          { $router.route.name === "service_resources.item" && <ServiceResourcesPage_Item /> }
          { $router.route.name === "service_resources.new" && <ServiceResourcesPage_New /> }

          {$router.route.name === "sms" && <SmsPage />}
          
          { $router.route.name === "clients" && <ClientsPage_List /> }
          {$router.route.name === "clients.item" && <ClientsPage_Item />}
          {$router.route.name === "clients.new" && <ClientsPage_New />}
          
          { $router.route.name === "appointments" && <AppointmentsPage_List /> }
          { $router.route.name === "appointments.item" && <AppointmentsPage_Item /> }
          
          { $router.route.name === "jobs" && <JobsPage_List /> }
          { $router.route.name === "jobs.item" && <JobsPage_Item /> }
          { $router.route.name === "estimates" && <EstimatesPage /> }
          { $router.route.name === "invoices" && <InvoicesPage /> }
          { $router.route.name === "payments" && <PaymentsPage /> }

          { $router.route.name === "absences" && <AbsencesPage_List /> }
          { $router.route.name === "absences.item" && <AbsencesPage_Item /> }
          { $router.route.name === "absences.new" && <AbsencesPage_New /> }

          { $router.route.name === "tickets" && <TicketsPage /> }

          { $router.route.name === "support.faq" && <SupportPage__Faq /> }
          { $router.route.name === "support.tickets" && <SupportPage__Tickets /> }
          { $router.route.name === "support.contacts" && <SupportPage__Contacts /> }

          { $router.route.name === "lists" && $router.router.navigate('lists.appliances', {}, {reload: true}) && null }
          { $router.route.name === "lists.appliances" && <ListsPage_Appliances /> }
          { $router.route.name === "lists.brands" && <ListsPage_Brands /> }
          { $router.route.name === "lists.sources" && <ListsPage_Sources /> }
          { $router.route.name === "lists.areas" && <ListsPage_Areas /> }

          { $router.route.name === "call_center.phoneNumbers" && <CallCenter_PhoneNumbersPage_List /> }
          { $router.route.name === "call_center.phoneNumbers.new" && <CallCenter_PhoneNumbersPage_New /> }
          { $router.route.name === "call_center.phoneNumbers.item" && <CallCenter_PhoneNumbersPage_Item /> }

          { $router.route.name === "call_center.dispatchers" && <CallCenter_DispatchersPage_List /> }
          { $router.route.name === "call_center.dispatchers.new" && <CallCenter_DispatchersPage_New /> }
          { $router.route.name === "call_center.dispatchers.item" && <CallCenter_DispatchersPage_Item /> }

          { $router.route.name === "call_center.groups" && <CallCenter_CallGroupsPage_List /> }
          { $router.route.name === "call_center.groups.new" && <CallCenter_CallGroupsPage_New /> }
          { $router.route.name === "call_center.groups.item" && <CallCenter_CallGroupsPage_Item /> }

          { $router.route.name === "call_center.callFlows" && <CallCenter_CallFlowsPage_List /> }
          { $router.route.name === "call_center.callFlows.item" && <CallCenter_CallFlowsPage_Item /> }
          { $router.route.name === "call_center.callFlows.new" && <CallCenter_CallFlowsPage_New /> }

          { $router.route.name === "call_center.settings" && <CallCenter_SettingsPage_Item /> }
        </>) : null}

        { /* Page darker */ }
        {props.store.user ? (
          <div
            onClick={ () => setActiveNavButton(null) }
            className={ classNames( ["darker", { _shown: activeNavButton }] ) }
          />
        ) : null}
      </section>

      { /* Nav switch notch */ }
      {props.store.user ? (
        <button
          className="_iconed _zeroed nav-switch-notch"
          onMouseOver={ () => onNavSwitchNotchHover() }
          onFocus={ () => void 0 }
        >
          <Icon icon="_notch" viewBox="0 0 10.34 29.25" />
        </button>
      ) : null}

      {/* Mobile menu container */}
      <Transition in={![null, "mobileAccountMenu"].includes(activeNavButton)} timeout={210} mountOnEnter={true} unmountOnExit={true}>
        {(state) => (
          <div className={classNames("mobile-menu-container", `transition-fade-${state}`)}>
            {activeNavButton === "helpMenu" ? <HelpMenu /> : null}
            {activeNavButton === "notificationsWidget" ? <NotificationsWidget /> : null}
          </div>
        )}
      </Transition>
    </main>
  </>)
})
export default App
