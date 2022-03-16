import React from "react"
import { connect } from "react-redux"
import { getActiveAccount, signOut } from "../funcs"
import { StoreDispatch, StoreState, mapDispatchToProps, mapStateToProps } from "../store"
import businessAccountIconImg from "../images/business-account_icon.svg"

import "../styles/components/account-menu.sass"
import Icon from "./Icon"

interface Props {
  store: StoreState,
  dispatcher: StoreDispatch,
  full?: boolean,
  onActiveNavButtonChange?: (mode: string) => void
}

const AccountMenu = connect(mapStateToProps, mapDispatchToProps)(function(props: Props) {

  return (
    <div className="AccountMenu">

      <div className="account-name">
        {`${props.store.user?.first_name} ${props.store.user?.last_name}`}
      </div>

      <div className="menu-buttons">

        <button className="_iconed">
          <div className="icon _light">
            <Icon icon="user-21" />
          </div>
          <span>Accounts</span>

          <div className="submenu">

            { props.store.accounts.map((account, i) => (
              <button
                className="_iconed"
                key={ i }
                onClick={ () => props.dispatcher.setSelectedAccount(i) }
              >
                <img src={ businessAccountIconImg } alt="" />
                <span>{ account.name }</span>
              </button>
            )) }
          </div>
        </button>

        {props.full ? (
          <button className="_iconed">
            <div className="icon">
              <Icon icon="phone-1" />
            </div>
            <span>Phone</span>
          </button>
        ) : null}

        {props.full ? (
          <button className="_iconed" onClick={() => props.onActiveNavButtonChange && props.onActiveNavButtonChange('helpMenu')}>
            <div className="icon">
              <Icon icon="help-1" />
            </div>
            <span>Support</span>
          </button>
        ) : null}

        {props.full ? (
          <button className="_iconed" onClick={() => props.onActiveNavButtonChange && props.onActiveNavButtonChange('notificationsWidget')}>
            <div className="icon">
              <Icon icon="bell-1" />
            </div>
            <span>Notifications</span>
          </button>
        ) : null}

        <button className="_iconed" onClick={ () => signOut(props.dispatcher) }>
          <div className="icon">
            <Icon icon="log-out-17" />
          </div>
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
})
export default AccountMenu
