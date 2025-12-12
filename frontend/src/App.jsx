import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import MessageTemplate from './modules/message-template/MessageTemplate'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/message-template" element={<MessageTemplate />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App