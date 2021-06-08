import React, { useEffect, useState } from 'react'
import _ from 'lodash'
import {
  Chart,
  RelatedArticles,
  SimilarArticles,
  Response,
  FlexCol,
} from '../components'
import './Scraper.css'

const Results = () => {
  const [state, set] = useState({
    chartData: {},
    hide: true,
    windowHeight: window.innerHeight,
    windowWidth: window.innerWidth,
  })

  const setChartData = (datum = [0, 0, 0, 0, 0]) => {
    set({ ...state,
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

  useEffect(()=> {
    setChartData()
    window.addEventListener(
      'resize',
      _.debounce(() => {
        set( ...state, {
          windowHeight: window.innerHeight,
          windowWidth: window.innerWidth,
        })
      }, 200)
    )
  })


  const toggleHide = () => {
    set({ ...state, hide: !state.hide})
  }

  const renderHtml = () => {
    if (!state.html) return ''
    else {
      let { html } = state
      let wordCount = html.split(' ').length
      if (wordCount > 500)
        return html.split(' ').slice(0, 500).join(' ').concat('...')
      else return html
    }
  }

  const {
    chartData,
    hide,
    keywords,
    label,
    publisher,
    relatedArticles,
    title,
    url,
  } = state

  const search = (
    <>
      {/* <Fade show={loaded === 'yes'} time={5}> */}
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
      {/* </Fade> */}
    </>
  )

  return <>{search}</>
}

export default Results
