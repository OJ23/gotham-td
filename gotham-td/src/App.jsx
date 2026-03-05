import { useEffect, useState } from 'react'
import './App.css'

const initialHeroForm = {
  name: '',
  alias: '',
  power: '',
  description: '',
  image: '',
  imagePublicId: '',
  city: 'Gotham',
}

const initialCriminalForm = {
  name: '',
  alias: '',
  crimeType: '',
  description: '',
  image: '',
  imagePublicId: '',
  threatLevel: 'Medium',
}

function App() {
  const [heroes, setHeroes] = useState([])
  const [criminals, setCriminals] = useState([])
  const [heroForm, setHeroForm] = useState(initialHeroForm)
  const [criminalForm, setCriminalForm] = useState(initialCriminalForm)
  const [heroImageFile, setHeroImageFile] = useState(null)
  const [criminalImageFile, setCriminalImageFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadData = async () => {
    try {
      setError('')
      const [heroesRes, criminalsRes] = await Promise.all([
        fetch('/api/heroes'),
        fetch('/api/criminals'),
      ])

      if (!heroesRes.ok || !criminalsRes.ok) {
        throw new Error('Failed to load data from MongoDB API')
      }

      const [heroesData, criminalsData] = await Promise.all([
        heroesRes.json(),
        criminalsRes.json(),
      ])

      setHeroes(heroesData)
      setCriminals(criminalsData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const uploadImage = async (file, category) => {
    const formData = new FormData()
    formData.append('image', file)
    formData.append('category', category)

    const res = await fetch('/api/uploads/image', {
      method: 'POST',
      body: formData,
    })

    if (!res.ok) {
      throw new Error('Failed to upload image to Cloudinary')
    }

    return res.json()
  }

  const addHero = async (e) => {
    e.preventDefault()
    try {
      setError('')
      setUploading(true)
      const payload = { ...heroForm }

      if (heroImageFile) {
        const uploadResult = await uploadImage(heroImageFile, 'heroes')
        payload.image = uploadResult.image
        payload.imagePublicId = uploadResult.imagePublicId
      }

      const res = await fetch('/api/heroes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        throw new Error('Failed to add hero')
      }

      const created = await res.json()
      setHeroes((prev) => [created, ...prev])
      setHeroForm(initialHeroForm)
      setHeroImageFile(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  const addCriminal = async (e) => {
    e.preventDefault()
    try {
      setError('')
      setUploading(true)
      const payload = { ...criminalForm }

      if (criminalImageFile) {
        const uploadResult = await uploadImage(criminalImageFile, 'criminals')
        payload.image = uploadResult.image
        payload.imagePublicId = uploadResult.imagePublicId
      }

      const res = await fetch('/api/criminals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        throw new Error('Failed to add criminal')
      }

      const created = await res.json()
      setCriminals((prev) => [created, ...prev])
      setCriminalForm(initialCriminalForm)
      setCriminalImageFile(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  const deleteHero = async (id) => {
    try {
      setError('')
      const res = await fetch(`/api/heroes/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        throw new Error('Failed to delete hero')
      }
      setHeroes((prev) => prev.filter((hero) => hero._id !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  const deleteCriminal = async (id) => {
    try {
      setError('')
      const res = await fetch(`/api/criminals/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        throw new Error('Failed to delete criminal')
      }
      setCriminals((prev) => prev.filter((criminal) => criminal._id !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <main className="page">
      <header>
        <h1>Gotham Registry</h1>
        <p>Track heroes and criminals in separate MongoDB collections.</p>
      </header>

      {error && <p className="error">{error}</p>}

      <section className="layout">
        <article className="panel">
          <h2>Heroes</h2>
          <form onSubmit={addHero} className="form">
            <input
              required
              placeholder="Name"
              value={heroForm.name}
              onChange={(e) => setHeroForm((p) => ({ ...p, name: e.target.value }))}
            />
            <input
              required
              placeholder="Alias"
              value={heroForm.alias}
              onChange={(e) => setHeroForm((p) => ({ ...p, alias: e.target.value }))}
            />
            <input
              required
              placeholder="Power"
              value={heroForm.power}
              onChange={(e) => setHeroForm((p) => ({ ...p, power: e.target.value }))}
            />
            <input
              placeholder="Description"
              value={heroForm.description}
              onChange={(e) =>
                setHeroForm((p) => ({ ...p, description: e.target.value }))
              }
            />
            <input
              type="url"
              placeholder="Image URL (optional)"
              value={heroForm.image}
              onChange={(e) => setHeroForm((p) => ({ ...p, image: e.target.value }))}
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setHeroImageFile(e.target.files?.[0] || null)}
            />
            <input
              placeholder="City"
              value={heroForm.city}
              onChange={(e) => setHeroForm((p) => ({ ...p, city: e.target.value }))}
            />
            <button type="submit" disabled={uploading}>
              {uploading ? 'Uploading...' : 'Add Hero'}
            </button>
          </form>

          <ul className="list">
            {loading ? (
              <li>Loading heroes...</li>
            ) : (
              heroes.map((hero) => (
                <li key={hero._id}>
                  {hero.image && (
                    <img className="thumb" src={hero.image} alt={`${hero.alias} portrait`} />
                  )}
                  <div className="record">
                    <strong>{hero.alias}</strong> ({hero.name})
                    <small>{hero.power} | {hero.city}</small>
                    {hero.description && <small>{hero.description}</small>}
                  </div>
                  <button onClick={() => deleteHero(hero._id)}>Delete</button>
                </li>
              ))
            )}
          </ul>
        </article>

        <article className="panel">
          <h2>Criminals</h2>
          <form onSubmit={addCriminal} className="form">
            <input
              required
              placeholder="Name"
              value={criminalForm.name}
              onChange={(e) => setCriminalForm((p) => ({ ...p, name: e.target.value }))}
            />
            <input
              required
              placeholder="Alias"
              value={criminalForm.alias}
              onChange={(e) => setCriminalForm((p) => ({ ...p, alias: e.target.value }))}
            />
            <input
              required
              placeholder="Crime Type"
              value={criminalForm.crimeType}
              onChange={(e) =>
                setCriminalForm((p) => ({ ...p, crimeType: e.target.value }))
              }
            />
            <input
              placeholder="Description"
              value={criminalForm.description}
              onChange={(e) =>
                setCriminalForm((p) => ({ ...p, description: e.target.value }))
              }
            />
            <input
              type="url"
              placeholder="Image URL (optional)"
              value={criminalForm.image}
              onChange={(e) =>
                setCriminalForm((p) => ({ ...p, image: e.target.value }))
              }
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCriminalImageFile(e.target.files?.[0] || null)}
            />
            <select
              value={criminalForm.threatLevel}
              onChange={(e) =>
                setCriminalForm((p) => ({ ...p, threatLevel: e.target.value }))
              }
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
              <option>Extreme</option>
            </select>
            <button type="submit" disabled={uploading}>
              {uploading ? 'Uploading...' : 'Add Criminal'}
            </button>
          </form>

          <ul className="list">
            {loading ? (
              <li>Loading criminals...</li>
            ) : (
              criminals.map((criminal) => (
                <li key={criminal._id}>
                  {criminal.image && (
                    <img
                      className="thumb"
                      src={criminal.image}
                      alt={`${criminal.alias} portrait`}
                    />
                  )}
                  <div className="record">
                    <strong>{criminal.alias}</strong> ({criminal.name})
                    <small>{criminal.crimeType} | Threat: {criminal.threatLevel}</small>
                    {criminal.description && <small>{criminal.description}</small>}
                  </div>
                  <button onClick={() => deleteCriminal(criminal._id)}>Delete</button>
                </li>
              ))
            )}
          </ul>
        </article>
      </section>
    </main>
  )
}

export default App
