import {
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  MoreOutlined,
  PlusOutlined,
  SearchOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Avatar, Button, Card, Dropdown, Empty, Input, Select, Space, Table, Tag, Typography } from 'antd'

const { Text } = Typography

export default function HeroPage({
  heroForm,
  setHeroForm,
  heroSubmitted,
  addHero,
  setHeroImageFile,
  uploadingType,
  heroSearch,
  setHeroSearch,
  heroCityFilter,
  setHeroCityFilter,
  heroCities,
  filteredHeroes,
  heroes,
  exportToCsv,
  bulkDelete,
  isPrivilegedUser,
  selectedHeroIds,
  setSelectedHeroIds,
  loading,
  openHeroEditor,
  confirmDelete,
}) {
  const heroColumns = [
    {
      title: 'Alias',
      dataIndex: 'alias',
      key: 'alias',
      sorter: (a, b) => a.alias.localeCompare(b.alias),
      render: (value, record) => (
        <Space>
          {record.image ? <Avatar src={record.image} shape="square" /> : <Avatar shape="square" icon={<UserOutlined />} />}
          <strong>{value}</strong>
        </Space>
      ),
    },
    { title: 'Name', dataIndex: 'name', key: 'name', sorter: (a, b) => a.name.localeCompare(b.name) },
    { title: 'Power', dataIndex: 'power', key: 'power', sorter: (a, b) => a.power.localeCompare(b.power) },
    { title: 'Role', dataIndex: 'role', key: 'role', sorter: (a, b) => (a.role || '').localeCompare(b.role || '') },
    { title: 'City', dataIndex: 'city', key: 'city', sorter: (a, b) => (a.city || '').localeCompare(b.city || '') },
    { title: 'Status', key: 'status', render: () => <Tag color="success">Active</Tag> },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      render: (_, record) => (
        <Dropdown
          trigger={['click']}
          menu={{
            items: [
              {
                key: 'edit',
                icon: <EditOutlined />,
                label: 'Edit',
                disabled: !isPrivilegedUser,
                onClick: () => openHeroEditor(record),
              },
              {
                key: 'delete',
                danger: true,
                icon: <DeleteOutlined />,
                label: 'Delete',
                disabled: !isPrivilegedUser,
                onClick: () => confirmDelete('hero', record),
              },
            ],
          }}
        >
          <Button icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ]

  const showSearchMiss = Boolean(heroSearch.trim()) && !filteredHeroes.length && !loading

  return (
    <div className="container-fluid p-0">
      <div className="row g-3">
        <div className="col-12 col-xl-4">
          <Card title="Create Hero" className="h-100">
            <form id="hero-form" onSubmit={addHero} className="row g-3" noValidate>
              <div className="col-12">
                <label className="form-label">Name</label>
                <input
                  required
                  className={`form-control ${heroSubmitted && !heroForm.name ? 'is-invalid' : ''}`}
                  placeholder="Bruce Wayne"
                  value={heroForm.name}
                  onChange={(e) => setHeroForm((prev) => ({ ...prev, name: e.target.value }))}
                />
                <div className="form-text">Full legal identity.</div>
              </div>
              <div className="col-12">
                <label className="form-label">Alias</label>
                <input
                  required
                  className={`form-control ${heroSubmitted && !heroForm.alias ? 'is-invalid' : ''}`}
                  placeholder="Batman"
                  value={heroForm.alias}
                  onChange={(e) => setHeroForm((prev) => ({ ...prev, alias: e.target.value }))}
                />
              </div>
              <div className="col-12">
                <label className="form-label">Role</label>
                <input
                  required
                  className={`form-control ${heroSubmitted && !heroForm.role ? 'is-invalid' : ''}`}
                  placeholder="Detective, Vigilante, Strategist"
                  value={heroForm.role}
                  onChange={(e) => setHeroForm((prev) => ({ ...prev, role: e.target.value }))}
                />
              </div>
              <div className="col-12">
                <label className="form-label">Power</label>
                <input
                  required
                  className={`form-control ${heroSubmitted && !heroForm.power ? 'is-invalid' : ''}`}
                  placeholder="Tactical intelligence"
                  value={heroForm.power}
                  onChange={(e) => setHeroForm((prev) => ({ ...prev, power: e.target.value }))}
                />
              </div>
              <div className="col-12">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  rows="2"
                  placeholder="Operational notes"
                  value={heroForm.description}
                  onChange={(e) => setHeroForm((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="col-12">
                <label className="form-label">Image URL</label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://"
                  value={heroForm.image}
                  onChange={(e) => setHeroForm((prev) => ({ ...prev, image: e.target.value }))}
                />
              </div>
              <div className="col-12">
                <label className="form-label">Upload Image</label>
                <input type="file" className="form-control" accept="image/*" onChange={(e) => setHeroImageFile(e.target.files?.[0] || null)} />
              </div>
              <div className="col-12">
                <label className="form-label">City</label>
                <input
                  className="form-control"
                  placeholder="Gotham"
                  value={heroForm.city}
                  onChange={(e) => setHeroForm((prev) => ({ ...prev, city: e.target.value }))}
                />
              </div>
              <div className="col-12">
                <Button htmlType="submit" type="primary" icon={<PlusOutlined />} loading={uploadingType === 'hero'} block>
                  Add Hero
                </Button>
              </div>
            </form>
          </Card>
        </div>
        <div className="col-12 col-xl-8">
          <Card title="Hero Registry">
            <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
              <Input
                allowClear
                className="toolbar-search"
                prefix={<SearchOutlined />}
                placeholder="Search heroes"
                value={heroSearch}
                onChange={(e) => setHeroSearch(e.target.value)}
              />
              <Select
                className="toolbar-select"
                value={heroCityFilter}
                onChange={setHeroCityFilter}
                options={[{ value: 'all', label: 'All Cities' }, ...heroCities.map((city) => ({ value: city, label: city }))]}
              />
              <Button icon={<DownloadOutlined />} onClick={() => exportToCsv(filteredHeroes, 'heroes.csv', 'hero')}>
                Export
              </Button>
              <Button danger onClick={() => bulkDelete('hero')} disabled={!selectedHeroIds.length || !isPrivilegedUser}>
                Bulk Delete
              </Button>
              <Text type="secondary" className="ms-auto">
                Showing {filteredHeroes.length} of {heroes.length} heroes
              </Text>
            </div>

            <Table
              rowKey="_id"
              size="small"
              loading={loading}
              dataSource={filteredHeroes}
              columns={heroColumns}
              rowSelection={{ selectedRowKeys: selectedHeroIds, onChange: (keys) => setSelectedHeroIds(keys) }}
              pagination={{ pageSize: 8, showSizeChanger: false }}
              scroll={{ x: 860 }}
              locale={{ emptyText: <Empty description={showSearchMiss ? 'Oops, character not found' : 'No heroes found'} /> }}
            />
          </Card>
        </div>
      </div>
    </div>
  )
}
