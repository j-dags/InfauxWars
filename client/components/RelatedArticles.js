import React from 'react'
import {FlexCol} from '../components'
import './RelatedArticles.css'

const RelatedArticles = ({url, articles}) => {
  return (
    articles.length > 1 && (
      <FlexCol style={{margin: '2rem 0rem', alignItems: 'flex-start'}}>
        <h4>Want some more info? 📰 </h4>
        {articles.slice(0, 3).map(article => {
          if (article.url !== url)
            return (
              <div key={article.url} className="related-article">
                <p>{article.title}</p>
                <a href={article.url} target="_blank" rel="noopener noreferrer">
                  {article.url}
                </a>
              </div>
            )
        })}
      </FlexCol>
    )
  )
}

export default RelatedArticles
