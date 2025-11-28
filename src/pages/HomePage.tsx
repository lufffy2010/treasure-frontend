// frontend/src/pages/HomePage.tsx
import React from 'react'
import { Link } from 'react-router-dom'

const HomePage: React.FC = () => {
  return (
    <div>
      <h1>Welcome</h1>
      <Link to="/treasure-track">Go to Treasure Track</Link>
    </div>
  )
}

export default HomePage