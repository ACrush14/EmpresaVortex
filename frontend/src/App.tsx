import { Route, Routes } from 'react-router-dom'
import { Header } from './components/Header'
import { LandingPage } from './pages/LandingPage'
import { Vitrine } from './pages/Vitrine'
import { ItemDetail } from './pages/ItemDetail'
import { AdForm } from './pages/AdForm'
import { MyAds } from './pages/MyAds'
import { Identification } from './pages/Identification'

function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/vitrine" element={<Vitrine />} />
        <Route path="/itens/:id" element={<ItemDetail />} />
        <Route path="/anunciar" element={<AdForm />} />
        <Route path="/meus-anuncios" element={<MyAds />} />
        <Route path="/identificacao" element={<Identification />} />
      </Routes>
    </div>
  )
}

export default App
