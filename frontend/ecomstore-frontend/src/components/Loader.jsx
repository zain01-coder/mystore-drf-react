import React from 'react'
import './loader.css'

const Loader = ({ label = 'Loading...' }) => {
  return (
    <div className="loader-wrap">
      <div className="loader-spinner" />
      {label && <p className="loader-label">{label}</p>}
    </div>
  )
}

export default Loader
