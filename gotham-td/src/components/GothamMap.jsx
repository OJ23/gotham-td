import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'

const MAP_WIDTH = 1600
const MAP_HEIGHT = 2241
const MAP_BOUNDS = [
  [0, 0],
  [MAP_HEIGHT, MAP_WIDTH],
]
const DEFAULT_OVERLAY_OPACITY = 0.44

const BASE_MAP_URL = '/images/13.png'
const TACTICAL_OVERLAY_URL = '/images/11-overlay.png'
const LEGEND_COLOR_MAP = {
  Bane: '#2f9d62',
  'Black Mask': '#3f3f3f',
  'Mr. Freeze': '#28d8e4',
  Catwoman: '#f31fe7',
  Penguin: '#1f56f1',
  Joker: '#8220ff',
  Firefly: '#f5f210',
  Scarecrow: '#ff9715',
  'Professor Pyg': '#ff5f1f',
  'Victor Zsasz': '#d8d2a7',
  Riddler: '#22ff1b',
  'Poison Ivy': '#a6f498',
  Scarface: '#9b1717',
  'Mad Hatter': '#ff1f1f',
  'Two Face': '#bb1fe4',
  'G.C.P.D.': '#3d57bf',
  Anarchy: '#ff0d7a',
  'Harley Quinn': '#8c32aa',
}

const threatColorMap = {
  Low: '#52c41a',
  Medium: '#1677ff',
  High: '#fa8c16',
  Extreme: '#ff4d4f',
}
const hoverImageMap = {
  batman: '/mapimage/batman01.jpeg',
  batmanbeyond: '/mapimage/batman beyond01.jpeg',
  terrymcginnis: '/mapimage/batman beyond01.jpeg',
  batwoman: '/mapimage/batwoman01.jpeg',
  blackmask: '/mapimage/blackmask01.jpeg',
  catwoman: '/mapimage/catwoman01.jpeg',
  deadshot: '/mapimage/deadshot01.jpeg',
  etrigan: '/mapimage/etriggan01.jpeg',
  etriggan: '/mapimage/etriggan01.jpeg',
  commissionergordon: '/mapimage/comissionergordon01.jpeg',
  jimgordon: '/mapimage/comissionergordon01.jpeg',
  harleyquinn: '/mapimage/harleyquinn01.jpeg',
  joker: '/mapimage/joker01.jpeg',
  luciusfox: '/mapimage/lucius fox 01.jpeg',
  nightwing: '/mapimage/nightwing01.jpeg',
  poisonivy: '/mapimage/poisonivy01.jpeg',
  ragman: '/mapimage/ragman01.jpeg',
  redrobin: '/mapimage/redrobin01.jpeg',
  newredrobin: '/mapimage/redrobin01.jpeg',
  robin: '/mapimage/robin01.jpeg',
  newrobin: '/mapimage/robin01.jpeg',
  scarecrow: '/mapimage/scarecrow01.jpeg',
  siralfred: '/mapimage/siralfred01.jpeg',
  alfred: '/mapimage/siralfred01.jpeg',
  alfredpennyworth: '/mapimage/siralfred01.jpeg',
  zatanna: '/mapimage/zatanna02.jpeg',
  zatnna: '/mapimage/zatanna02.jpeg',
}

const scaleY = MAP_HEIGHT / 1600
const scaleX = MAP_WIDTH / 1000

function scalePoint([y, x]) {
  return [Math.round(y * scaleY), Math.round(x * scaleX)]
}

const districtAnchors = {
  Gotham: scalePoint([810, 530]),
  'Old Gotham': scalePoint([1320, 420]),
  'Upper East Side': scalePoint([840, 650]),
  Burnley: scalePoint([470, 520]),
  Otisburg: scalePoint([290, 430]),
  Robinson: scalePoint([1040, 400]),
  Coventry: scalePoint([700, 250]),
  Bowery: scalePoint([560, 760]),
  'City Hall': scalePoint([1140, 820]),
  'Arkham Island': scalePoint([500, 160]),
}

const criminalDistrictMap = {
  Bane: 'Otisburg',
  'Black Mask': 'Burnley',
  'Mr. Freeze': 'Otisburg',
  Catwoman: 'Bowery',
  Penguin: 'Bowery',
  Joker: 'Coventry',
  Firefly: 'Coventry',
  Scarecrow: 'Upper East Side',
  'Professor Pyg': 'Upper East Side',
  'Victor Zsasz': 'Upper East Side',
  Riddler: 'Robinson',
  'Poison Ivy': 'Robinson',
  Scarface: 'City Hall',
  'Mad Hatter': 'City Hall',
  'Two Face': 'Old Gotham',
  'G.C.P.D.': 'City Hall',
  Anarchy: 'Coventry',
  'Harley Quinn': 'Old Gotham',
}

const districtNameLookup = Object.keys(districtAnchors).reduce((lookup, districtName) => {
  lookup[districtName.toLowerCase()] = districtName
  return lookup
}, {})

function resolveDistrictName(value, fallback = 'Gotham') {
  const normalizedValue = String(value || '').trim().toLowerCase()
  return districtNameLookup[normalizedValue] || fallback
}

function isValidMapPoint(mapPoint) {
  return (
    mapPoint &&
    Number.isFinite(mapPoint.x) &&
    Number.isFinite(mapPoint.y) &&
    mapPoint.x >= 0 &&
    mapPoint.x <= MAP_WIDTH &&
    mapPoint.y >= 0 &&
    mapPoint.y <= MAP_HEIGHT
  )
}

function normalizeMapPoint(mapPoint) {
  if (!isValidMapPoint(mapPoint)) {
    return null
  }

  return {
    x: Math.round(mapPoint.x),
    y: Math.round(mapPoint.y),
  }
}

function toPoint([y, x]) {
  return L.latLng(y, x)
}
function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function resolveAffiliation(record, type) {
  if (type === 'hero') {
    return record.role || 'Independent vigilante'
  }

  return record.crimeType || 'Independent operator'
}

function normalizeHoverImageKey(value) {
  return String(value || '')
    .toLowerCase()
    .replaceAll(/[^a-z0-9]/g, '')
}

function resolveHoverImage(record) {
  const aliasKey = normalizeHoverImageKey(record.alias)
  const nameKey = normalizeHoverImageKey(record.name)
  const directMatch = hoverImageMap[aliasKey] || hoverImageMap[nameKey]

  if (directMatch) {
    return directMatch
  }

  const candidateKeys = [aliasKey, nameKey].filter(Boolean)
  const fuzzyMatchKey = Object.keys(hoverImageMap).find(
    (key) =>
      candidateKeys.some((candidate) => candidate.includes(key) || key.includes(candidate)),
  )

  return (fuzzyMatchKey ? hoverImageMap[fuzzyMatchKey] : '') || record.image || ''
}

function buildHoverProfileMarkup(record, type) {
  const displayName = escapeHtml(record.alias || record.name || 'Unknown')
  const affiliation = escapeHtml(resolveAffiliation(record, type))
  const profileType = type === 'hero' ? 'Hero' : 'Criminal'
  const fallbackLabel = escapeHtml((record.alias || record.name || '?').charAt(0).toUpperCase())
  const hoverImage = resolveHoverImage(record)
  const fallbackImage = record.image ? escapeHtml(record.image) : ''
  const imageMarkup = hoverImage
    ? `<div class="map-marker-card__media"><img src="${escapeHtml(hoverImage)}" alt="${displayName}" class="map-marker-card__image"${fallbackImage ? ` onerror="if(this.dataset.fallback){this.src=this.dataset.fallback;this.dataset.fallback='';}else{this.closest('.map-marker-card__media').innerHTML='<span class=&quot;map-marker-card__fallback-label&quot;>${fallbackLabel}</span>';this.closest('.map-marker-card__media').classList.add('map-marker-card__media--fallback');}" data-fallback="${fallbackImage}"` : ` onerror="this.closest('.map-marker-card__media').innerHTML='<span class=&quot;map-marker-card__fallback-label&quot;>${fallbackLabel}</span>';this.closest('.map-marker-card__media').classList.add('map-marker-card__media--fallback');"`} /></div>`
    : `<div class="map-marker-card__media map-marker-card__media--fallback"><span class="map-marker-card__fallback-label">${fallbackLabel}</span></div>`

  return `
    <div class="map-marker-card">
      ${imageMarkup}
      <div class="map-marker-card__content">
        <p class="map-marker-card__eyebrow">${profileType}</p>
        <p class="map-marker-card__name">${displayName}</p>
        <p class="map-marker-card__meta">Affiliation</p>
        <p class="map-marker-card__affiliation">${affiliation}</p>
      </div>
    </div>
  `
}

function buildRecordPoint(index, total, basePoint) {
  const ring = Math.floor(index / 6) + 1
  const angle = ((index % 6) / 6) * Math.PI * 2
  const radius = 26 * ring + Math.min(total, 24)
  return [basePoint[0] + Math.sin(angle) * radius, basePoint[1] + Math.cos(angle) * radius]
}

function resolveFallbackDistrict(record, type) {
  if (type === 'hero') {
    return resolveDistrictName(record.city, 'Gotham')
  }

  return resolveDistrictName(
    record.zone,
    resolveDistrictName(criminalDistrictMap[record.alias], 'Gotham'),
  )
}

function resolveRecordPresentation(record, type, index, total) {
  const districtName = resolveFallbackDistrict(record, type)
  const basePoint = districtAnchors[districtName] || districtAnchors.Gotham
  const fallbackPoint = buildRecordPoint(index, total, basePoint)
  const customPoint = normalizeMapPoint(record.mapPoint)

  return {
    ...record,
    districtName,
    point: customPoint ? [customPoint.y, customPoint.x] : fallbackPoint,
    fallbackPoint,
    hasCustomPoint: Boolean(customPoint),
    customPoint,
  }
}

export default function GothamMap({ heroes, criminals, authFetch, loadData, messageApi }) {
  const [overlayOpacity, setOverlayOpacity] = useState(DEFAULT_OVERLAY_OPACITY)
  const [assignmentType, setAssignmentType] = useState('hero')
  const [assignmentId, setAssignmentId] = useState('')
  const [draftPoint, setDraftPoint] = useState(null)
  const [savingPoint, setSavingPoint] = useState(false)
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)
  const tacticalOverlayRef = useRef(null)
  const heroLayerRef = useRef(null)
  const criminalLayerRef = useRef(null)
  const selectionLayerRef = useRef(null)

  const mappedCriminals = useMemo(
    () =>
      criminals.map((criminal, index) => ({
        ...resolveRecordPresentation(criminal, 'criminal', index, criminals.length),
        displayColor:
          LEGEND_COLOR_MAP[criminal.alias] || threatColorMap[criminal.threatLevel] || '#ff4d4f',
      })),
    [criminals],
  )

  const mappedHeroes = useMemo(
    () => heroes.map((hero, index) => resolveRecordPresentation(hero, 'hero', index, heroes.length)),
    [heroes],
  )

  const assignmentOptions = useMemo(
    () =>
      (assignmentType === 'hero' ? heroes : criminals).map((record) => ({
        id: record._id,
        label: `${record.alias} (${record.name})`,
        record,
      })),
    [assignmentType, criminals, heroes],
  )

  const selectedAssignment = useMemo(
    () => assignmentOptions.find((option) => option.id === assignmentId)?.record || null,
    [assignmentId, assignmentOptions],
  )

  useEffect(() => {
    if (!assignmentOptions.length) {
      setAssignmentId('')
      return
    }

    if (!assignmentOptions.some((option) => option.id === assignmentId)) {
      setAssignmentId(assignmentOptions[0].id)
    }
  }, [assignmentId, assignmentOptions])

  useEffect(() => {
    if (!selectedAssignment) {
      setDraftPoint(null)
      return
    }

    const selectedIndex = assignmentOptions.findIndex((option) => option.id === selectedAssignment._id)
    const fallbackPresentation = resolveRecordPresentation(
      selectedAssignment,
      assignmentType,
      Math.max(selectedIndex, 0),
      assignmentOptions.length,
    )

    setDraftPoint(
      fallbackPresentation.customPoint || {
        x: Math.round(fallbackPresentation.fallbackPoint[1]),
        y: Math.round(fallbackPresentation.fallbackPoint[0]),
      },
    )
  }, [assignmentOptions, assignmentType, selectedAssignment])

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) {
      return undefined
    }

    const map = L.map(mapContainerRef.current, {
      crs: L.CRS.Simple,
      minZoom: -1.75,
      maxZoom: 2,
      zoomSnap: 0.25,
      attributionControl: false,
      zoomControl: true,
    })

    map.createPane('base-map')
    map.getPane('base-map').style.zIndex = 200
    map.createPane('tactical-overlay')
    map.getPane('tactical-overlay').style.zIndex = 300
    map.createPane('markers')
    map.getPane('markers').style.zIndex = 450
    map.createPane('selection')
    map.getPane('selection').style.zIndex = 550

    mapRef.current = map
    map.setMaxBounds(MAP_BOUNDS)

    L.imageOverlay(BASE_MAP_URL, MAP_BOUNDS, {
      alt: 'Gotham city base map',
      className: 'gotham-image-overlay',
      pane: 'base-map',
    }).addTo(map)

    tacticalOverlayRef.current = L.imageOverlay(TACTICAL_OVERLAY_URL, MAP_BOUNDS, {
      alt: 'Gotham tactical district overlay',
      className: 'gotham-image-overlay tactical-overlay',
      opacity: DEFAULT_OVERLAY_OPACITY,
      pane: 'tactical-overlay',
    }).addTo(map)

    heroLayerRef.current = L.layerGroup([], { pane: 'markers' }).addTo(map)
    criminalLayerRef.current = L.layerGroup([], { pane: 'markers' }).addTo(map)
    selectionLayerRef.current = L.layerGroup([], { pane: 'selection' }).addTo(map)

    map.on('click', (event) => {
      setDraftPoint({
        x: Math.round(event.latlng.lng),
        y: Math.round(event.latlng.lat),
      })
    })

    map.fitBounds(MAP_BOUNDS)

    return () => {
      heroLayerRef.current = null
      criminalLayerRef.current = null
      selectionLayerRef.current = null
      tacticalOverlayRef.current = null
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    tacticalOverlayRef.current?.setOpacity(overlayOpacity)
  }, [overlayOpacity])

  useEffect(() => {
    const map = mapRef.current
    const heroLayer = heroLayerRef.current
    const criminalLayer = criminalLayerRef.current

    if (!map || !heroLayer || !criminalLayer) {
      return
    }

    heroLayer.clearLayers()
    criminalLayer.clearLayers()

    mappedHeroes.forEach((hero) => {
      L.circleMarker(toPoint(hero.point), {
        pane: 'markers',
        radius: 8,
        color: '#ffffff',
        weight: 2,
        fillColor: '#2f54eb',
        fillOpacity: 0.95,
      })
        .bindTooltip(buildHoverProfileMarkup(hero, 'hero'), {
          direction: 'top',
          offset: [0, -12],
          opacity: 1,
          className: 'map-marker-tooltip',
        })
        .addTo(heroLayer)
    })

    mappedCriminals.forEach((criminal) => {
      L.circleMarker(toPoint(criminal.point), {
        pane: 'markers',
        radius: 9,
        color: '#101828',
        weight: 2,
        fillColor: criminal.displayColor,
        fillOpacity: 0.95,
      })
        .bindTooltip(buildHoverProfileMarkup(criminal, 'criminal'), {
          direction: 'top',
          offset: [0, -12],
          opacity: 1,
          className: 'map-marker-tooltip',
        })
        .addTo(criminalLayer)
    })

    map.invalidateSize()
  }, [mappedCriminals, mappedHeroes])

  useEffect(() => {
    const selectionLayer = selectionLayerRef.current
    if (!selectionLayer) {
      return
    }

    selectionLayer.clearLayers()

    const normalizedPoint = normalizeMapPoint(draftPoint)
    if (!normalizedPoint || !selectedAssignment) {
      return
    }

    L.circleMarker(toPoint([normalizedPoint.y, normalizedPoint.x]), {
      pane: 'selection',
      radius: 11,
      color: '#f8fafc',
      weight: 3,
      fillColor: assignmentType === 'hero' ? '#60a5fa' : '#fb7185',
      fillOpacity: 0.95,
    })
      .bindPopup(`<strong>${selectedAssignment.alias}</strong><br />Pending map point`)
      .addTo(selectionLayer)
  }, [assignmentType, draftPoint, selectedAssignment])

  const handleSavePoint = useCallback(async () => {
    const normalizedPoint = normalizeMapPoint(draftPoint)
    if (!selectedAssignment || !normalizedPoint) {
      messageApi.error('Select a record and click the map to place a point first.')
      return
    }

    try {
      setSavingPoint(true)
      const resourcePath = assignmentType === 'hero' ? 'heroes' : 'criminals'
      const response = await authFetch(`/api/${resourcePath}/${selectedAssignment._id}/map-point`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mapPoint: normalizedPoint }),
      })

      if (!response.ok) {
        throw new Error('Failed to save map point')
      }

      await loadData()
      messageApi.success(`${selectedAssignment.alias} map point saved.`)
    } catch (error) {
      messageApi.error(error.message)
    } finally {
      setSavingPoint(false)
    }
  }, [assignmentType, authFetch, draftPoint, loadData, messageApi, selectedAssignment])

  const handleClearPoint = useCallback(async () => {
    if (!selectedAssignment) {
      return
    }

    try {
      setSavingPoint(true)
      const resourcePath = assignmentType === 'hero' ? 'heroes' : 'criminals'
      const response = await authFetch(`/api/${resourcePath}/${selectedAssignment._id}/map-point`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mapPoint: null }),
      })

      if (!response.ok) {
        throw new Error('Failed to clear map point')
      }

      setDraftPoint(null)
      await loadData()
      messageApi.success(`${selectedAssignment.alias} custom map point cleared.`)
    } catch (error) {
      messageApi.error(error.message)
    } finally {
      setSavingPoint(false)
    }
  }, [assignmentType, authFetch, loadData, messageApi, selectedAssignment])

  return (
    <div className="map-page">
      <div className="map-shell">
        <div className="map-stage" ref={mapContainerRef} />
        <div className="map-panel">
          <div className="map-panel-block">
            <h4>Map Layers</h4>
            <p>
              There are Two(2) maps currently in use. The Base map uses The High Level Map.png. Tactical district coloring comes from the Deatiled Map.png
              overlay. Saved custom points override the district fallback for each record.
            </p>
            <label className="map-range-label" htmlFor="overlayOpacity">
              Overlay opacity
            </label>
            <input
              id="overlayOpacity"
              className="map-range"
              type="range"
              min="0"
              max="0.85"
              step="0.01"
              value={overlayOpacity}
              onChange={(event) => setOverlayOpacity(Number(event.target.value))}
            />
            <p>{Math.round(overlayOpacity * 100)}% overlay intensity</p>
          </div>
          <div className="map-panel-block">
            <h4>Assign Exact Point</h4>
            <p>Select a record, click any point on the map, then save that exact marker position.</p>
            <div className="d-grid gap-2">
              <select
                className="form-select"
                value={assignmentType}
                onChange={(event) => setAssignmentType(event.target.value)}
              >
                <option value="hero">Hero</option>
                <option value="criminal">Criminal</option>
              </select>
              <select
                className="form-select"
                value={assignmentId}
                onChange={(event) => setAssignmentId(event.target.value)}
              >
                {assignmentOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="form-text">
                {draftPoint
                  ? `Pending point: x ${draftPoint.x}, y ${draftPoint.y}`
                  : 'No custom point selected yet.'}
              </div>
              <button
                type="button"
                className="btn btn-primary"
                disabled={!assignmentId || !draftPoint || savingPoint}
                onClick={handleSavePoint}
              >
                {savingPoint ? 'Saving...' : 'Save Point'}
              </button>
              <button
                type="button"
                className="btn btn-outline-light"
                disabled={!assignmentId || savingPoint}
                onClick={handleClearPoint}
              >
                Clear Custom Point
              </button>
            </div>
          </div>
          <div className="map-panel-block">
            <h4>Live Totals</h4>
            <p>{heroes.length} heroes plotted</p>
            <p>{criminals.length} criminals plotted</p>
          </div>
          <div className="map-panel-block map-legend">
            <h4>Reference Colors</h4>
            {Object.entries(LEGEND_COLOR_MAP).map(([name, color]) => (
              <div className="legend-row" key={name}>
                <span className="legend-swatch" style={{ backgroundColor: color }} />
                <span>{name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}















