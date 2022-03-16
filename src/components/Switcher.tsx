import classNames from "classnames"
import React from "react";
import { connect } from "react-redux";
import { StoreDispatch, StoreState, mapDispatchToProps, mapStateToProps } from "../store";

import "../styles/components/switcher.sass"

interface Props {
  store: StoreState,
  dispatcher: StoreDispatch,

  checked?: boolean,
  onChange(value: boolean): void,

  disabled?: boolean
}

const Switcher = connect(mapStateToProps, mapDispatchToProps)(function(props: Props) {

  return (
    <div className={classNames('Switcher', {
      _active: props.checked
    })} onClick={() => !props.disabled && props.onChange(!props.checked)}>
      <div className="notch"></div>
    </div>
  )
})
export default Switcher
