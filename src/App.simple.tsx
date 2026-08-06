import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function TestPage({ title }: { title: string }) {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>{title}</h1>
      <p>路由工作正常！</p>
    </div>
  );
}

export function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TestPage title="首页" />} />
        <Route path="/test" element={<TestPage title="测试页面" />} />
      </Routes>
    </Router>
  );
}

export default App;
