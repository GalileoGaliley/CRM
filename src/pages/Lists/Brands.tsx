import classNames from "classnames"
import React, { useState } from "react";
import { connect } from "react-redux";
import { BaseLink, useRoute } from "react-router5"
import Icon from "../../components/Icon"
import { StoreDispatch, StoreState, mapDispatchToProps, mapStateToProps } from "../../store";

import "../../styles/pages/lists.sass"

interface Props {
  store: StoreState,
  dispatcher: StoreDispatch
}

const ListsPage_Brands = connect(mapStateToProps, mapDispatchToProps)(function(props: Props) {

  const $router = useRoute()

  const [newItemForm, setNewItemForm] = useState({
    name: ''
  })

  const [editItemForm, setEditItemForm] = useState({
    name: ''
  })

  const [items, setItems] = useState([{
    name: 'Hello World',

    editing: false
  }])

  // Add item function
  function addItem() {

    let { name } = newItemForm
    
    let _items = [...items]
    _items.unshift({
      name,

      editing: false
    })

    setItems(_items)

    setNewItemForm({
      ...newItemForm,
      name: ''
    })
  }

  // Remove item function
  function removeItem(i: number) {

    let _items = [...items]
    _items.splice(i, 1)
    setItems(_items)
  }

  // Set editing function
  function setEditing(i: number, flag: boolean) {

    let _items = [...items]
    _items = _items.map((item) => ({...item, editing: false}))
    _items[i].editing = flag
    setItems(_items)

    setEditItemForm({
      ...editItemForm,
      name: flag ? _items[i].name : ''
    })
  }

  // Set item function
  function setItem(i: number) {

    let _items = [...items]
    _items[i] = {
      name: editItemForm.name,
      editing: false
    }
    setItems(_items)
  }
  
  // Render function
  return (
    <div className="ListsPage_Brands">
      
      {/* Top navigation */}
      <div className="top-nav">
        <BaseLink router={$router.router} routeName="lists.appliances" className={classNames({_active: $router.route.name === "tasks.appliances"})}>
          <Icon icon="task-1" />
          <span>Appliances</span>
        </BaseLink>

        <BaseLink router={$router.router} routeName="lists.brands" className={classNames({_active: $router.route.name === "tasks.brands"})}>
          <Icon icon="task-1" />
          <span>Brands</span>
        </BaseLink>

        <BaseLink router={$router.router} routeName="lists.sources" className={classNames({_active: $router.route.name === "tasks.sources"})}>
          <Icon icon="task-1" />
          <span>Sources</span>
        </BaseLink>

        <BaseLink router={$router.router} routeName="lists.areas" className={classNames({_active: $router.route.name === "tasks.areas"})}>
          <Icon icon="task-1" />
          <span>Areas</span>
        </BaseLink>
      </div>

      {/* Contents */}
      <div className="wrapper">

        <div className="flex-container sb header">
          <h1>List of Brands</h1>

          <form onSubmit={(e) => { e.preventDefault(); addItem()}}>
            <div className="label">Name:</div>
            <input type="text" value={newItemForm.name} onChange={({target: {value}}) => setNewItemForm({...newItemForm, name: value})} />
            <button className="_wa _green" disabled={newItemForm.name.length < 1}>Add</button>
          </form>
        </div>

        {/* Table */}
        <table className="table">
          <tr>
            <th style={{width: '100%'}}>Name</th>
            <th></th>
            <th></th>
          </tr>
          {items.map((item, i) => (<React.Fragment key={i}>
            {item.editing ? (
              <tr>
                <td>
                  <div className="editing-form">
                    <input className="_zeroed" type="text" defaultValue={editItemForm.name} onChange={({target: {value}}) => setEditItemForm({...editItemForm, name: value})} />
                    <button className="_zeroed _iconed _red" onClick={() => setEditing(i, false)}>
                      <Icon icon="pencil-16" />
                    </button>
                  </div>
                </td>
                <td>
                  <button className="_zeroed _iconed _green" onClick={() => setItem(i)}>
                    <Icon icon="check-mark-1" />
                  </button>
                </td>
                <td>
                  <button className="_zeroed _iconed _red" onClick={() => removeItem(i)}>
                    <Icon icon="x-mark-1" />
                  </button>
                </td>
              </tr>
            ) : (
              <tr key={i}>
                <td>{item.name}</td>
                <td>
                  <button className="_zeroed _iconed _blue" onClick={() => setEditing(i, true)}>
                    <Icon icon="pencil-14" />
                  </button>
                </td>
                <td>
                  <button className="_zeroed _iconed _red" onClick={() => removeItem(i)}>
                    <Icon icon="x-mark-1" />
                  </button>
                </td>
              </tr>
            )}
          </React.Fragment>))}
        </table>
      </div>
    </div>
  )
})
export default ListsPage_Brands
