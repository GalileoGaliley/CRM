import React from "react";
import { connect } from "react-redux";
import { BaseLink, useRoute } from "react-router5"
import { StoreDispatch, StoreState, mapDispatchToProps, mapStateToProps } from "../store";

import "../styles/components/help-menu.sass"

interface Props {
  store: StoreState,
  dispatcher: StoreDispatch
}

const HelpMenu = connect(mapStateToProps, mapDispatchToProps)(function(props: Props) {

  const $router = useRoute()
  
  // Render function
  return (
    <div className="HelpMenu">
      
      <div className="title">
        Support
      </div>

      <nav>
        <BaseLink
          router={ $router.router }
          routeName="support.faq"
        >
          F.A.Q.
        </BaseLink>

        <BaseLink
          router={ $router.router }
          routeName="support.tickets"
        >
          Tickets
        </BaseLink>

        <BaseLink
          router={ $router.router }
          routeName="support.contacts"
        >
          Contacts
        </BaseLink>
      </nav>
    </div>
  )
})
export default HelpMenu
