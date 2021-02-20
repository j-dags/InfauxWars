import axios from 'axios'
import React, {useEffect, useState} from 'react'
import {FlexCol} from '../components'
import './SimilarArticles.css'

const SimilarArticles = ({label, url}) => {
  const [articles, setArticles] = useState([])

  const fetchSimilarArticles = async () => {
    let {data} = await axios.get('/api/processing/similar-articles', {
      params: {
        label: label
      }
    })
    setArticles(data)
  }

  useEffect(
    () => {
      if (label.length > 0) fetchSimilarArticles()
    },
    [label]
  )

  return (
    articles.length > 1 && (
      <FlexCol style={{marginBottom: '2rem', alignItems: 'flex-start'}}>
        <h4>Other {label[1]} articles users found! 👇</h4>
        {articles.slice(0, 3).map(article => {
          if (article.url !== url)
            return (
              <div key={article.title} className="related-article">
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

export default SimilarArticles
