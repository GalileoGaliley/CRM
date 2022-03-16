import React, { ReactElement, useState } from "react";
import { connect } from "react-redux";
import Checkbox from "../Checkbox"
import Icon from "../Icon"
import { StoreDispatch, StoreState, mapDispatchToProps, mapStateToProps } from "../../store";
import classNames from "classnames"

import "../../styles/components/reports/table-field.sass"
import { Transition } from "react-transition-group"

type FilterWord = {
  word: string,
  selected: boolean
}

interface Props {
  store: StoreState,
  dispatcher: StoreDispatch,

  allFiltersSelected?: boolean,
  onAllFiltersChange?(value: boolean): void
  
  filterWords?: FilterWord[],
  onFilterChange?(value: FilterWord): void,
  onFilterFire?(): void

  contents: ReactElement,

  sortDirection?: 'up' | 'down',
  onSortDirectionChange?(value: 'up' | 'down'): void,

}

const ReportTableField = connect(mapStateToProps, mapDispatchToProps)(function(props: Props) {

  const [filterWrapperActive, setFilterWrapperActive] = useState(false)

  return (
    <th className="ReportTableField" onClick={() => { props.onSortDirectionChange && props.onSortDirectionChange(props.sortDirection === 'up' ? 'down' : 'up'); props.onFilterFire && props.onFilterFire() }}>
      <div className="flex-container">
        
        {(true
          && props.filterWords !== undefined
          && props.onFilterChange !== undefined
          && props.allFiltersSelected !== undefined
          && props.onAllFiltersChange !== undefined
        ) ? (
          <div tabIndex={-1} className="filter-button" onFocus={() => setFilterWrapperActive(true)} onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as any) && setFilterWrapperActive(false)} onClick={(e) => e.stopPropagation()}>
            <button className="_zeroed _iconed">
              {props.allFiltersSelected ? (
                <Icon icon="filter-2" />
              ) : (
                <Icon style={{fill: '#6093DE'}} icon="filter-8" />
              )}
            </button>

            <Transition in={filterWrapperActive} mountOnEnter={true} unmountOnExit={true} timeout={210}>
              {(state) => (
                <div className={ classNames("filter-wrapper", `transition-fade-${state}`) }>
                  <Checkbox contents="All" value={props.allFiltersSelected} onChange={(value) => (props.onAllFiltersChange as any)(value)} />
                  {(props.filterWords as FilterWord[]).map((filterWord, i) => (
                    <Checkbox key={`${filterWord}/${i}`} contents={filterWord.word} value={filterWord.selected} onChange={(value) => (props.onFilterChange as any)({...filterWord, selected: value})} />
                  ))}
                    <button className="_bordered _blue _wa" onClick={() => { setFilterWrapperActive(false); props.onFilterFire && props.onFilterFire() }}>
                    Filter
                  </button>
                </div>
              )}
            </Transition>
          </div>
        ) : null}

        {props.contents}

        {(true
          && props.sortDirection !== undefined
          && props.onSortDirectionChange !== undefined
        ) ? (
          <button className="_zeroed _iconed sort-button">
            <Icon icon="arrow-20" className={classNames({
              '_rotated-90': props.sortDirection === 'down',
              '_rotated-270': props.sortDirection === 'up',
            })} />
          </button>
        ) : null}
      </div>
    </th>
  )
})
export default ReportTableField
