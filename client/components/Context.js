import React, { useState, createContext } from 'react'

// Create Context Object
export const Context = createContext()

// Create a provider for components to consume and subscribe to changes
export const CounterContextProvider = (props) => {
	const [context, setContext] = useState({
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
	})

	return (
		<Context.Provider value={[context, setContext]}>
			{props.children}
		</Context.Provider>
	)
}
