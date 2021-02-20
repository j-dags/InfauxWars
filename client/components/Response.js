import React, {useEffect, useState} from 'react'

function Response({label}) {
  const [adjective, setAdjective] = useState('somewhat')
  const [intro, setIntro] = useState('')

  useEffect(() => {
    if (label[0] > 75) setAdjective('most likely')
    else if (label[0] > 50) setAdjective('probably')
    else setAdjective('somewhat')

    if (label[1] === 'reliable') setIntro('Nice!')
    if (label[1] === 'satire') setIntro('Oops!')
    if (label[1] === 'fake') setIntro('Oh no!')
    if (label[1] === 'political') setIntro('Hmm.')
  })

  return (
    <>
      <h3 className="response">
        {label[1] === 'unknown' || label[0] < 33
          ? `Hmm. We're not too sure about this one 🤔`
          : `${intro} This article is ${adjective} ${label[1]}`}
      </h3>
    </>
  )
}

export default Response
