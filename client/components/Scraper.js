import React, {Component} from 'react'
import _ from 'lodash'
import {
  Loading,
  Input,
  Landing,
  Fade,
  FlexCol,
} from '../components'
import {connect} from 'react-redux'
import {createArticle, fetchRelatedArticles} from '../store/article'
import { checkPrev, clearState, getPrediction, preProcess, scrapeArticle } from '../store/scrape'
import './Scraper.css'

class Scraper extends Component {
  constructor() {
    super()
    this.state = {
      error: false,
      hide: true,
      loaded: 'no',
      progress: 0,
      url: 'Enter URL',
      windowHeight: window.innerHeight,
      windowWidth: window.innerWidth,
    }

    this.checkPrev = this.checkPrev.bind(this)
    this.checkUrl = this.checkUrl.bind(this)
    this.clearUrl = this.clearUrl.bind(this)
    this.errorMsg = this.errorMsg.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.setUrl = this.setUrl.bind(this)
  }

  componentDidMount() {
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

  // componentDidUpdate(prevProps) {
  //   console.log('this.props.scrape.error > ', this.props.scrape.error)
  //   if (this.props.scrape.error) this.setState({loaded: 'no'})
  // }

  // Check if URL is valid
  checkUrl() {
    return /^(ftp|http|https):\/\/[^ "]+$/.test(this.state.url)
  }

  clearUrl() {
    this.setState({url: ''})
  }

  setUrl(event) {
    this.setState({
      url: event.target.value,
    })
  }

  // Check if URL exists in DB. If so, use DB data instead of re-running prediction
  async checkPrev() {
    this.setState({loaded: 'loading'})
    await this.props.clearState()

    try {
      // Checks if article exists in db, if not dispatches scrape publisher thunk
      await this.props.checkPrev(this.state.url)
      this.setState({progress: 20})
      if (this.props.scrape.scores.length < 1) {
        await this.props.scrapeArticle(this.state.url)
        this.setState({progress: 40})

        await this.props.preProcess(this.props.scrape.html)
        this.setState({progress: 60})

        await this.props.getPrediction(this.props.scrape.processed)
        this.setState({progress: 80})

        await this.props.createArticle({
          publisher: this.props.scrape.publisher,
          url: this.state.url,
          text: this.props.scrape.html,
          title: this.props.scrape.title,
          fake: this.props.scrape.scores.fake,
          political: this.props.scrape.scores.political,
          reliable: this.props.scrape.scores.reliable,
          satire: this.props.scrape.scores.satire,
          unknown: this.props.scrape.scores.unknown,
          keywords: this.props.scrape.keywords,
        })
      }
      // fetch related articles for news api
      await this.props.fetchRelatedArticles(this.props.scrape.keywords)
      // redirect to results page
      this.props.history.push('/results')

    } catch (error) {
      console.log(error)
      // if thunks throw an error, page show an error message
      this.setState({ loaded: 'no', error: true, url: 'Enter URL'})
    }
  }

  errorMsg() {
    this.setState({
      error: true,
      loaded: 'no',
      progress: 0,
      url: 'Enter URL',
    })
  }

  async handleClick() {
    if (this.checkUrl()) {
      await this.checkPrev()
    } else console.log('INVALID URL')
  }

  renderHtml() {
    if (!this.props.scrape.html) return ''
    else {
      let {html} = this.props.scrape
      let wordCount = html.split(' ').length
      if (wordCount > 500)
        return html.split(' ').slice(0, 500).join(' ').concat('...')
      else return this.props.scrape.html
    }
  }

  render() {
    const {
      error,
      loaded,
      progress,
      url,
    } = this.state


    const search = (
      <>
        {loaded !== 'yes' && (
          <FlexCol>
            <Fade show={loaded === 'no'}>
              <FlexCol className="illustration">
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
                handleClick={this.handleClick}
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
      </>
    )

    return <>{search}</>
  }
}

const mapState = state => {
  return {
   scrape: state.scrape,
   articles: state.articles
  }
}

const mapDispatch = (dispatch) => {
  return {
    clearState: () => dispatch(clearState()),
    createArticle: (article) => dispatch(createArticle(article)),
    checkPrev: (url) => dispatch(checkPrev(url)),
    scrapeArticle: (url) => dispatch(scrapeArticle(url)),
    preProcess: (text) => dispatch(preProcess(text)),
    getPrediction: (text) => dispatch(getPrediction(text)),
    fetchRelatedArticles: (keywords) => dispatch(fetchRelatedArticles(keywords))
  }
}

export default connect(mapState, mapDispatch)(Scraper)
