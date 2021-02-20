import React, {Component} from 'react'
import axios from 'axios'
import _ from 'lodash'
import {
  Chart,
  RelatedArticles,
  SimilarArticles,
  Loading,
  Input,
  Landing,
  Fade,
  Response,
  FlexCol,
} from '../components'
import Parallax from './LandingParallax'
import {connect} from 'react-redux'
import {createArticle} from '../store/article'
import './Scraper.css'

class Scraper extends Component {
  constructor() {
    super()
    this.state = {
      chartData: {},
      error: false,
      hide: true,
      html: '',
      label: [],
      loaded: 'no',
      keywords: [],
      processed: '',
      progress: 0,
      publisher: '',
      relatedArticles: [],
      scores: [],
      title: '',
      url: 'Enter URL',
      windowHeight: window.innerHeight,
      windowWidth: window.innerWidth,
    }

    this.checkPrev = this.checkPrev.bind(this)
    this.checkUrl = this.checkUrl.bind(this)
    this.clearUrl = this.clearUrl.bind(this)
    this.errorMsg = this.errorMsg.bind(this)
    this.fetchArticles = this.fetchArticles.bind(this)
    this.getPrediction = this.getPrediction.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.preProcess = this.preProcess.bind(this)
    this.saveArticle = this.saveArticle.bind(this)
    this.setUrl = this.setUrl.bind(this)
    this.sendUrl = this.sendUrl.bind(this)
    this.scrapePublisher = this.scrapePublisher.bind(this)
    this.toggleHide = this.toggleHide.bind(this)
  }

  componentDidMount() {
    this.setChartData()
    window.addEventListener(
      'resize',
      _.debounce(() => {
        this.setState({
          windowHeight: window.innerHeight,
          windowWidth: window.innerWidth,
        })
      }, 200)
    )
  }

  setUrl(event) {
    this.setState({
      url: event.target.value,
    })
  }

  // Check if URL is valid
  checkUrl() {
    return /^(ftp|http|https):\/\/[^ "]+$/.test(this.state.url)
  }

  // Check if URL exists in DB. If so, use DB data instead of re-running prediction
  async checkPrev() {
    this.setState({publisher: '', loaded: 'loading'})
    try {
      const {data} = await axios.get('/api/processing/prev', {
        params: {url: this.state.url},
      })

      if (data) {
        this.setChartData([
          data.fake,
          data.political,
          data.reliable,
          data.satire,
          data.unknown,
        ])

        const scores = {
          fake: data.fake,
          satire: data.satire,
          reliable: data.reliable,
          unknown: data.unknown,
          political: data.political,
        }
        const label = Object.keys(scores).reduce((a, b) =>
          scores[a] > scores[b] ? a : b
        )

        this.setState(
          {
            html: data.text,
            publisher: data.publisher,
            title: data.title,
            label: [scores[label], label],
            scores: {
              fake: data.fake,
              political: data.political,
              reliable: data.reliable,
              satire: data.satire,
              unkown: data.unknown,
            },
            keywords: data.keywords,
          },
          () => this.fetchArticles()
        )
      } else this.scrapePublisher()
    } catch (error) {
      console.log(error)
    }
  }

  // Call scrape-publisher route on URL
  async scrapePublisher() {
    this.setState({
      publisher: '',
      loaded: 'loading',
      error: false,
      progress: 16.7,
    })
    try {
      const {data} = await axios.get('/api/processing/scrape/meta', {
        params: {targetUrl: this.state.url},
      })
      this.setState({publisher: data.publisher}, () => this.sendUrl())
    } catch (error) {
      console.log('~~~META ERROR~~~')
      console.log(error)
      this.errorMsg()
    }
  }

  // Call scrape API on URL
  async sendUrl() {
    this.setState({
      processed: '',
      keywords: [],
      scores: [],
      title: '',
      label: '',
      loaded: 'loading',
      progress: 33.3,
    })
    this.setChartData()

    try {
      const {data} = await axios.get('/api/python/scrape', {
        params: {url: this.state.url},
      })
      // If scraped text is too small either scrape failed or is not enough info for prediction
      if (data.text.split(' ').length < 100) {
        throw new Error('scrape err')
      } else {
        this.setState(
          {
            html: data.text,
            title: data.title,
          },
          () => this.preProcess()
        )
      }
    } catch (error) {
      console.log('~~~SCRAPE ERROR~~~')
      console.log(error)
      this.errorMsg()
    }
  }

  errorMsg() {
    this.setState({
      error: true,
      html: '',
      loaded: 'no',
      processed: '',
      title: '',
      url: 'Enter URL',
    })
  }

  // Cleans up text for Google NLP API
  async preProcess() {
    this.setState({progress: 50})
    // let shortenedText = this.state.html.split(' ').slice(0, 1000).join(' ')

    try {
      const {data} = await axios.get('/api/python/preprocess', {
        params: {text: this.state.html},
      })

      this.setState(
        {
          processed: data.text,
          keywords: data.keywords,
        },
        () => this.getPrediction()
      )
    } catch (error) {
      console.log('~~~PREPROCESS ERROR~~~')
      console.log(error)
      this.errorMsg()
    }
  }

  // Call Google NLP Api
  async getPrediction() {
    this.setState({progress: 66.7})
    let shortenedText = this.state.processed.split(' ').slice(0, 400).join(' ')

    try {
      const response = await axios.get('/api/processing/predict', {
        params: {text: shortenedText},
      })

      // Organize API response and set to state
      let scores = {}
      response.data.forEach((datum) => {
        scores[datum.displayName] = datum.classification.score * 100
      })
      let {fake, political, reliable, satire, unknown} = scores
      this.setChartData([fake, political, reliable, satire, unknown])

      // Refactor API response and save to state
      let obj = {}
      response.data.forEach((score) => {
        obj[score.displayName] = score.classification.score
      })
      let max = response.data.reduce((prev, current) => {
        return prev.classification.score > current.classification.score
          ? prev
          : current
      })
      this.setState(
        {
          label: [
            Math.round(max.classification.score * 1000) / 10,
            max.displayName,
          ],
          scores: obj,
        },
        () => this.saveArticle()
      )
    } catch (error) {
      console.log('~~~PREDICTION ERROR~~~')
      console.log(error)
      this.errorMsg()
    }
  }

  async saveArticle() {
    // Save article to DB
    try {
      await this.props.createArticle({
        publisher: this.state.publisher,
        url: this.state.url,
        text: this.state.html,
        title: this.state.title,
        fake: this.state.scores.fake * 100,
        political: this.state.scores.political * 100,
        reliable: this.state.scores.reliable * 100,
        satire: this.state.scores.satire * 100,
        unknown: this.state.scores.unknown * 100,
        keywords: this.state.keywords,
      })
      this.fetchArticles()
    } catch (error) {
      console.log(error)
    }
  }

  async fetchArticles() {
    this.setState({progress: 83.3})
    try {
      let {data} = await axios.get('/api/processing/related-articles', {
        params: {keywords: this.state.keywords.slice(0, 3)},
      })
      this.setState({relatedArticles: data, loaded: 'yes', progress: 100})
    } catch (error) {
      console.log('~~~FETCH ARTICLES ERROR~~~')
      console.log(error)
      this.errorMsg()
    }
  }

  setChartData(datum = [0, 0, 0, 0, 0]) {
    this.setState({
      chartData: {
        labels: ['Fake', 'Political', 'Reliable', 'Satire', 'Unknown'],
        datasets: [
          {
            data: datum,
            backgroundColor: [
              'rgba(255, 99, 132, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(75, 192, 192, 0.6)',
              'rgba(153, 102, 255, 0.6)',
              'rgba(255, 159, 64, 0.6)',
            ],
          },
        ],
      },
    })
  }

  async handleClick() {
    if (this.checkUrl()) {
      await this.scrapePublisher()
    } else console.log('INVALID URL')
  }

  clearUrl() {
    this.setState({url: ''})
  }

  toggleHide() {
    this.setState({hide: !this.state.hide})
  }

  renderHtml() {
    if (!this.state.html) return ''
    else {
      let {html} = this.state
      let wordCount = html.split(' ').length
      if (wordCount > 500)
        return html.split(' ').slice(0, 500).join(' ').concat('...')
      else return this.state.html
    }
  }

  render() {
    const {
      chartData,
      error,
      hide,
      keywords,
      label,
      loaded,
      progress,
      publisher,
      relatedArticles,
      title,
      url,
      windowHeight,
      windowWidth,
    } = this.state

    const search = (
      <>
        {loaded !== 'yes' && (
          <FlexCol>
            <Fade show={loaded === 'no'}>
              <FlexCol className="illustration">
                {/* {windowWidth < 1200 || windowHeight < 1100 ? (
                  <Landing />
                  ) : (
                    <Parallax />
                  )} */}
                <Landing />
                {error && (
                  <div className="error" style={{marginBottom: '5rem'}}>
                    Oops! There was an error with that article.
                  </div>
                )}
              </FlexCol>
              <Input
                url={url}
                setUrl={this.setUrl}
                clearUrl={this.clearUrl}
                handleClick={this.checkPrev}
              />
            </Fade>
            <Fade show={loaded === 'loading'}>
              <FlexCol className="illustration">
                <Loading />
              </FlexCol>
              <div className="search">
                <h3>Hold tight. We're triple checking our sources.</h3>
                <h3 style={{marginTop: '1rem'}}>{progress.toFixed(1)}%</h3>
              </div>
            </Fade>
          </FlexCol>
        )}
        <Fade show={loaded === 'yes'} time={5}>
          <FlexCol id="analytics">
            <FlexCol id="title">
              <h3>
                {publisher}: {title}
              </h3>
              <div id="read-more" onClick={this.toggleHide}>
                Read {hide ? '▼' : '▲'}
              </div>
              {!hide && <div id="article-text">{this.renderHtml()}</div>}
            </FlexCol>
            <FlexCol id="graph">
              <Chart chartData={chartData} />
              {label.length && <Response label={label} />}
            </FlexCol>
            <FlexCol id="articles">
              <RelatedArticles
                keywords={keywords}
                url={url}
                articles={relatedArticles}
              />
              <SimilarArticles label={label} url={url} />
            </FlexCol>
            <FlexCol>
              <button
                type="button"
                className="back-button"
                onClick={() => window.location.reload(false)}
              >
                Start Over
              </button>
            </FlexCol>
          </FlexCol>
        </Fade>
      </>
    )

    return <>{search}</>
  }
}

const mapDispatch = (dispatch) => {
  return {
    createArticle: (newArticle) => dispatch(createArticle(newArticle)),
  }
}

export default connect(null, mapDispatch)(Scraper)
