import { useState } from 'react'
import './App.css'
import HomePage from './pages/HomePage'
import PageOne from './pages/PageOne'

function App() {
  const [currentPage, setCurrentPage] = useState('home')

  return (
    <div className="app-container">
      {currentPage === 'home' && (
        <HomePage onNavigate={setCurrentPage} />
      )}
      {currentPage === 'pageone' && (
        <PageOne onNavigate={setCurrentPage} />
      )}
    </div>
  )
}

export default App;
