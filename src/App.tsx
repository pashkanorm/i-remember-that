import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import TabPage from "./pages/TabPage";
import Navbar from "./components/Navbar";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/movies" />} />
        <Route path="/movies" element={<TabPage type="movies" />} />
        <Route path="/games" element={<TabPage type="games" />} />
        <Route path="/books" element={<TabPage type="books" />} />
      </Routes>
    </Router>
  );
}

export default App;
