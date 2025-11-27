"use client"

import { useState, useEffect } from "react"
import "./MovieSearch.css"

// NOTE: API key provided by user
const OMDB_API_KEY = "8fe32906"
const OMDB_BASE = "https://www.omdbapi.com/"

// Base list of genres to load on init (common movie genres)
const BASE_GENRES = [
  "Action",
  "Adventure",
  "Animation",
  "Comedy",
  "Crime",
  "Documentary",
  "Drama",
  "Family",
  "Fantasy",
  "Film-Noir",
  "Horror",
  "Musical",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Short",
  "Sport",
  "Thriller",
  "War",
  "Western",
]

const listaCategorias = [
  "Action",
  "Adventure",
  "Animation",
  "Children",
  "Comedy",
  "Crime",
  "Documentary",
  "Drama",
  "Fantasy",
  "Film-Noir",
  "Horror",
  "Musical",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Thriller",
  "War",
  "Western",
]

function yearsArray(from = 1900, to = 2025) {
  const arr = []
  for (let y = to; y >= from; y--) arr.push(y)
  return arr
}

async function fetchDetailsFor(imdbID) {
  const params = new URLSearchParams({
    apikey: OMDB_API_KEY,
    i: imdbID,
    plot: "short",
  })
  const res = await fetch(`${OMDB_BASE}?${params.toString()}`)
  const data = await res.json()
  return data
}

async function searchByGenre(genreFilter, yearFilter) {
  // Search for popular titles and filter by genre and year
  const popularTitles = ["movie", "film", "cinema"]
  const allResults = []

  for (const title of popularTitles) {
    const params = new URLSearchParams({
      apikey: OMDB_API_KEY,
      s: title,
      type: "movie",
    })

    const url = `${OMDB_BASE}?${params.toString()}`
    const res = await fetch(url)
    const data = await res.json()

    if (data.Response === "True" && data.Search) {
      allResults.push(...data.Search)
    }
  }

  // Remove duplicates
  const uniqueMap = new Map()
  allResults.forEach((m) => {
    if (!uniqueMap.has(m.imdbID)) {
      uniqueMap.set(m.imdbID, m)
    }
  })

  // Filter by year range
  const filtered = Array.from(uniqueMap.values()).filter((item) => {
    const match = item.Year.match(/\d{4}/)
    if (!match) return false
    const y = Number.parseInt(match[0], 10)
    if (y < 1995 || y > 2023) return false
    if (yearFilter === "any") return true
    return y === Number(yearFilter)
  })

  // Enrich with details to filter by genre
  const enriched = await Promise.all(
    filtered.map(async (it) => {
      try {
        const detail = await fetchDetailsFor(it.imdbID)
        const genreStr = detail.Genre || "N/A"
        const genresArr = genreStr
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
        return { ...it, Genre: genreStr, genresArray: genresArr }
      } catch (err) {
        return { ...it, Genre: "N/A", genresArray: [] }
      }
    }),
  )

  // Filter by selected genre
  if (genreFilter === "any") {
    return enriched
  }
  return enriched.filter((r) => r.genresArray.includes(genreFilter))
}

export default function MovieSearch() {
  const [query, setQuery] = useState("")
  const [year, setYear] = useState("any")
  const [genre, setGenre] = useState("any")
  const [genres] = useState(BASE_GENRES)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selected, setSelected] = useState([])
  const [email, setEmail] = useState("")
  const [categorias, setCategorias] = useState([])
  const [sendingRecommendations, setSendingRecommendations] = useState(false)
  const [sentSuccess, setSentSuccess] = useState(false)
  const [recommendations, setRecommendations] = useState([])

    //CARGA INICIAL DE PELICULAS POPULARES
  useEffect(() => {
    let mounted = true;
    async function loadInitialPreview() {
      setError(null);
      setLoading(true);
      try {
        const all = await searchByGenre("any", "any");
        if (!mounted) return;
        // mezclar y tomar un subconjunto para vista previa
        const preview = all.sort(() => Math.random() - 0.5).slice(0, 20);
        setResults(preview);
      } catch (err) {
        if (!mounted) return;
        setError("Error al cargar vista previa: " + (err.message || err));
        setResults([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadInitialPreview();
    return () => {
      mounted = false;
    };
  }, []);

  function toggleSelectMovie(movie) {
    const isSelected = selected.some((m) => m.imdbID === movie.imdbID)

    if (isSelected) {
      setSelected(selected.filter((m) => m.imdbID !== movie.imdbID))
    } else {
      if (selected.length < 5) {
        setSelected([...selected, movie])
      }
    }
  }

  function removeFromSelected(imdbID) {
    setSelected(selected.filter((m) => m.imdbID !== imdbID))
  }

  async function doSearch(e) {
    e && e.preventDefault()
    setError(null)

    const trimmed = query.trim()
    const hasName = trimmed.length > 0
    const hasGenreFilter = genre !== "any"

    if (!hasName && !hasGenreFilter) {
      setError("Ingresa un nombre de película o selecciona un género para buscar.")
      setResults([])
      return
    }

    setLoading(true)
    setResults([])

    try {
      let enriched = []

      if (hasName) {
        const params = new URLSearchParams({
          apikey: OMDB_API_KEY,
          s: trimmed,
          type: "movie",
        })

        const url = `${OMDB_BASE}?${params.toString()}`
        const res = await fetch(url)
        const data = await res.json()

        if (data.Response === "False") {
          setError(data.Error || "No se encontraron resultados")
          setResults([])
          return
        }

        const filteredByYear = data.Search.filter((item) => {
          const match = item.Year.match(/\d{4}/)
          if (!match) return false
          const y = Number.parseInt(match[0], 10)
          if (y < 1900 || y > 2025) return false  //aqui esta para cambiar el rango de años
          if (year === "any") return true
          return y === Number(year)
        })

        enriched = await Promise.all(
          filteredByYear.map(async (it) => {
            try {
              const detail = await fetchDetailsFor(it.imdbID)
              const genreStr = detail.Genre || "N/A"
              const genresArr = genreStr
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
              return { ...it, Genre: genreStr, genresArray: genresArr }
            } catch (err) {
              return { ...it, Genre: "N/A", genresArray: [] }
            }
          }),
        )

        if (hasGenreFilter) {
          enriched = enriched.filter((r) => r.genresArray.includes(genre))
        }
      } else if (hasGenreFilter) {
        enriched = await searchByGenre(genre, year)
      }

      setResults(enriched)
    } catch (err) {
      setError("Error al conectar con la API")
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  async function enviarARecomendador() {
    if (!email.trim()) {
      setError("Por favor ingresa un correo electrónico")
      return
    }

    setSendingRecommendations(true)
    setSentSuccess(false)

    const body = {
      email: email,
      imdb_ids: selected.map((m) => m.imdbID),
      categorias: categorias,
      top_n: 10,
    }

    console.log("Enviando al recomendador:", body)

    try {
      const res = await fetch("http://127.0.0.1:8000/recomendar-omdb", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const data = await res.json()
      console.log("Recomendaciones:", data)

      setSendingRecommendations(false)
      setSentSuccess(true)

      // Handle if data is array or object with recommendations property
      const recs = Array.isArray(data) ? data : data.recommendations || []
      setRecommendations(recs)

      setTimeout(() => {
        setSentSuccess(false)
        // Don't clear selected/email yet, let user see recommendations first
      }, 1500)
    } catch (err) {
      setSendingRecommendations(false)
      setError("Error al enviar recomendaciones")
    }
  }

  function resetSearch() {
    setRecommendations([])
    setSelected([])
    setEmail("")
    setCategorias([])
    setQuery("")
    setResults([])
  }

  if (recommendations.length > 0 && !sentSuccess) {
    return (
      <div className="movie-search">
        <header className="app-header">
          <div className="logo-container">
            <div className="logo">
              <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="18" fill="url(#gradient)" />
                <path d="M15 13L28 20L15 27V13Z" fill="white" />
                <defs>
                  <linearGradient id="gradient" x1="0" y1="0" x2="40" y2="40">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="brand-info">
              <h1>CineMatch</h1>
              <p>Tus recomendaciones personalizadas</p>
            </div>
          </div>
          <button className="new-search-btn" onClick={resetSearch}>
            Nueva Búsqueda
          </button>
        </header>

        <div className="recommendations-container">
          <div className="recommendations-header">
            <h2>¡Hemos encontrado estas películas para ti!</h2>
            <p>Basado en tus gustos y selecciones, aquí tienes tu top 10.</p>
          </div>

          <div className="recommendations-grid">
            {recommendations.map((movie, index) => (
              <div key={movie.imdbID || index} className="recommendation-card" style={{ "--delay": `${index * 0.1}s` }}>
                <div className="rank-badge">#{index + 1}</div>
                <div className="rec-poster">
                  <img
                    src={movie.Poster && movie.Poster !== "N/A" ? movie.Poster : "/vite.svg"}
                    alt={movie.Title}
                    loading="lazy"
                  />
                </div>
                <div className="rec-info">
                  <h3>{movie.Title}</h3>
                  <div className="rec-meta">
                    <span className="rec-year">{movie.Year}</span>
                    <span className="rec-genre">{movie.Genre}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="movie-search">
      <header className="app-header">
          <div className="brand-info">
            <h1>CineMatch</h1>
            <p>Descubre tu próxima película favorita</p>
          </div>
      </header>

      {(sendingRecommendations || sentSuccess) && (
        <div className="modal-overlay">
          <div className="modal-content">
            {sendingRecommendations && (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Enviando recomendaciones...</p>
              </div>
            )}
            {sentSuccess && (
              <div className="success-state">
                <div className="checkmark">✓</div>
                <p>¡Enviado exitosamente!</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="search-container">
        <form className="controls" onSubmit={doSearch}>
          <div className="field">
            <label>Nombre de película</label>
            <input placeholder="Ej: Matrix" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>

          <div className="field">
            <label>Año</label>
            <select value={year} onChange={(e) => setYear(e.target.value)}>
              <option value="any">Cualquiera (1995-2023)</option>
              {yearsArray().map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Género</label>
            <select value={genre} onChange={(e) => setGenre(e.target.value)}>
              <option value="any">Cualquiera</option>
              {genres.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div className="actions">
            <button type="submit" disabled={loading}>
              {loading ? "Buscando..." : "Buscar"}
            </button>
          </div>
        </form>
      </div>

      <div className="movie-search-section">
        <h3>Categorías favoritas</h3>
        <div className="categorias-container">
          {listaCategorias.map((categoria) => (
            <label key={categoria} className="categoria-item">
              <input
                type="checkbox"
                value={categoria}
                checked={categorias.includes(categoria)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setCategorias([...categorias, categoria])
                  } else {
                    setCategorias(categorias.filter((c) => c !== categoria))
                  }
                }}
              />
              <span>{categoria}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="status">
        {loading && <div className="loading">Cargando...</div>}
        {error && <div className="error">{error}</div>}
      </div>

      <div className="content-wrapper">
        <div className="results-section">
          <ul className="results">
            {results.map((m) => {
              const isSelected = selected.some((sel) => sel.imdbID === m.imdbID)
              return (
                <li key={m.imdbID} className="movie">
                  <div className="movie-poster-container">
                    <img src={m.Poster !== "N/A" ? m.Poster : "/vite.svg"} alt={m.Title} loading="lazy" />
                    <div className="movie-overlay">
                      <span className="year-badge">{m.Year}</span>
                    </div>
                  </div>
                  <div className="meta">
                    <h3>{m.Title}</h3>
                    <p className="genre">{m.Genre || "N/A"}</p>
                  </div>
                  <button
                    className={`select-btn ${isSelected ? "selected" : ""}`}
                    onClick={() => toggleSelectMovie(m)}
                    disabled={!isSelected && selected.length >= 5}
                    title={!isSelected && selected.length >= 5 ? "Máximo 5 películas" : ""}
                  >
                    {isSelected ? "✓ Seleccionada" : "Seleccionar"}
                  </button>
                </li>
              )
            })}
          </ul>

          {!loading && !error && results.length === 0 && (
            <div className="empty">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect>
                <polyline points="17 2 12 7 7 2"></polyline>
              </svg>
              <p>Sin resultados. Intenta otro término o ajusta los filtros.</p>
            </div>
          )}
        </div>

        <div className="selected-section">
          <div className="selected-panel">
            <div className="panel-header">
              <h2>Seleccionadas</h2>
              <span className="count-badge">{selected.length}/5</span>
            </div>

            {selected.length === 0 ? (
              <div className="empty-selected">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"></path>
                  <polyline points="17 21 17 13 7 13 7 21"></polyline>
                  <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
                <p>No hay películas seleccionadas</p>
              </div>
            ) : (
              <ul className="selected-list">
                {selected.map((movie) => (
                  <li key={movie.imdbID} className="selected-item">
                    <div className="selected-poster">
                      <img src={movie.Poster !== "N/A" ? movie.Poster : "/vite.svg"} alt={movie.Title} />
                    </div>
                    <div className="selected-info">
                      <h4>{movie.Title}</h4>
                      <p>{movie.Year}</p>
                    </div>
                    <button className="remove-btn" onClick={() => removeFromSelected(movie.imdbID)} title="Remover">
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="email-field">
              <label>Correo electrónico</label>
              <input
                type="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button
              className="recommend-btn"
              onClick={enviarARecomendador}
              disabled={selected.length === 0 || !email.trim() || sendingRecommendations}
              title={selected.length === 0 ? "Selecciona al menos una película" : ""}
            >
              {sendingRecommendations ? "Enviando..." : "Obtener recomendaciones"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
