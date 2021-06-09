import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import {
  Chart,
  RelatedArticles,
  SimilarArticles,
  Fade,
  Response,
  FlexCol,
} from '../components'
import history from '../history'

const Results = () => {
  const [hide, setHide] = useState(true)

  // useSelector connects redux state to component
  const { articles, scrape } = useSelector((state) => state)
  const { chartData, html, keywords, label, publisher, title, url } = scrape
  const { relatedArticles } = articles

  // function to format the article text
  const renderHtml = () => {
    if (!html) return ''
    else {
      let wordCount = html.split(' ').length
      if (wordCount > 500)
        return html.split(' ').slice(0, 500).join(' ').concat('...')
      else return html
    }
  }

  useEffect(() => {
    if (!relatedArticles) history.push('/')
  }, [relatedArticles])

  return (
    <Fade show={true} time={5}>
      {!relatedArticles ? <></> :
        <FlexCol id="analytics">
          <FlexCol id="title">
            <h3>
              {publisher}: {title}
            </h3>
            <div id="read-more" onClick={() => setHide(!hide)}>
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
      }
    </Fade>
  )
}

export default Results
