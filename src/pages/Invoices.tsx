import React from "react";
import { connect } from "react-redux";
import { StoreDispatch, StoreState, mapDispatchToProps, mapStateToProps } from "../store";

interface Props {
  store: StoreState,
  dispatcher: StoreDispatch
}

const InvoicesPage = connect(mapStateToProps, mapDispatchToProps)(function(props: Props) {

  return (
    <div className="InvoicesPage">
      Invoices page (was not created yet)
    </div>
  )
})
export default InvoicesPage
