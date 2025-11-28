import './App.css'
import MovieSearch from './components/MovieSearch'

function App() {
  return (
    <div className="app">
      <header>
        <h1>Selecciona tus películas favoritas</h1>
        <p className="subtitle">Busca por nombre y filtra por genero. Encuentra una lista de peliculas solo para ti.</p>
      </header>

      <main>
        <MovieSearch />
      </main>
    </div>
  )
}

export default App
