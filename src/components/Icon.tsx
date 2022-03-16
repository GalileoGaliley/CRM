import React, { CSSProperties } from "react"
import icons from "../icons.svg"

interface Props {
  className?: string,
  icon: string,
  viewBox?: string,
  style?: CSSProperties
}

function Icon(props: Props): JSX.Element {

  return (
    <svg style={props.style} viewBox={ props.viewBox || "0 0 24 24" } className={ props.className }>
      <use xlinkHref={ `${icons}#${props.icon}` } />
    </svg>
  )
}

export default Icon
