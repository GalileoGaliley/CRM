import React, { ReactElement } from "react";
import { connect } from "react-redux";
import { StoreDispatch, StoreState, mapDispatchToProps, mapStateToProps } from "../../store";
import Icon from "../Icon"
import Select from "../Select"
import SortSelectComponent from "../SortSelect"

import "../../styles/components/reports/table-controls.sass"
import classNames from "classnames"

interface Props {
  store: StoreState,
  dispatcher: StoreDispatch,

  isUnder?: boolean,

  onMaxRowsChange(): void,

  amount: {

    total: number,
    start: number,
    end: number
  },

  page: number,
  maxPages: number,
  onPagesStart(): void,
  onNextPage(): void,
  onPrevPage(): void,
  onPagesEnd(): void,

  sort: {

    field: string,
    direction: 'up' | 'down'
  },
  sortFields: {
    span: string,
    value: string
  }[],
  onSortFieldChange(value: string): void,
  onSortDirectionChange(value: 'up' | 'down'): void,
  onSortFire(): void,

  zIndex?: number,

  addButton?: ReactElement
}

const ReportTableControls = connect(mapStateToProps, mapDispatchToProps)(function(props: Props) {

  return (
    <div className={classNames("ReportTableControls", {
      _under: props.isUnder,
      '__hide-on-mobile': props.isUnder,
      __respectAsidePanel: props.store.navActive.is
    })}>
      
      {props.addButton ? (
        <div className={classNames('__add-button', '__hide-on-wide', {
          __respectAsidePanel: props.store.navActive.is
        })}>
          {props.addButton}
        </div>
      ) : null}
      
      <div className="table-controls" style={{zIndex: props.zIndex}}>
        <div className="hint-text">
          Show rows:
        </div>
        <Select zeroed={true} options={[{
          span: "50",
          value: 50
        }, {
          span: "100",
          value: 100
        }, {
          span: "250",
          value: 250
        }, {
          span: "500",
          value: 500
        }]} selectedOption={props.store.reportsMaxRows} onChange={async (value: number) => {

          await props.dispatcher.setReportsMaxRows(value);
          props.onMaxRowsChange();
        }} />
        <div className="amount">
          {props.amount.start}-{props.amount.end} of {props.amount.total}
        </div>
        <div className="table-pages-nav __hide-on-mobile">
          <button className="_zeroed _iconed" disabled={props.page === 1} onClick={() => props.onPagesStart()}>
            <Icon className="_rotated-180" icon="arrow-31" />
          </button>
          <button className="_zeroed _iconed" disabled={props.page <= 1} onClick={() => props.onPrevPage()}>
            <Icon className="_rotated-180" icon="arrow-25" />
          </button>
          <button className="_zeroed _iconed" disabled={props.page >= props.maxPages} onClick={() => props.onNextPage()}>
            <Icon icon="arrow-25" />
          </button>
          <button className="_zeroed _iconed" disabled={props.page >= props.maxPages} onClick={() => props.onPagesEnd()}>
            <Icon icon="arrow-31" />
          </button>
        </div>

        {props.addButton ? (
          <div className={classNames('__add-button', '__show-on-wide', {
            __respectAsidePanel: props.store.navActive.is
          })}>
            {props.addButton}
          </div>
        ) : null}

        <div className={classNames('sort', '__hide-on-wide', {
          __respectAsidePanel: props.store.navActive.is
        })}>
          <span>Sort:</span>
          <SortSelectComponent options={props.sortFields} selectedOption={props.sort.field} onValueChange={props.onSortFieldChange} zeroed={true} selectedDirection={props.sort.direction} onDirectionChange={props.onSortDirectionChange} onFire={props.onSortFire} />
        </div>
      </div>

      <div className="table-controls-bottom-panel __show-on-mobile">
        <div className="results-amount">
          {props.amount.start}-{props.amount.end} of {props.amount.total}
        </div>
        <div className="pages-nav">
          <button className="_zeroed _iconed" disabled={props.page === 1} onClick={() => props.onPagesStart()}>
            <Icon className="_rotated-180" icon="arrow-31" />
          </button>
          <button className="_zeroed _iconed" disabled={props.page <= 1} onClick={() => props.onPrevPage()}>
            <Icon className="_rotated-180" icon="arrow-25" />
          </button>
          <button className="_zeroed _iconed" disabled={props.page >= props.maxPages} onClick={() => props.onNextPage()}>
            <Icon icon="arrow-25" />
          </button>
          <button className="_zeroed _iconed" disabled={props.page >= props.maxPages} onClick={() => props.onPagesEnd()}>
            <Icon icon="arrow-31" />
          </button>
        </div>
      </div>
    </div>
  )
})
export default ReportTableControls
