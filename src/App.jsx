import './App.css'
import MovieSearch from './components/MovieSearch'

function App() {
  return (
    <div className="app">
      <header>
        <h1>Buscador de Películas (1995 - 2023)</h1>
        <p className="subtitle">Busca por nombre y filtra por año. Solo se muestran películas entre 1995 y 2023.</p>
      </header>

      <main>
        <MovieSearch />
      </main>
    </div>
  )
}

export default App
