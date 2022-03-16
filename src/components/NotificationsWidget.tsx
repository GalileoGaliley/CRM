import React, { useState } from "react";
import { connect } from "react-redux";
import { StoreDispatch, StoreState, mapDispatchToProps, mapStateToProps } from "../store";
import Notification from "../models/Notification";

import "../styles/components/notifications-widget.sass"
import Icon from "./Icon"
import moment from "moment"

interface Props {
  store: StoreState,
  dispatcher: StoreDispatch
}

const NotificationsWidget = connect(mapStateToProps, mapDispatchToProps)(function(props: Props) {

  const [notifications, setNotifications] = useState<Notification[]>([{
    title: 'First notification',
    createdAt: new Date("2021-09-07")
  }, {
    title: 'Second notification',
    createdAt: new Date("2021-09-08")
  }, {
    title: 'Third notification',
    createdAt: new Date("2021-09-09")
  }, {
    title: 'Fourth notification',
    createdAt: new Date("2021-09-10")
  }, {
    title: 'Fifth notification',
    createdAt: new Date("2021-09-11")
  }, {
    title: 'Sixth notification',
    createdAt: new Date("2021-09-12")
  }, {
    title: 'Seventh notification',
    createdAt: new Date("2021-09-13")
  }, {
    title: 'Eight notification',
    createdAt: new Date("2021-09-14")
  }])
  
  // Render function
  return (
    <div className="NotificationsWidget">
      
      <div className="header">

        <div className="title">
          Notifications
        </div>

        <button className="_zeroed">
          Mark all as read
        </button>
      </div>

      <div className="notifications-list">

        {notifications.map((notification, i) => (
          <div className="notification" key={i}>
            <div className="icon">
              <Icon icon="bell-1"/>
            </div>

            <div className="contents">

              <div className="title">
                {notification.title}
              </div>

              <div className="timestamp">
                <Icon icon="speech-bubble-15" />
                <span>{moment(notification.createdAt).fromNow()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
})
export default NotificationsWidget
