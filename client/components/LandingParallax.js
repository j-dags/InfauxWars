import React from 'react'
import {useSpring, animated as a} from 'react-spring'
import {Background, Person, Icons, Posts, SpeechBubbles, Stars} from '../SVG'
import './LandingParallax.css' // // Icons made by Freepik from www.flaticon.com

const calc = (x, y) => [x - window.innerWidth / 2, y - window.innerHeight / 2]
const trStars = (x, y) => `translate3d(${x / 60}px,${y / 60}px,0)`
const trBackground = (x, y) => `translate3d(${x / 30}px,${y / 30}px,0)`
const trPosts = (x, y) => `translate3d(${x / 20}px,${y / 20}px,0)`
const trPerson = (x, y) => `translate3d(${x / 25}px,${y / 25}px,0)`
const trIcons = (x, y) => `translate3d(${x / 8}px,${y / 8}px,0)`
const trSpeechBubbles = (x, y) => `translate3d(${x / 11}px,${y / 11}px,0)`

function Parallax() {
  const [props, set] = useSpring(() => ({
    xy: [0, 0],
    config: {mass: 77, tension: 422, friction: 144, velocity: -10}
  }))
  return (
    <div
      className="container"
      onMouseMove={({clientX: x, clientY: y}) => set({xy: calc(x, y)})}
    >
      <a.div
        className="card1"
        style={{
          transform: props.xy.interpolate(trStars)
        }}
      >
        <Stars />
      </a.div>
      <a.div
        className="card1"
        style={{
          transform: props.xy.interpolate(trBackground)
        }}
      >
        <Background />
      </a.div>
      <a.div
        className="card1"
        style={{
          transform: props.xy.interpolate(trPosts)
        }}
      >
        <Posts />
      </a.div>
      <a.div
        className="card1"
        style={{
          transform: props.xy.interpolate(trPerson)
        }}
      >
        <Person />
      </a.div>
      <a.div
        className="card1"
        style={{
          transform: props.xy.interpolate(trIcons)
        }}
      >
        <Icons />
      </a.div>
      <a.div
        className="card1"
        style={{
          transform: props.xy.interpolate(trSpeechBubbles)
        }}
      >
        <SpeechBubbles />
      </a.div>
    </div>
  )
}

export default Parallax
