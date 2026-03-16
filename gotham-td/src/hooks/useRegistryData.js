import { useCallback, useEffect, useMemo, useState } from 'react'
import { Modal } from 'antd'
import { initialCriminalForm, initialHeroForm } from '../constants/appData.js'

export default function useRegistryData({ authFetch, messageApi, notificationApi }) {
  const [heroes, setHeroes] = useState([])
  const [criminals, setCriminals] = useState([])
  const [heroForm, setHeroForm] = useState(initialHeroForm)
  const [criminalForm, setCriminalForm] = useState(initialCriminalForm)
  const [heroImageFile, setHeroImageFile] = useState(null)
  const [criminalImageFile, setCriminalImageFile] = useState(null)
  const [uploadingType, setUploadingType] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedHeroIds, setSelectedHeroIds] = useState([])
  const [selectedCriminalIds, setSelectedCriminalIds] = useState([])
  const [heroSubmitted, setHeroSubmitted] = useState(false)
  const [criminalSubmitted, setCriminalSubmitted] = useState(false)
  const [editingHero, setEditingHero] = useState(null)
  const [editingCriminal, setEditingCriminal] = useState(null)
  const [editHeroForm, setEditHeroForm] = useState(initialHeroForm)
  const [editCriminalForm, setEditCriminalForm] = useState(initialCriminalForm)
  const [editHeroImageFile, setEditHeroImageFile] = useState(null)
  const [editCriminalImageFile, setEditCriminalImageFile] = useState(null)
  const [editSubmitting, setEditSubmitting] = useState(false)

  const resetRegistryState = useCallback(() => {
    setHeroes([])
    setCriminals([])
    setHeroForm(initialHeroForm)
    setCriminalForm(initialCriminalForm)
    setHeroImageFile(null)
    setCriminalImageFile(null)
    setUploadingType(null)
    setLoading(false)
    setError('')
    setSelectedHeroIds([])
    setSelectedCriminalIds([])
    setHeroSubmitted(false)
    setCriminalSubmitted(false)
    setEditingHero(null)
    setEditingCriminal(null)
    setEditHeroForm(initialHeroForm)
    setEditCriminalForm(initialCriminalForm)
    setEditHeroImageFile(null)
    setEditCriminalImageFile(null)
    setEditSubmitting(false)
  }, [])

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const [heroesRes, criminalsRes] = await Promise.all([
        authFetch('/api/heroes'),
        authFetch('/api/criminals'),
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
      messageApi.error(err.message)
    } finally {
      setLoading(false)
    }
  }, [authFetch, messageApi])

  useEffect(() => {
    loadData()
  }, [loadData])

  const uploadImage = useCallback(
    async (file, category) => {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('category', category)

      const res = await authFetch('/api/uploads/image', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        throw new Error('Failed to upload image to Cloudinary')
      }

      return res.json()
    },
    [authFetch],
  )

  const addHero = useCallback(
    async (event) => {
      event.preventDefault()
      setHeroSubmitted(true)
      if (!heroForm.name || !heroForm.alias || !heroForm.role || !heroForm.power) {
        return
      }

      try {
        setError('')
        setUploadingType('hero')
        const payload = { ...heroForm }

        if (heroImageFile) {
          const uploadResult = await uploadImage(heroImageFile, 'heroes')
          payload.image = uploadResult.image
          payload.imagePublicId = uploadResult.imagePublicId
        }

        const res = await authFetch('/api/heroes', {
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
        setHeroSubmitted(false)
        notificationApi.success({
          message: 'Hero added',
          description: `${created.alias} is now tracked in the registry.`,
        })
      } catch (err) {
        setError(err.message)
        messageApi.error(err.message)
      } finally {
        setUploadingType(null)
      }
    },
    [authFetch, heroForm, heroImageFile, messageApi, notificationApi, uploadImage],
  )

  const addCriminal = useCallback(
    async (event) => {
      event.preventDefault()
      setCriminalSubmitted(true)
      if (!criminalForm.name || !criminalForm.alias || !criminalForm.crimeType) {
        return
      }

      try {
        setError('')
        setUploadingType('criminal')
        const payload = { ...criminalForm }

        if (criminalImageFile) {
          const uploadResult = await uploadImage(criminalImageFile, 'criminals')
          payload.image = uploadResult.image
          payload.imagePublicId = uploadResult.imagePublicId
        }

        const res = await authFetch('/api/criminals', {
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
        setCriminalSubmitted(false)
        notificationApi.success({
          message: 'Criminal added',
          description: `${created.alias} has been added to the watch list.`,
        })
      } catch (err) {
        setError(err.message)
        messageApi.error(err.message)
      } finally {
        setUploadingType(null)
      }
    },
    [authFetch, criminalForm, criminalImageFile, messageApi, notificationApi, uploadImage],
  )

  const deleteHero = useCallback(
    async (id) => {
      try {
        setError('')
        const res = await authFetch(`/api/heroes/${id}`, { method: 'DELETE' })
        if (!res.ok) {
          throw new Error('Failed to delete hero')
        }
        setHeroes((prev) => prev.filter((hero) => hero._id !== id))
        setSelectedHeroIds((prev) => prev.filter((item) => item !== id))
        messageApi.success('Hero removed')
      } catch (err) {
        setError(err.message)
        messageApi.error(err.message)
      }
    },
    [authFetch, messageApi],
  )

  const deleteCriminal = useCallback(
    async (id) => {
      try {
        setError('')
        const res = await authFetch(`/api/criminals/${id}`, { method: 'DELETE' })
        if (!res.ok) {
          throw new Error('Failed to delete criminal')
        }
        setCriminals((prev) => prev.filter((criminal) => criminal._id !== id))
        setSelectedCriminalIds((prev) => prev.filter((item) => item !== id))
        messageApi.success('Criminal removed')
      } catch (err) {
        setError(err.message)
        messageApi.error(err.message)
      }
    },
    [authFetch, messageApi],
  )

  const openHeroEditor = useCallback((hero) => {
    setEditingHero(hero)
    setEditHeroImageFile(null)
    setEditHeroForm({
      name: hero.name || '',
      alias: hero.alias || '',
      role: hero.role || '',
      power: hero.power || '',
      description: hero.description || '',
      image: hero.image || '',
      imagePublicId: hero.imagePublicId || '',
      city: hero.city || 'Gotham',
    })
  }, [])

  const openCriminalEditor = useCallback((criminal) => {
    setEditingCriminal(criminal)
    setEditCriminalImageFile(null)
    setEditCriminalForm({
      name: criminal.name || '',
      alias: criminal.alias || '',
      crimeType: criminal.crimeType || '',
      zone: criminal.zone || 'Gotham',
      description: criminal.description || '',
      image: criminal.image || '',
      imagePublicId: criminal.imagePublicId || '',
      threatLevel: criminal.threatLevel || 'Medium',
    })
  }, [])

  const saveHeroEdit = useCallback(async () => {
    if (
      !editingHero ||
      !editHeroForm.name ||
      !editHeroForm.alias ||
      !editHeroForm.role ||
      !editHeroForm.power
    ) {
      messageApi.error('Name, alias, role, and power are required')
      return
    }

    try {
      setEditSubmitting(true)
      const payload = { ...editHeroForm }

      if (editHeroImageFile) {
        const uploadResult = await uploadImage(editHeroImageFile, 'heroes')
        payload.image = uploadResult.image
        payload.imagePublicId = uploadResult.imagePublicId
      }

      const res = await authFetch(`/api/heroes/${editingHero._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        throw new Error('Failed to update hero')
      }

      const updated = await res.json()
      setHeroes((prev) => prev.map((hero) => (hero._id === updated._id ? updated : hero)))
      setEditingHero(null)
      setEditHeroImageFile(null)
      messageApi.success('Hero updated')
    } catch (err) {
      messageApi.error(err.message)
    } finally {
      setEditSubmitting(false)
    }
  }, [authFetch, editHeroForm, editHeroImageFile, editingHero, messageApi, uploadImage])

  const saveCriminalEdit = useCallback(async () => {
    if (
      !editingCriminal ||
      !editCriminalForm.name ||
      !editCriminalForm.alias ||
      !editCriminalForm.crimeType
    ) {
      messageApi.error('Name, alias, and crime type are required')
      return
    }

    try {
      setEditSubmitting(true)
      const payload = { ...editCriminalForm }

      if (editCriminalImageFile) {
        const uploadResult = await uploadImage(editCriminalImageFile, 'criminals')
        payload.image = uploadResult.image
        payload.imagePublicId = uploadResult.imagePublicId
      }

      const res = await authFetch(`/api/criminals/${editingCriminal._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        throw new Error('Failed to update criminal')
      }

      const updated = await res.json()
      setCriminals((prev) =>
        prev.map((criminal) => (criminal._id === updated._id ? updated : criminal)),
      )
      setEditingCriminal(null)
      setEditCriminalImageFile(null)
      messageApi.success('Criminal updated')
    } catch (err) {
      messageApi.error(err.message)
    } finally {
      setEditSubmitting(false)
    }
  }, [
    authFetch,
    editCriminalForm,
    editCriminalImageFile,
    editingCriminal,
    messageApi,
    uploadImage,
  ])

  const confirmDelete = useCallback(
    (type, item) => {
      Modal.confirm({
        title: `Delete ${type === 'hero' ? 'hero' : 'criminal'}`,
        content: `This will permanently remove ${item.alias}.`,
        okText: 'Delete',
        okType: 'danger',
        cancelText: 'Cancel',
        onOk: async () => {
          if (type === 'hero') {
            await deleteHero(item._id)
          } else {
            await deleteCriminal(item._id)
          }
        },
      })
    },
    [deleteCriminal, deleteHero],
  )

  const bulkDelete = useCallback(
    (type) => {
      const ids = type === 'hero' ? selectedHeroIds : selectedCriminalIds
      if (!ids.length) {
        return
      }

      Modal.confirm({
        title: `Delete selected ${type === 'hero' ? 'heroes' : 'criminals'}`,
        content: `Delete ${ids.length} selected records?`,
        okText: 'Delete selected',
        okType: 'danger',
        onOk: async () => {
          const responses = await Promise.all(
            ids.map((id) =>
              authFetch(`/api/${type === 'hero' ? 'heroes' : 'criminals'}/${id}`, {
                method: 'DELETE',
              }),
            ),
          )

          if (responses.some((response) => !response.ok)) {
            throw new Error('Failed to delete one or more selected records')
          }

          if (type === 'hero') {
            setHeroes((prev) => prev.filter((item) => !ids.includes(item._id)))
            setSelectedHeroIds([])
          } else {
            setCriminals((prev) => prev.filter((item) => !ids.includes(item._id)))
            setSelectedCriminalIds([])
          }
          messageApi.success('Selected records deleted')
        },
      })
    },
    [authFetch, messageApi, selectedCriminalIds, selectedHeroIds],
  )

  const exportToCsv = useCallback(
    (records, fileName, type) => {
      if (!records.length) {
        messageApi.info('No records to export')
        return
      }

      const headers =
        type === 'hero'
          ? ['Alias', 'Name', 'Role', 'Power', 'City', 'Description']
          : ['Alias', 'Name', 'Crime Type', 'Zone', 'Threat Level', 'Description']

      const rows = records.map((item) =>
        type === 'hero'
          ? [item.alias, item.name, item.role, item.power, item.city, item.description || '']
          : [
              item.alias,
              item.name,
              item.crimeType,
              item.zone || '',
              item.threatLevel,
              item.description || '',
            ],
      )

      const csvContent = [headers, ...rows]
        .map((row) => row.map((cell) => `"${String(cell || '').replaceAll('"', '""')}"`).join(','))
        .join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = fileName
      link.click()
      URL.revokeObjectURL(link.href)
    },
    [messageApi],
  )

  const heroCities = useMemo(
    () => [...new Set(heroes.map((hero) => hero.city).filter(Boolean))],
    [heroes],
  )

  return {
    addCriminal,
    addHero,
    bulkDelete,
    confirmDelete,
    criminalForm,
    criminals,
    criminalSubmitted,
    deleteCriminal,
    deleteHero,
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
  }
}
