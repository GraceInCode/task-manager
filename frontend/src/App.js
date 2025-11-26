import { AppProvider } from "./context/appContext";
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard';
import BoardView from './components/BoardView';
import Join from './components/Join';

function App() {
  return (
    <AppProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/board/:id" element={<BoardView />} />
        <Route path="/join" element={<Join />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </AppProvider>
  )
}

export default App