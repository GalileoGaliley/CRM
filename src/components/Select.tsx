import classNames from "classnames"
import React, { useState } from "react";
import { connect } from "react-redux";
import Icon from "./Icon"
import { StoreDispatch, StoreState, mapDispatchToProps, mapStateToProps } from "../store";
import { Transition } from 'react-transition-group'

import "../styles/components/select.sass"

export interface Option {
  span: string,
  value: any
}

interface Props {
  store: StoreState,
  dispatcher: StoreDispatch,

  options: Option[],

  selectedOption: string | number | boolean,
  onChange(value: string | number | boolean): void,

  zeroed?: boolean,
  disabled?: boolean
}

const SelectComponent = connect(mapStateToProps, mapDispatchToProps)(function SelectComponent(props: Props) {

  const [active, setActive] = useState(false)

  // Get selected option function
  function getSelectedOption() {
    return props.options.find((option) => option.value === props.selectedOption) || {
      span: '',
      value: ''
    }
  }
  
  // Render function
  return (
    <div className="SelectComponent">
      <button disabled={props.disabled} className={classNames({_zeroed: props.zeroed}, '_iconed', 'sb')} onFocus={ () => setActive(true) } onBlur={ () => setActive(false) }>
        <span>{ getSelectedOption().span }</span>
        <Icon className={ classNames({ _flipped: active }) } icon="arrow-65" />
      </button>

      <Transition in={active} mountOnEnter={true} unmountOnExit={true} timeout={210}>
        {(state) => (
          <div className={ classNames("options-list-wrapper", `transition-fade-${state}`) }>

            { props.options.map((option, i) => (
              <button
                className={ classNames("_zeroed", "option", { _active: option.value === getSelectedOption().value }) }
                key={ i }
                onClick={ () => { setActive(false); props.onChange(option.value) } }
              >
                { option.span || <span>&nbsp;</span> }
              </button>
            )) }
          </div>
        )}
      </Transition>
    </div>
  )
})

export default SelectComponent
