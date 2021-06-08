import React, {useEffect, useContext, useDispatch} from 'react'
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
import {createArticle} from '../store/article'
import { Context } from './Context'
import './Scraper.css'

const Scraper = () => {
  const [context, setContext] = useContext(Context)
  const dispatch = useDispatch()

  const setChartData = (datum = [0, 0, 0, 0, 0]) => {
    setContext({
      ...context,
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

  const fetchArticles = async() => {
    setContext({ ...context, progress: 83.3})
    try {
      let {data} = await axios.get('/api/processing/related-articles', {
        params: {keywords: context.keywords.slice(0, 3)},
      })
      setContext({ ...context, relatedArticles: data, loaded: 'yes', progress: 100})
    } catch (error) {
      console.log('~~~FETCH ARTICLES ERROR~~~')
      console.log(error)
      errorMsg()
    }
  }

  useEffect(() => {
    setChartData()
    window.addEventListener(
      'resize',
      _.debounce(() => {
        setContext({
          ...context,
          windowHeight: window.innerHeight,
          windowWidth: window.innerWidth,
        })
      }, 200)
    )
  })

  const setUrl = (event) => {
    setContext({ ...context, url: event.target.value })
  }

  // Check if URL is valid
  const checkUrl = () => {
    return /^(ftp|http|https):\/\/[^ "]+$/.test(context.url)
  }

  // Check if URL exists in DB. If so, use DB data instead of re-running prediction
  const checkPrev = async() => {
    setContext({ ...context, publisher: '', loaded: 'loading'})
    try {
      const {data} = await axios.get('/api/processing/prev', {
        params: {url: context.url},
      })

      if (data) {
        setChartData([
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

        setContext( ...context,
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
          () => fetchArticles()
        )
      } else scrapePublisher()
    } catch (error) {
      console.log(error)
    }
  }

  // Call scrape-publisher route on URL
  const scrapePublisher = async() => {
    setContext({ ...context,
      publisher: '',
      loaded: 'loading',
      error: false,
      progress: 16.7,
    })
    try {
      const {data} = await axios.get('/api/processing/scrape/meta', {
        params: {targetUrl: context.url},
      })
      setContext({ ...context, publisher: data.publisher}, () => sendUrl())
    } catch (error) {
      console.log('~~~META ERROR~~~')
      console.log(error)
      errorMsg()
    }
  }

  // Call scrape API on URL
  const sendUrl = async() => {
    setContext({ ...context,
      processed: '',
      keywords: [],
      scores: [],
      title: '',
      label: '',
      loaded: 'loading',
      progress: 33.3,
    })
    setChartData()

    try {
      const { data } = await axios.get('https://infauxwars-python.herokuapp.com/scrape', {
        params: {url: context.url},
      })

      // If scraped text is too small either scrape failed or is not enough info for prediction
      if (data.text.split(' ').length < 100) {
        throw new Error('scrape err')
      } else {
        setContext(
          {
            ...context,
            html: data.text,
            title: data.title,
          },
          () => preProcess()
        )
      }
    } catch (error) {
      console.log('~~~SCRAPE ERROR~~~')
      console.log(error)
      errorMsg()
    }
  }

  const errorMsg = () => {
    setContext({ ...context,
      error: true,
      html: '',
      loaded: 'no',
      processed: '',
      title: '',
      url: 'Enter URL',
    })
  }

  // Cleans up text for Google NLP API
  const preProcess = async() => {
    setContext({ ...context, progress: 50})

    try {
      const { data } = await axios.get('https://infauxwars-python.herokuapp.com/preprocess', {
        params: { text: context.html }
      })

      setContext(
        {
          ...context,
          processed: data.text,
          keywords: data.keywords,
        },
        () => getPrediction()
      )
    } catch (error) {
      console.log('~~~PREPROCESS ERROR~~~')
      console.log(error)
      errorMsg()
    }
  }

  // Call Google NLP Api
  const getPrediction = async() => {
    setContext({ ...context, progress: 66.7})
    let shortenedText = context.processed.split(' ').slice(0, 400).join(' ')

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
      setChartData([fake, political, reliable, satire, unknown])

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
      setContext(
        {
          ...context,
          label: [
            Math.round(max.classification.score * 1000) / 10,
            max.displayName,
          ],
          scores: obj,
        },
        () => saveArticle()
      )
    } catch (error) {
      console.log('~~~PREDICTION ERROR~~~')
      console.log(error)
      errorMsg()
    }
  }

  const saveArticle = async() => {
    // Save article to DB
    try {
      await dispatch(createArticle({
        publisher: context.publisher,
        url: context.url,
        text: context.html,
        title: context.title,
        fake: context.scores.fake * 100,
        political: context.scores.political * 100,
        reliable: context.scores.reliable * 100,
        satire: context.scores.satire * 100,
        unknown: context.scores.unknown * 100,
        keywords: context.keywords,
      }))
      fetchArticles()
    } catch (error) {
      console.log(error)
    }
  }





  const handleClick = async() => {
    if (checkUrl()) {
      await scrapePublisher()
    } else console.log('INVALID URL')
  }

  const clearUrl = () => {
    setContext({ ...context, url: ''})
  }

  const toggleHide = () => {
    setContext({ ...context, hide: !context.hide})
  }

  const renderHtml = () => {
    if (!context.html) return ''
    else {
      let {html} = context
      let wordCount = html.split(' ').length
      if (wordCount > 500)
        return html.split(' ').slice(0, 500).join(' ').concat('...')
      else return context.html
    }
  }

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
  } = context

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
              setUrl={setUrl}
              clearUrl={clearUrl}
              handleClick={checkPrev}
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
            <div id="read-more" onClick={toggleHide}>
              Read {hide ? '▼' : '▲'}
            </div>
            {!hide && <div id="article-text">{renderHtml()}</div>}
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

export default Scraper
