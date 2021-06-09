import axios from 'axios'

const PREV_ARTICLE = 'PREV_ARTICLE'
const SCRAPED_PUBLISHER = 'SCRAPED_PUBLISHER'
const SCRAPED_ARTICLE = 'SCRAPED_ARTICLE'
const PREPROCESSED = 'PREPROCESSED'
const GOT_PREDICTION = 'GOT_PREDICTION'

export const prevArticle = article => ({
  type: PREV_ARTICLE,
  article
})

export const scrapedPublisher = (publisher, url) => ({
  type: SCRAPED_PUBLISHER,
  publisher: publisher,
  progress: 16.7,
  url: url
})

export const scrapedArticle = (text, title) => ({
  type: SCRAPED_ARTICLE,
  text: text,
  title: title,
  progress: 33
})

export const preProcessed = (keywords, text) => ({
  type: PREPROCESSED,
  keywords: keywords,
  processed: text,
  progress: 50
})

export const gotPrediction = (chartData, label, scores) => ({
  type: GOT_PREDICTION,
  chartData: chartData,
  label: label,
  scores: scores,
  progress: 67
})

export const scrapePublisher = (url) => {
  return async dispatch => {
    try {
      const { data } = await axios.get('/api/processing/scrape/meta', {
        params: { targetUrl: url }
      })
      dispatch(scrapedPublisher(data.publisher, url))
    } catch (error) {
      console.log(error)
    }
  }
}

export const checkPrev = (url) => {
  return async dispatch => {
    try {
      const {data} = await axios.get('/api/processing/prev', {
        params: {url: url},
      })
      console.log('data > ', data)
      if (data) {
        let prevData = [
          data.fake,
          data.political,
          data.reliable,
          data.satire,
          data.unknown,
        ]

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


        let article = {
          chartData: {
            labels: ['Fake', 'Political', 'Reliable', 'Satire', 'Unknown'],
            datasets: [
              {
                data: prevData,
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
          html: data.text,
          keywords: data.keywords,
          label: [scores[label], label],
          publisher: data.publisher,
          scores: {
            fake: data.fake,
            political: data.political,
            reliable: data.reliable,
            satire: data.satire,
            unkown: data.unknown,
          },
          title: data.title,
        }
        dispatch(prevArticle(article))
      }
      else dispatch(scrapePublisher(url))
    } catch (error) {
      console.log(error)
    }
  }
}

export const scrapeArticle = (url) => {
  return async dispatch => {
    try {
      const { data } = await axios.get('https://infauxwars-python.herokuapp.com/scrape', { params: { url: url }})

      if (data.text.split(' ').length < 100) {
        throw new Error('scrape err')
      } else {
        const {text, title} = data
        dispatch(scrapedArticle(text, title))
      }
    } catch (error) {
      console.log(error)
    }
  }
}

export const preProcess = (article) => {
  return async dispatch => {
    try {
      const { data } = await axios.get('https://infauxwars-python.herokuapp.com/preprocess', {
        params: {text: article},
      })
      const { keywords, text } = data
      dispatch(preProcessed(keywords, text))
    } catch (error) {
      console.log(error)
    }
  }
}

export const getPrediction = (text) => {
  return async dispatch => {
    try {
      // Make API call to Google
      let shortenedText = text.split(' ').slice(0, 400).join(' ')
      const { data } = await axios.get('/api/processing/predict', {
        params: {text: shortenedText},
      })

      // Organize API response and set to state
      let scores = {}
      data.forEach((datum) => {
        scores[datum.displayName] = datum.classification.score * 100
      })

      let max = data.reduce((prev, current) => {
        return prev.classification.score > current.classification.score
          ? prev
          : current
      })
      const chartData = {
        labels: ['Fake', 'Political', 'Reliable', 'Satire', 'Unknown'],
        datasets: [
          {
            data: scores,
            backgroundColor: [
              'rgba(255, 99, 132, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(75, 192, 192, 0.6)',
              'rgba(153, 102, 255, 0.6)',
              'rgba(255, 159, 64, 0.6)',
            ],
          },
        ],
        }

      const label = [
        Math.round(max.classification.score * 1000) / 10,
        max.displayName,
      ]

      dispatch(gotPrediction(chartData, label, scores))
    } catch (error) {
      console.log(error)
    }
  }
}

const initialState = {
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
  scores: [],
  title: '',
  url: 'Enter URL',
  windowHeight: window.innerHeight,
  windowWidth: window.innerWidth,
}

export default function scrapeReducer(state = initialState, action) {
  switch(action.type) {
    case PREV_ARTICLE:
      return action.article
    case SCRAPED_ARTICLE:
      return { ...state, html: action.text, title: action.title, progress: action.progress }
    case SCRAPED_PUBLISHER:
      return { ...state, publisher: action.publisher, progress: action.progress, url: action.url }
    case PREPROCESSED:
      return { ...state, keywords: action.keywords, processed: action.processed, progress: action.progress}
    case GOT_PREDICTION:
      return { ...state, chartData: action.chartData, label: action.label, progress: action.progress, scores: action.scores}
    default:
      return state
  }
}



