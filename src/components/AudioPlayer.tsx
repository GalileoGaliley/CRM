import React, { useEffect, useRef, useState } from "react";
import { connect } from "react-redux";
import { calculateFromPercent, calculatePercent, formatTime } from "../funcs"
import { StoreDispatch, StoreState, mapDispatchToProps, mapStateToProps } from "../store";

import "../styles/components/audio-player.sass"
import Icon from "./Icon"

interface Props {
  store: StoreState,
  dispatcher: StoreDispatch,

  audioSrc: string,
  progress?: number,
  playing?: boolean
}

const AudioPlayer = connect(mapStateToProps, mapDispatchToProps)(function(props: Props) {

  const [rerender, setRerender] = useState(0)

  const $player = useRef<HTMLAudioElement>(null)
  const $playerSeeker = useRef<HTMLDivElement>(null)
  
  const [progress, setProgress] = useState(0)

  const [playing, setPlaying] = useState<boolean>(!!props.playing)

  // Set progress from prop
  useEffect(() => {
    setProgress(props.progress || 0)
  }, [props.progress])

  // Start or stop
  useEffect(() => {

    if (props.playing === undefined) return
    
    if(props.playing) $player.current?.play()
    else $player.current?.pause()

    setPlaying(props.playing)
  }, [props.playing])

  // On progress change
  function onProgressChange(event: React.SyntheticEvent<HTMLAudioElement, Event>) {
    setProgress(calculatePercent($player.current?.currentTime || 0, $player.current?.duration || 0))
  }

  // Seek function
  function seek(event: any) {

    let w100 = parseFloat(window.getComputedStyle($playerSeeker.current as any).width)
    let w = event.nativeEvent.offsetX

    let p = calculatePercent(w, w100);

    ($player.current as any).currentTime = calculateFromPercent(p, ($player.current as any).currentTime, ($player.current as any).duration)

  }

  // Render function
  return (
    <div className="AudioPlayer">

      <audio
        ref={$player}
        onTimeUpdate={onProgressChange}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onDurationChange={() => setRerender(Math.random())}
        onTimeUpdateCapture={() => setRerender(Math.random())}
      >
        <source src={props.audioSrc}/>
      </audio>
      
      {!playing ? (
        <button className="_zeroed _iconed play-switcher" onClick={() => $player.current?.play()}>
          <Icon icon="video-15" />
        </button>
      ) : (
        <button className="_zeroed _iconed play-switcher" onClick={() => $player.current?.pause()}>
          <Icon icon="media-control-49" />
        </button>
      )}

      <div className="time">{formatTime($player.current?.currentTime || 0)}</div>

      <div className="player-seeker" onClick={seek} ref={$playerSeeker}>
        <div className="seeker-progress" style={{width: `${progress}%`}}></div>
        <div className="seeker-notch" style={{left: `${progress}%`}}></div>
      </div>

      <div className="time">{formatTime($player.current?.duration || 0)}</div>
    </div>
  )
})
export default AudioPlayer
