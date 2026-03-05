import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import HomePage from './pages/HomePage';
import WizardPage from './pages/WizardPage';
import ResultsPage from './pages/ResultsPage';
import QuickLookupPage from './pages/QuickLookupPage';
import NotFoundPage from './pages/NotFoundPage';
import './index.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/wizard" element={<WizardPage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/quick" element={<QuickLookupPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;

