import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button, Card, Layout, Typography } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import GothamMap from './GothamMap.jsx'
import AppSidebar from './layout/AppSidebar.jsx'
import CriminalEditModal from './modals/CriminalEditModal.jsx'
import HeroEditModal from './modals/HeroEditModal.jsx'
import CharacterNotFoundPage from './pages/CharacterNotFoundPage.jsx'
import CharacterProfilePage from './pages/CharacterProfilePage.jsx'
import CriminalPage from './pages/CriminalPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import HeroPage from './pages/HeroPage.jsx'
import HomePage from './pages/HomePage.jsx'
import {
  fallbackCarouselItems,
  pageTitleMap,
  threatColors,
} from '../constants/appData.js'
import useRegistryData from '../hooks/useRegistryData.js'
import { runBatSwarm } from '../utils/batSwarm.js'

const { Sider, Content } = Layout
const { Title, Text } = Typography

export default function RegistryWorkspace({
  authFetch,
  currentUser,
  handleLogout,
  isPrivilegedUser,
  messageApi,
  notificationApi,
}) {
  const [collapsed, setCollapsed] = useState(true)
  const [activePage, setActivePage] = useState('home')
  const [homeCarouselIndex, setHomeCarouselIndex] = useState(0)
  const [heroSearch, setHeroSearch] = useState('')
  const [criminalSearch, setCriminalSearch] = useState('')
  const [heroCityFilter, setHeroCityFilter] = useState('all')
  const [criminalThreatFilter, setCriminalThreatFilter] = useState('all')
  const [registrySearch, setRegistrySearch] = useState('')
  const [searchResult, setSearchResult] = useState(null)
  const lastSwarmPageRef = useRef('')

  const {
    addCriminal,
    addHero,
    bulkDelete,
    confirmDelete,
    criminalForm,
    criminals,
    criminalSubmitted,
    editCriminalForm,
    editCriminalImageFile,
    editHeroForm,
    editHeroImageFile,
    editingCriminal,
    editingHero,
    editSubmitting,
    error,
    exportToCsv,
    heroCities,
    heroForm,
    heroSubmitted,
    heroes,
    loadData,
    loading,
    openCriminalEditor,
    openHeroEditor,
    resetRegistryState,
    saveCriminalEdit,
    saveHeroEdit,
    selectedCriminalIds,
    selectedHeroIds,
    setCriminalForm,
    setCriminalImageFile,
    setEditCriminalForm,
    setEditCriminalImageFile,
    setEditingCriminal,
    setEditingHero,
    setEditHeroForm,
    setEditHeroImageFile,
    setHeroForm,
    setHeroImageFile,
    setSelectedCriminalIds,
    setSelectedHeroIds,
    uploadingType,
  } = useRegistryData({ authFetch, messageApi, notificationApi })

  useEffect(() => {
    if (activePage === 'home') {
      setCollapsed(true)
    }
  }, [activePage])

  useEffect(() => {
    if (currentUser) {
      return
    }

    lastSwarmPageRef.current = ''
    resetRegistryState()
    setCollapsed(true)
    setActivePage('home')
    setHomeCarouselIndex(0)
    setHeroSearch('')
    setCriminalSearch('')
    setHeroCityFilter('all')
    setCriminalThreatFilter('all')
    setRegistrySearch('')
    setSearchResult(null)
  }, [currentUser, resetRegistryState])

  useEffect(() => {
    if (!currentUser) {
      lastSwarmPageRef.current = ''
      return
    }

    if (lastSwarmPageRef.current === activePage) {
      return
    }

    lastSwarmPageRef.current = activePage
    const timeoutId = window.setTimeout(() => {
      runBatSwarm()
    }, 120)

    return () => window.clearTimeout(timeoutId)
  }, [activePage, currentUser])

  useEffect(() => {
    if (!searchResult || searchResult.type === 'not-found') {
      return
    }

    const sourceList = searchResult.type === 'hero' ? heroes : criminals
    const refreshedRecord = sourceList.find((item) => item._id === searchResult.character?._id)

    if (!refreshedRecord || refreshedRecord === searchResult.character) {
      return
    }

    setSearchResult((prev) =>
      prev && prev.type === searchResult.type
        ? {
            ...prev,
            character: refreshedRecord,
          }
        : prev,
    )
  }, [criminals, heroes, searchResult])

  const openCharacterProfile = useCallback((type, character, query = '') => {
    if (!character) {
      return
    }

    const normalizedType = type === 'hero' ? 'hero' : 'criminal'
    const resolvedQuery = query || character.alias || character.name || ''

    setSearchResult({
      type: normalizedType,
      character,
      query: resolvedQuery,
    })
    setActivePage('search')

    if (normalizedType === 'hero') {
      setHeroSearch(resolvedQuery)
      setHeroCityFilter('all')
      setCriminalSearch('')
      setCriminalThreatFilter('all')
      return
    }

    setCriminalSearch(resolvedQuery)
    setCriminalThreatFilter('all')
    setHeroSearch('')
    setHeroCityFilter('all')
  }, [])

  const handleEditFromProfile = useCallback(() => {
    if (!searchResult || searchResult.type === 'not-found') {
      return
    }

    if (searchResult.type === 'hero') {
      openHeroEditor(searchResult.character)
      return
    }

    openCriminalEditor(searchResult.character)
  }, [openCriminalEditor, openHeroEditor, searchResult])

  const filteredHeroes = useMemo(() => {
    const search = heroSearch.toLowerCase()
    return heroes.filter((hero) => {
      const matchesSearch =
        !search ||
        hero.alias?.toLowerCase().includes(search) ||
        hero.name?.toLowerCase().includes(search) ||
        hero.role?.toLowerCase().includes(search) ||
        hero.power?.toLowerCase().includes(search)
      const matchesCity = heroCityFilter === 'all' || hero.city === heroCityFilter
      return matchesSearch && matchesCity
    })
  }, [heroes, heroSearch, heroCityFilter])

  const filteredCriminals = useMemo(() => {
    const search = criminalSearch.toLowerCase()
    return criminals.filter((criminal) => {
      const matchesSearch =
        !search ||
        criminal.alias?.toLowerCase().includes(search) ||
        criminal.name?.toLowerCase().includes(search) ||
        criminal.crimeType?.toLowerCase().includes(search)
      const matchesThreat =
        criminalThreatFilter === 'all' || criminal.threatLevel === criminalThreatFilter
      return matchesSearch && matchesThreat
    })
  }, [criminals, criminalSearch, criminalThreatFilter])

  const activityItems = useMemo(
    () =>
      [
        ...heroes.slice(0, 3).map((hero) => ({ ...hero, itemType: 'hero' })),
        ...criminals.slice(0, 3).map((criminal) => ({ ...criminal, itemType: 'criminal' })),
      ].slice(0, 6),
    [heroes, criminals],
  )

  const recentRecords = useMemo(
    () => [
      ...heroes.slice(0, 5).map((hero) => ({
        key: hero._id,
        type: 'Hero',
        alias: hero.alias,
        name: hero.name,
        meta: `${hero.role} | ${hero.power} | ${hero.city}`,
        source: hero,
      })),
      ...criminals.slice(0, 5).map((criminal) => ({
        key: criminal._id,
        type: 'Criminal',
        alias: criminal.alias,
        name: criminal.name,
        meta: `${criminal.crimeType} | ${criminal.zone || 'Gotham'} | ${criminal.threatLevel}`,
        source: criminal,
      })),
    ],
    [heroes, criminals],
  )

  const recentColumns = useMemo(
    () => [
      { title: 'Type', dataIndex: 'type', key: 'type' },
      { title: 'Alias', dataIndex: 'alias', key: 'alias' },
      { title: 'Name', dataIndex: 'name', key: 'name' },
      { title: 'Details', dataIndex: 'meta', key: 'meta' },
    ],
    [],
  )

  const homeCarouselItems = useMemo(() => {
    const liveItems = [
      ...heroes.map((hero) => ({
        key: `hero-${hero._id}`,
        type: 'Hero',
        alias: hero.alias,
        name: hero.name,
        image: hero.image,
        metaPrimary: hero.role || 'Guardian',
        metaSecondary: hero.power || 'Unknown ability',
        source: hero,
      })),
      ...criminals.map((criminal) => ({
        key: `criminal-${criminal._id}`,
        type: 'Villain',
        alias: criminal.alias,
        name: criminal.name,
        image: criminal.image,
        metaPrimary: criminal.crimeType || 'Unknown activity',
        metaSecondary: `${criminal.threatLevel || 'Medium'} threat`,
        source: criminal,
      })),
    ].sort((a, b) => a.alias.localeCompare(b.alias))

    if (liveItems.length >= 20) {
      return liveItems.slice(0, 20)
    }

    const fallbackPool = fallbackCarouselItems.filter(
      (fallbackItem) =>
        !liveItems.some(
          (liveItem) => liveItem.alias.toLowerCase() === fallbackItem.alias.toLowerCase(),
        ),
    )

    return [...liveItems, ...fallbackPool].slice(0, 20)
  }, [criminals, heroes])

  const homeCarouselSlides = useMemo(() => {
    const slides = []
    for (let index = 0; index < homeCarouselItems.length; index += 4) {
      slides.push(homeCarouselItems.slice(index, index + 4))
    }
    return slides
  }, [homeCarouselItems])

  useEffect(() => {
    if (homeCarouselSlides.length <= 1) {
      setHomeCarouselIndex(0)
      return
    }

    const intervalId = window.setInterval(() => {
      setHomeCarouselIndex((prev) => (prev + 1) % homeCarouselSlides.length)
    }, 3600)

    return () => window.clearInterval(intervalId)
  }, [homeCarouselSlides.length])

  const handleRegistrySearchSubmit = useCallback(() => {
    const query = registrySearch.trim()
    if (!query) {
      return
    }

    const normalizedQuery = query.toLowerCase()
    const matchingHero = heroes.find(
      (hero) =>
        hero.alias?.toLowerCase().includes(normalizedQuery) ||
        hero.name?.toLowerCase().includes(normalizedQuery) ||
        hero.role?.toLowerCase().includes(normalizedQuery) ||
        hero.power?.toLowerCase().includes(normalizedQuery),
    )

    if (matchingHero) {
      openCharacterProfile('hero', matchingHero, query)
      return
    }

    const matchingCriminal = criminals.find(
      (criminal) =>
        criminal.alias?.toLowerCase().includes(normalizedQuery) ||
        criminal.name?.toLowerCase().includes(normalizedQuery) ||
        criminal.crimeType?.toLowerCase().includes(normalizedQuery),
    )

    if (matchingCriminal) {
      openCharacterProfile('criminal', matchingCriminal, query)
      return
    }

    setSearchResult({ type: 'not-found', query })
    setActivePage('search')
    setHeroSearch(query)
    setCriminalSearch(query)
    setHeroCityFilter('all')
    setCriminalThreatFilter('all')
  }, [criminals, heroes, openCharacterProfile, registrySearch])

  const handleSidebarSearchIconClick = useCallback(() => {
    setCollapsed(false)
  }, [])

  const handleOpenRegistryFromSearch = useCallback(() => {
    if (!searchResult || searchResult.type === 'not-found') {
      return
    }

    if (searchResult.type === 'hero') {
      setActivePage('heroes')
      setHeroSearch(searchResult.query)
      setHeroCityFilter('all')
      return
    }

    setActivePage('criminals')
    setCriminalSearch(searchResult.query)
    setCriminalThreatFilter('all')
  }, [searchResult])

  const jumpToForm = (page, formId) => {
    setSearchResult(null)
    setActivePage(page)
    window.setTimeout(() => {
      document.getElementById(formId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 0)
  }

  const renderCurrentPage = () => {
    if (activePage === 'home') {
      return (
        <HomePage
          homeCarouselSlides={homeCarouselSlides}
          homeCarouselIndex={homeCarouselIndex}
          setHomeCarouselIndex={setHomeCarouselIndex}
          heroes={heroes}
          criminals={criminals}
          setActivePage={setActivePage}
          onCharacterSelect={openCharacterProfile}
        />
      )
    }

    if (activePage === 'map') {
      return <GothamMap heroes={heroes} criminals={criminals} authFetch={authFetch} loadData={loadData} messageApi={messageApi} />
    }

    if (activePage === 'dashboard') {
      return (
        <DashboardPage
          heroes={heroes}
          criminals={criminals}
          heroCities={heroCities}
          activityItems={activityItems}
          recentRecords={recentRecords}
          recentColumns={recentColumns}
          loadData={loadData}
          onJumpToForm={jumpToForm}
          onCharacterSelect={openCharacterProfile}
        />
      )
    }

    if (activePage === 'search') {
      if (searchResult?.type === 'not-found') {
        return (
          <CharacterNotFoundPage
            query={searchResult.query}
            onBackHome={() => {
              setSearchResult(null)
              setActivePage('home')
            }}
          />
        )
      }

      if (searchResult) {
        return (
          <CharacterProfilePage
            result={searchResult}
            onBackToRegistry={handleOpenRegistryFromSearch}
            onEditCharacter={handleEditFromProfile}
          />
        )
      }
    }

    if (activePage === 'heroes') {
      return (
        <HeroPage
          heroForm={heroForm}
          setHeroForm={setHeroForm}
          heroSubmitted={heroSubmitted}
          addHero={addHero}
          setHeroImageFile={setHeroImageFile}
          uploadingType={uploadingType}
          heroSearch={heroSearch}
          setHeroSearch={setHeroSearch}
          heroCityFilter={heroCityFilter}
          setHeroCityFilter={setHeroCityFilter}
          heroCities={heroCities}
          filteredHeroes={filteredHeroes}
          heroes={heroes}
          exportToCsv={exportToCsv}
          bulkDelete={bulkDelete}
          isPrivilegedUser={isPrivilegedUser}
          selectedHeroIds={selectedHeroIds}
          setSelectedHeroIds={setSelectedHeroIds}
          loading={loading}
          openHeroEditor={openHeroEditor}
          confirmDelete={confirmDelete}
          onCharacterSelect={openCharacterProfile}
        />
      )
    }

    return (
      <CriminalPage
        criminalForm={criminalForm}
        setCriminalForm={setCriminalForm}
        criminalSubmitted={criminalSubmitted}
        addCriminal={addCriminal}
        setCriminalImageFile={setCriminalImageFile}
        uploadingType={uploadingType}
        criminalSearch={criminalSearch}
        setCriminalSearch={setCriminalSearch}
        criminalThreatFilter={criminalThreatFilter}
        setCriminalThreatFilter={setCriminalThreatFilter}
        filteredCriminals={filteredCriminals}
        criminals={criminals}
        exportToCsv={exportToCsv}
        bulkDelete={bulkDelete}
        isPrivilegedUser={isPrivilegedUser}
        selectedCriminalIds={selectedCriminalIds}
        setSelectedCriminalIds={setSelectedCriminalIds}
        loading={loading}
        openCriminalEditor={openCriminalEditor}
        confirmDelete={confirmDelete}
        threatColors={threatColors}
        onCharacterSelect={openCharacterProfile}
      />
    )
  }

  return (
    <>
      <HeroEditModal
        editingHero={editingHero}
        editHeroForm={editHeroForm}
        editHeroImageFile={editHeroImageFile}
        editSubmitting={editSubmitting}
        onCancel={() => {
          setEditingHero(null)
          setEditHeroImageFile(null)
        }}
        onSave={saveHeroEdit}
        onFormChange={(field, value) =>
          setEditHeroForm((prev) => ({ ...prev, [field]: value }))
        }
        onImageFileChange={setEditHeroImageFile}
      />

      <CriminalEditModal
        editingCriminal={editingCriminal}
        editCriminalForm={editCriminalForm}
        editCriminalImageFile={editCriminalImageFile}
        editSubmitting={editSubmitting}
        onCancel={() => {
          setEditingCriminal(null)
          setEditCriminalImageFile(null)
        }}
        onSave={saveCriminalEdit}
        onFormChange={(field, value) =>
          setEditCriminalForm((prev) => ({ ...prev, [field]: value }))
        }
        onImageFileChange={setEditCriminalImageFile}
      />

      <Layout className="app-shell">
        <Sider
          width={240}
          theme="light"
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          trigger={null}
          className="app-sider"
        >
          <AppSidebar
            collapsed={collapsed}
            activePage={activePage}
            onToggle={() => setCollapsed((prev) => !prev)}
            onNavigate={(page) => {
              setSearchResult(null)
              setActivePage(page)
            }}
            registrySearch={registrySearch}
            onRegistrySearchChange={setRegistrySearch}
            onRegistrySearchSubmit={handleRegistrySearchSubmit}
            onRegistrySearchClick={handleSidebarSearchIconClick}
            extremeAlertsCount={
              criminals.filter((item) => item.threatLevel === 'Extreme').length
            }
            currentUser={currentUser}
            onLogout={handleLogout}
          />
        </Sider>

        <Layout>
          <Content
            className={`app-content ${
              activePage === 'home' ? 'home-content p-0' : 'p-3 p-lg-4'
            }`}
          >
            {activePage !== 'home' && activePage !== 'search' && (
              <div className="page-header d-flex flex-wrap gap-2 align-items-center justify-content-between mb-3">
                <div>
                  <Title level={3} className="mb-1">
                    {pageTitleMap[activePage]}
                  </Title>
                  <Text type="secondary">
                    Track Heroes & Criminals in Gotham.
                  </Text>
                </div>
                {activePage !== 'dashboard' && activePage !== 'map' && (
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() =>
                      jumpToForm(
                        activePage === 'heroes' ? 'heroes' : 'criminals',
                        activePage === 'heroes' ? 'hero-form' : 'criminal-form',
                      )
                    }
                  >
                    {activePage === 'heroes' ? 'Add Hero' : 'Add Criminal'}
                  </Button>
                )}
              </div>
            )}

            {error && (
              <Card className="mb-3 error-card">
                <Text type="danger">{error}</Text>
              </Card>
            )}

            {loading && !heroes.length && !criminals.length ? (
              <div className="loading-wrap">
                <span className="spinner-border text-primary" role="status" />
              </div>
            ) : (
              renderCurrentPage()
            )}
          </Content>
        </Layout>
      </Layout>
    </>
  )
}
