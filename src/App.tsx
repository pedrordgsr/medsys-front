import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/index'
import Clientes from './pages/clientes'
import Filiais from './pages/filiais'
import Medicamentos from './pages/medicamentos'
import { Navbar } from '@/components/layout/Navbar'

function App() {

  return (
    <BrowserRouter>
      <Navbar />
      <main className='pt-14'>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/filiais" element={<Filiais />} />
          <Route path="/medicamentos" element={<Medicamentos />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}


export default App
