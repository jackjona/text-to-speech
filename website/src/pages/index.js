import React from 'react'
import ReactAudioPlayer from 'react-audio-player'
import Layout from '../components/layout'
import Footer from './footer'
import greet from '../lib/greeting'
import axios from 'axios'

// TTS API
const API = 'https://tts-api.jackjona.live/.netlify/functions/index'

// How many seconds a user must wait in an error.
const COOLDOWN = 5

class Index extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      cooldown: 0,
      text: '',
      voice: 'Brian',
      buttonText: 'Play',
      buttonLoading: false,
      warningText: '',
      audioUrl: '',
    }

    this.handleTextChange = this.handleTextChange.bind(this)
    this.handleVoiceChange = this.handleVoiceChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)

    // Connect to Socket.io
    // this.setupSockets()

    // Print message in console
    greet()
  }

  handleTextChange(event) {
    this.setState({ text: event.target.value })
  }

  handleVoiceChange(event) {
    this.setState({ voice: event.target.value })
  }

  handleSubmit(event) {
    // Rate limit the button
    this.setState({ buttonLoading: true })

    const payload = {
      text: this.state.text,
      voice: this.state.voice,
    }

    axios
      .post(API, payload)
      .then(res => {
        let response = res.data
        if (response.success) {
          this.setState(prev => ({
            audioUrl: response.speak_url,
            cooldown: prev.cooldown < COOLDOWN ? prev.cooldown : COOLDOWN,
            warningText: '',
          }))
        }
      })
      .catch(err => {
        console.log('We got an error:', err)
        this.setState(prev => ({
          warningText: `Error. Cooldown adjusted to ${prev.cooldown +
            COOLDOWN} seconds.`,
          cooldown: prev.cooldown + COOLDOWN,
        }))
      })
      .finally(() => {
        let count = 0
        let timer = setInterval(() => {
          this.setState({
            buttonText: `Please wait ${this.state.cooldown -
              Math.floor(count * 0.1)}s`,
          })
          count++

          if (count >= this.state.cooldown * 10) {
            this.setState({ buttonText: 'Play', buttonLoading: false })
            clearInterval(timer)
          }
        }, 100)
      })

    event.preventDefault()
  }

  render() {
    return (
      <Layout>
        <center>
        <br />
        <br />
        <br />
        <h3>Text To Speech</h3>
        <p>
        This wesite takes text that you type and converts it to a Streamlabs voice.
        </p>
        <br />
        <form
          onSubmit={this.handleSubmit}
          style={{
            backgroundColor: '#d3d3d370',
            padding: '1em',
            borderRadius: '0.4em',
          }}
        >
          <p
            style={{
              margin: '0',
              color: 'gray',
              fontFamily: 'italic',
              textAlign: 'center',
              marginTop: '5px',
              marginBottom: '15px',
              display: this.state.warningText !== '' ? 'block' : 'none',
            }}
          >
            {this.state.warningText}
          </p>

          <div>
            <span>Text: &nbsp;</span>
            <input
              type="text"
              value={this.state.text}
              maxLength="300"
              onChange={this.handleTextChange}
              style={{ width: '90%' }}
            />
          </div>
          <div style={{ marginTop: '5px' }}>
            <span>Voice: </span>
            <select value={this.state.voice} onChange={this.handleVoiceChange}>
              <option value="Brian">Brian</option>
              <option value="Ivy">Ivy</option>
              <option value="Justin">Justin</option>
              <option value="Russell">Russell</option>
              <option value="Nicole">Nicole</option>
              <option value="Emma">Emma</option>
              <option value="Amy">Amy</option>
              <option value="Joanna">Joanna</option>
              <option value="Salli">Salli</option>
              <option value="Kimberly">Kimberly</option>
              <option value="Kendra">Kendra</option>
              <option value="Joey">Joey</option>
              <option value="Mizuki">Mizuki (Japanese)</option>
              <option value="Chantal">Chantal (French)</option>
              <option value="Mathieu">Mathieu (French)</option>
              <option value="Maxim">Maxim (Russian)</option>
              <option value="Hans">Hans (German)</option>
              <option value="Raveena">Raveena (Indian)</option>
            </select>
          </div>

          <div style={{ marginTop: '15px' }}>
            <input
              type="submit"
              value={this.state.buttonText}
              disabled={this.state.buttonLoading}
            />
          </div>
        </form>

        <br />
        </center>
        <ReactAudioPlayer
          src={this.state.audioUrl}
          style={{
            visibility: this.state.audioUrl !== '' ? 'visible' : 'hidden',
          }}
          autoPlay
          controls
        />

        {/* Anti-twitch spam banner */}
        <Footer />
      </Layout>
    )
  }
}

export default Index
