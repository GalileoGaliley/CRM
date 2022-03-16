import classNames from "classnames"
import React, { ReactChild, useEffect, useState } from "react";
import { connect } from "react-redux";
import { StoreDispatch, StoreState, mapDispatchToProps, mapStateToProps } from "../store";

import "../styles/components/checkbox.sass"
import Icon from "./Icon"

interface Props {
  store: StoreState,
  dispatcher: StoreDispatch,

  contents: ReactChild,
  value?: boolean,

  disabled?: boolean,

  onChange?(value: boolean): void
}

const Checkbox = connect(mapStateToProps, mapDispatchToProps)(function(props: Props) {

  const [active, setActive] = useState<boolean>(!!props.value)

  useEffect(() => {

    setActive(!!props.value)
  }, [props.value])

  // Render function
  return (
    <div className={classNames("Checkbox", { _active: active })} onClick={() => { !props.disabled && props.onChange && props.onChange(!active) }}>
      <Icon icon={ active ? 'checkbox-9' : 'square-5' }/>
      {props.contents ? (
        <div className="contents">
          {props.contents}
        </div>
      ) : null}
    </div>
  )
})
export default Checkbox
