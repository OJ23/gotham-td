import { useEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'

const MAP_WIDTH = 1600
const MAP_HEIGHT = 2241
const MAP_BOUNDS = [
  [0, 0],
  [MAP_HEIGHT, MAP_WIDTH],
]

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

function toPoint([y, x]) {
  return L.latLng(y, x)
}

function buildRecordPoint(index, total, basePoint) {
  const ring = Math.floor(index / 6) + 1
  const angle = ((index % 6) / 6) * Math.PI * 2
  const radius = 26 * ring + Math.min(total, 24)
  return [basePoint[0] + Math.sin(angle) * radius, basePoint[1] + Math.cos(angle) * radius]
}

export default function GothamMap({ heroes, criminals }) {
  const [overlayOpacity, setOverlayOpacity] = useState(0.44)
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)
  const baseOverlayRef = useRef(null)
  const tacticalOverlayRef = useRef(null)
  const heroLayerRef = useRef(null)
  const criminalLayerRef = useRef(null)

  const mappedCriminals = useMemo(
    () =>
      criminals.map((criminal, index) => {
        const districtName = criminalDistrictMap[criminal.alias] || 'Gotham'
        const basePoint = districtAnchors[districtName] || districtAnchors.Gotham
        return {
          ...criminal,
          point: buildRecordPoint(index, criminals.length, basePoint),
          displayColor:
            LEGEND_COLOR_MAP[criminal.alias] || threatColorMap[criminal.threatLevel] || '#ff4d4f',
          districtName,
        }
      }),
    [criminals],
  )

  const mappedHeroes = useMemo(
    () =>
      heroes.map((hero, index) => {
        const districtName = districtAnchors[hero.city] ? hero.city : 'Gotham'
        const basePoint = districtAnchors[districtName] || districtAnchors.Gotham
        return {
          ...hero,
          point: buildRecordPoint(index, heroes.length, basePoint),
          districtName,
        }
      }),
    [heroes],
  )

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

    mapRef.current = map
    map.setMaxBounds(MAP_BOUNDS)

    baseOverlayRef.current = L.imageOverlay(BASE_MAP_URL, MAP_BOUNDS, {
      alt: 'Gotham city base map',
      className: 'gotham-image-overlay',
      pane: 'base-map',
    }).addTo(map)

    tacticalOverlayRef.current = L.imageOverlay(TACTICAL_OVERLAY_URL, MAP_BOUNDS, {
      alt: 'Gotham tactical district overlay',
      className: 'gotham-image-overlay tactical-overlay',
      opacity: overlayOpacity,
      pane: 'tactical-overlay',
    }).addTo(map)

    heroLayerRef.current = L.layerGroup([], { pane: 'markers' }).addTo(map)
    criminalLayerRef.current = L.layerGroup([], { pane: 'markers' }).addTo(map)

    map.fitBounds(MAP_BOUNDS)

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [overlayOpacity])

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
        .bindPopup(
          `<strong>${hero.alias}</strong><br />Hero<br />Role: ${hero.role || 'Unknown'}<br />Zone: ${hero.city || hero.districtName}<br />Power: ${hero.power}`,
        )
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
        .bindPopup(
          `<strong>${criminal.alias}</strong><br />Criminal<br />Threat: ${criminal.threatLevel}<br />Zone: ${criminal.districtName}`,
        )
        .addTo(criminalLayer)
    })

    map.invalidateSize()
  }, [mappedCriminals, mappedHeroes])

  return (
    <div className="map-page">
      <div className="map-shell">
        <div className="map-stage" ref={mapContainerRef} />
        <div className="map-panel">
          <div className="map-panel-block">
            <h4>Map Layers</h4>
            <p>Base map uses `13.png`. Tactical district coloring comes from your `11.jpg` overlay.</p>
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
