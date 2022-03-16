import React from "react";
import { connect } from "react-redux";
import { StoreDispatch, StoreState, mapDispatchToProps, mapStateToProps } from "./store";

interface Props {
  store: StoreState,
  dispatcher: StoreDispatch
}

const App = connect(mapStateToProps, mapDispatchToProps)(function(props: Props) {

  return (
    <div className="App">
      Hello World
    </div>
  )
})
export default App
