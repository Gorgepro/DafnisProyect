import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Study from './pages/Study'
import CreatePlan from './pages/CreatePlan'

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/estudiar" element={<Study />} />
        <Route path="/crear-plan" element={<CreatePlan />} />
      </Routes>
    </>
  )
}

export default App
