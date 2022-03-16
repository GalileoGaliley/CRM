import React from "react";
import { connect } from "react-redux";
import { StoreDispatch, StoreState, mapDispatchToProps, mapStateToProps } from "../store";

interface Props {
  store: StoreState,
  dispatcher: StoreDispatch
}

const SchedulePage = connect(mapStateToProps, mapDispatchToProps)(function(props: Props) {

  return (
    <div className="SchedulePage">
      Schedule page (was not created yet)
    </div>
  )
})
export default SchedulePage
