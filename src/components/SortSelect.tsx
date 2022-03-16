import classNames from "classnames"
import React, { useState } from "react";
import { connect } from "react-redux";
import Icon from "./Icon"
import { StoreDispatch, StoreState, mapDispatchToProps, mapStateToProps } from "../store";
import { Transition } from 'react-transition-group'

import "../styles/components/select.sass"
import "../styles/components/sort-select.sass"
import Radio from "./Radio"

export interface Option {
  span: string,
  value: any
}

interface Props {
  store: StoreState,
  dispatcher: StoreDispatch,

  options: Option[],

  selectedOption: string | number | boolean,
  onValueChange(value: string | number | boolean): void,

  selectedDirection: "up" | "down"
  onDirectionChange(value: "up" | "down"): void

  zeroed?: boolean,
  disabled?: boolean,

  onFire(): void
}

const SortSelectComponent = connect(mapStateToProps, mapDispatchToProps)(function SortSelectComponent(props: Props) {

  const [active, setActive] = useState(false)

  // Get selected option function
  function getSelectedOption() {
    return props.options.find((option) => option.value === props.selectedOption) as Option
  }
  
  // Render function
  return (
    <div tabIndex={-1} className="SelectComponent SortSelectComponent" onFocus={() => setActive(true)} onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as any) && setActive(false)}>
      <button disabled={props.disabled} className={classNames({ _zeroed: props.zeroed }, '_iconed', 'sb')}>
        <Icon icon="arrow-20" className="_rotated-270" />
        <span>{ getSelectedOption().span }</span>
        <Icon className={ classNames({ _flipped: active }) } icon="arrow-65" />
      </button>

      <Transition in={active} mountOnEnter={true} unmountOnExit={true} timeout={210}>
        {(state) => (
          <div className={ classNames("options-list-wrapper", `transition-fade-${state}`) }>

            <div className="options-list">
              { props.options.map((option, i) => (
                <button
                  className={ classNames("_zeroed", "option", { _active: option.value === getSelectedOption().value }) }
                  key={ i }
                  onClick={ () => { props.onValueChange(option.value) } }
                >
                  { option.span }
                </button>
              )) }
            </div>

            <div className="direction-select">
              <Radio value={props.selectedDirection === 'up'} contents={(<Icon icon="arrow-20" className="_rotated-270" />)} onChange={(value) => props.onDirectionChange(value ? 'up' : 'down')}/>
              <Radio value={props.selectedDirection === 'down'} contents={(<Icon icon="arrow-20" className="_rotated-90"/>)} onChange={(value) => props.onDirectionChange(value ? 'down' : 'up')}/>
            </div>

            <div className="filter-button">
              <button className="_wa _bordered _blue" onClick={() => { setActive(false); props.onFire() }}>
                Sort
              </button>
            </div>
          </div>
        )}
      </Transition>
    </div>
  )
})

export default SortSelectComponent
