import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  App as AntApp,
  Alert,
  Button,
  Card,
  ConfigProvider,
  Layout,
  Typography,
  notification,
  message,
  theme,
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import AuthGate from './components/AuthGate.jsx'
import GothamMap from './components/GothamMap.jsx'
import AppSidebar from './components/layout/AppSidebar.jsx'
import CriminalEditModal from './components/modals/CriminalEditModal.jsx'
import HeroEditModal from './components/modals/HeroEditModal.jsx'
import CharacterNotFoundPage from './components/pages/CharacterNotFoundPage.jsx'
import CharacterProfilePage from './components/pages/CharacterProfilePage.jsx'
import CriminalPage from './components/pages/CriminalPage.jsx'
import DashboardPage from './components/pages/DashboardPage.jsx'
import HeroPage from './components/pages/HeroPage.jsx'
import HomePage from './components/pages/HomePage.jsx'
import {
  fallbackCarouselItems,
  pageTitleMap,
  threatColors,
} from './constants/appData.js'
import useRegistryData from './hooks/useRegistryData.js'
import { runBatSwarm } from './utils/batSwarm.js'
import './App.css'

const { Sider, Content } = Layout
const { Title, Text } = Typography

const gothamTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: '#6f9cff',
    colorInfo: '#6f9cff',
    colorSuccess: '#5ad8a6',
    colorWarning: '#f0b45a',
    colorError: '#ff6b6b',
    colorBgBase: '#070b14',
    colorBgContainer: '#0f1728',
    colorBgElevated: '#131d31',
    colorBgLayout: '#050811',
    colorBorder: '#243250',
    colorText: '#ecf3ff',
    colorTextSecondary: '#9fb1d1',
    borderRadius: 16,
  },
  components: {
    Layout: {
      siderBg: '#09101d',
      bodyBg: '#050811',
      triggerBg: '#0f1728',
    },
    Menu: {
      darkItemBg: '#09101d',
      itemBg: '#09101d',
      itemColor: '#cbd8f1',
      itemHoverBg: 'rgba(56, 88, 152, 0.28)',
      itemSelectedBg: 'rgba(66, 103, 185, 0.42)',
      itemSelectedColor: '#f4f8ff',
      groupTitleColor: '#7f95bf',
    },
    Card: {
      colorBgContainer: 'rgba(12, 18, 32, 0.94)',
      colorBorderSecondary: '#243250',
      headerBg: 'rgba(10, 16, 29, 0.85)',
    },
    Table: {
      headerBg: '#0b1322',
      headerColor: '#dbe7ff',
      rowHoverBg: 'rgba(39, 58, 96, 0.32)',
      borderColor: '#23314d',
      colorBgContainer: 'rgba(10, 16, 29, 0.92)',
    },
    Input: {
      colorBgContainer: '#0b1322',
      colorBorder: '#2b3a59',
      colorTextPlaceholder: '#7284aa',
      activeBorderColor: '#6f9cff',
      hoverBorderColor: '#4f6fa8',
    },
    Select: {
      colorBgContainer: '#0b1322',
      colorBorder: '#2b3a59',
      optionSelectedBg: 'rgba(66, 103, 185, 0.35)',
      optionActiveBg: 'rgba(39, 58, 96, 0.32)',
    },
    Button: {
      primaryShadow: '0 10px 24px rgba(32, 63, 127, 0.34)',
      defaultBg: '#0b1322',
      defaultBorderColor: '#2b3a59',
      defaultColor: '#e7efff',
    },
    Modal: {
      contentBg: '#0e1628',
      headerBg: '#0e1628',
      titleColor: '#ecf3ff',
    },
  },
}

function AuthenticatedAppShell({
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
      })),
      ...criminals.slice(0, 5).map((criminal) => ({
        key: criminal._id,
        type: 'Criminal',
        alias: criminal.alias,
        name: criminal.name,
        meta: `${criminal.crimeType} | ${criminal.zone || 'Gotham'} | ${criminal.threatLevel}`,
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
      })),
      ...criminals.map((criminal) => ({
        key: `criminal-${criminal._id}`,
        type: 'Villain',
        alias: criminal.alias,
        name: criminal.name,
        image: criminal.image,
        metaPrimary: criminal.crimeType || 'Unknown activity',
        metaSecondary: `${criminal.threatLevel || 'Medium'} threat`,
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
      setSearchResult({ type: 'hero', character: matchingHero, query })
      setActivePage('search')
      setHeroSearch(query)
      setHeroCityFilter('all')
      setCriminalSearch('')
      setCriminalThreatFilter('all')
      return
    }

    const matchingCriminal = criminals.find(
      (criminal) =>
        criminal.alias?.toLowerCase().includes(normalizedQuery) ||
        criminal.name?.toLowerCase().includes(normalizedQuery) ||
        criminal.crimeType?.toLowerCase().includes(normalizedQuery),
    )

    if (matchingCriminal) {
      setSearchResult({ type: 'criminal', character: matchingCriminal, query })
      setActivePage('search')
      setCriminalSearch(query)
      setCriminalThreatFilter('all')
      setHeroSearch('')
      setHeroCityFilter('all')
      return
    }

    setSearchResult({ type: 'not-found', query })
    setActivePage('search')
    setHeroSearch(query)
    setCriminalSearch(query)
    setHeroCityFilter('all')
    setCriminalThreatFilter('all')
  }, [criminals, heroes, registrySearch])

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
        />
      )
    }

    if (activePage === 'map') {
      return <GothamMap heroes={heroes} criminals={criminals} />
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
                    Track heroes and criminals in MongoDB collections.
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

            {!isPrivilegedUser && activePage !== 'search' && (
              <Alert
                className="mb-3"
                type="info"
                showIcon
                message="Authenticated as standard user"
                description="You can view records and create new heroes or criminals. Delete actions require an admin or super admin role."
              />
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

function App() {
  const [messageApi, messageContext] = message.useMessage()
  const [notificationApi, notificationContext] = notification.useNotification()

  return (
    <ConfigProvider theme={gothamTheme}>
      <AntApp>
      {messageContext}
      {notificationContext}
      <AuthGate messageApi={messageApi} notificationApi={notificationApi}>
        {({ authFetch, currentUser, handleLogout, isPrivilegedUser }) => (
          <AuthenticatedAppShell
            authFetch={authFetch}
            currentUser={currentUser}
            handleLogout={handleLogout}
            isPrivilegedUser={isPrivilegedUser}
            messageApi={messageApi}
            notificationApi={notificationApi}
          />
        )}
      </AuthGate>
      </AntApp>
    </ConfigProvider>
  )
}

export default App



