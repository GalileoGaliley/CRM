import classNames from "classnames"
import React, { ReactChild, useEffect, useState } from "react";
import { connect } from "react-redux";
import { StoreDispatch, StoreState, mapDispatchToProps, mapStateToProps } from "../store";

import "../styles/components/radio.sass"
import Icon from "./Icon"

interface Props {
  store: StoreState,
  dispatcher: StoreDispatch,

  contents: ReactChild,
  value?: boolean,

  onChange?(value: boolean): void
}

const Radio = connect(mapStateToProps, mapDispatchToProps)(function(props: Props) {

  const [active, setActive] = useState<boolean>(!!props.value)

  // Set local value from props
  useEffect(() => {
    setActive(!!props.value)
  }, [props.value])

  // Render function
  return (
    <div className={classNames("Radio", { _active: active })} onClick={() => { props.onChange && props.onChange(!active) }}>
      <Icon icon={ active ? 'check-mark-5' : 'circle-2' }/>
      <div className="contents">
        {props.contents}
      </div>
    </div>
  )
})
export default Radio
