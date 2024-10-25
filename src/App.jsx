import { useState } from 'react'

import './App.css'
import { FileExtractor } from './components/FileExtractor'

function App() {

  return (
    <>
      <div className='container-main'>
      <div className='container-box'>
        <h1> GRAFICAR CON CANVAS</h1>
        <FileExtractor />
      </div>
      </div>
    </>
  )
}

export default App
