import React from "react";
import { connect } from "react-redux";
import { StoreDispatch, StoreState, mapDispatchToProps, mapStateToProps } from "../../store";

interface Props {
  store: StoreState,
  dispatcher: StoreDispatch
}

const SupportPage__Faq = connect(mapStateToProps, mapDispatchToProps)(function(props: Props) {

  return (
    <div className="SupportPage__Faq">
      FAQ page (was not created yet)
    </div>
  )
})
export default SupportPage__Faq
