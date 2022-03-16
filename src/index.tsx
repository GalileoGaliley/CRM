import React from "react"
import ReactDOM from "react-dom"
import { Provider as StorageProvider } from "react-redux"
import { RouterProvider } from "react-router5"
import { PersistGate } from "redux-persist/integration/react"
import App from "./App"
import router from "./router"
import { persistor, store } from "./store"

import "react-datetime/css/react-datetime.css"
import 'react-image-crop/dist/ReactCrop.css';
import "./styles/main.sass"

router.start(() => {
  ReactDOM.render(
    <StorageProvider store={ store }>
      <PersistGate loading={ null } persistor={ persistor }>
        <RouterProvider router={ router }>
          <App />
        </RouterProvider>
      </PersistGate>
    </StorageProvider>,
    document.getElementById("root")
  )
})
