import React from "react";
import { connect } from "react-redux";
import { StoreDispatch, StoreState, mapDispatchToProps, mapStateToProps } from "../store";

interface Props {
  store: StoreState,
  dispatcher: StoreDispatch
}

const TicketsPage = connect(mapStateToProps, mapDispatchToProps)(function(props: Props) {

  return (
    <div className="TicketsPage">
      Tickets page (was not created yet)
    </div>
  )
})
export default TicketsPage
