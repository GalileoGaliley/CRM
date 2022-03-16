import React from "react";
import { connect } from "react-redux";
import { StoreDispatch, StoreState, mapDispatchToProps, mapStateToProps } from "../store";

interface Props {
  store: StoreState,
  dispatcher: StoreDispatch
}

const Page403 = connect(mapStateToProps, mapDispatchToProps)(function(props: Props) {

  return (
    <div className="Page403">
      You don`t have permission to access this page
    </div>
  )
})
export default Page403
