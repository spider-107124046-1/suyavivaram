import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import TemplatesPage from './pages/TemplatesPage';
import BuilderPage from './pages/BuilderPage';
import FAQPage from './pages/FAQPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/templates" element={<TemplatesPage />} />
        <Route path="/builder" element={<BuilderPage />} />
        <Route path="/faq" element={<FAQPage />} />
        {/* Fallback route */}
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </Router>
  );
}

export default App;
