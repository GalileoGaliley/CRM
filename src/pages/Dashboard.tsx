import React from "react";
import { connect } from "react-redux";
import { getActiveAccount } from "../funcs"
import { StoreDispatch, StoreState, mapDispatchToProps, mapStateToProps } from "../store";

interface Props {
  store: StoreState,
  dispatcher: StoreDispatch
}

const DashboardPage = connect(mapStateToProps, mapDispatchToProps)(function(props: Props) {

  return (
    <div className="DashboardPage">
      Dashboard page (was not created yet)

      <pre>
        Access token: { JSON.stringify(props.store.accessToken, null, 2) }
      </pre>
      <pre>
        Accounts: { JSON.stringify(props.store.accounts, null, 2) }
      </pre>
      <pre>
        Selected account: { JSON.stringify(getActiveAccount(props.store), null, 2) }
      </pre>
      <pre>
        User info: { JSON.stringify(props.store.user, null, 2) }
      </pre>
      <pre>
        Menus: { JSON.stringify(props.store.menus, null, 2) }
      </pre>
      <pre>
        Active menu: {props.store.navMode}
      </pre>
    </div>
  )
})
export default DashboardPage
