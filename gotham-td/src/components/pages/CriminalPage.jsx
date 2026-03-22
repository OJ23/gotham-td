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

export default function CriminalPage({
  criminalForm,
  setCriminalForm,
  criminalSubmitted,
  addCriminal,
  setCriminalImageFile,
  uploadingType,
  criminalSearch,
  setCriminalSearch,
  criminalThreatFilter,
  setCriminalThreatFilter,
  filteredCriminals,
  criminals,
  exportToCsv,
  bulkDelete,
  isPrivilegedUser,
  selectedCriminalIds,
  setSelectedCriminalIds,
  loading,
  openCriminalEditor,
  confirmDelete,
  threatColors,
  onCharacterSelect,
}) {
  const criminalColumns = [
    {
      title: 'Alias',
      dataIndex: 'alias',
      key: 'alias',
      sorter: (a, b) => a.alias.localeCompare(b.alias),
      render: (value, record) => (
        <Space align="start">
          {record.image ? <Avatar src={record.image} shape="square" /> : <Avatar shape="square" icon={<UserOutlined />} />}
          <div>
            <strong>{value}</strong>
            {record.createdByName ? <div><Text type="secondary">Created by {record.createdByName}</Text></div> : null}
          </div>
        </Space>
      ),
    },
    { title: 'Name', dataIndex: 'name', key: 'name', sorter: (a, b) => a.name.localeCompare(b.name) },
    { title: 'Crime Type', dataIndex: 'crimeType', key: 'crimeType', sorter: (a, b) => a.crimeType.localeCompare(b.crimeType) },
    {
      title: 'Zone',
      dataIndex: 'zone',
      key: 'zone',
      sorter: (a, b) => (a.zone || '').localeCompare(b.zone || ''),
      render: (value) => value || 'Gotham',
    },
    {
      title: 'Threat',
      dataIndex: 'threatLevel',
      key: 'threatLevel',
      filters: ['Low', 'Medium', 'High', 'Extreme'].map((item) => ({ text: item, value: item })),
      onFilter: (value, record) => record.threatLevel === value,
      render: (value) => <Tag color={threatColors[value] || 'default'}>{value}</Tag>,
    },
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
                onClick: () => openCriminalEditor(record),
              },
              {
                key: 'delete',
                danger: true,
                icon: <DeleteOutlined />,
                label: 'Delete',
                disabled: !isPrivilegedUser,
                onClick: () => confirmDelete('criminal', record),
              },
            ],
          }}
        >
          <Button icon={<MoreOutlined />} onClick={(event) => event.stopPropagation()} />
        </Dropdown>
      ),
    },
  ]

  const showSearchMiss = Boolean(criminalSearch.trim()) && !filteredCriminals.length && !loading

  return (
    <div className="container-fluid p-0">
      <div className="row g-3">
        <div className="col-12 col-xl-4">
          <Card title="Create Criminal" className="h-100">
            <form id="criminal-form" onSubmit={addCriminal} className="row g-3" noValidate>
              <div className="col-12">
                <label className="form-label">Name</label>
                <input
                  required
                  className={`form-control ${criminalSubmitted && !criminalForm.name ? 'is-invalid' : ''}`}
                  placeholder="Unknown identity"
                  value={criminalForm.name}
                  onChange={(e) => setCriminalForm((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="col-12">
                <label className="form-label">Alias</label>
                <input
                  required
                  className={`form-control ${criminalSubmitted && !criminalForm.alias ? 'is-invalid' : ''}`}
                  placeholder="Joker"
                  value={criminalForm.alias}
                  onChange={(e) => setCriminalForm((prev) => ({ ...prev, alias: e.target.value }))}
                />
                <div className="form-text">Primary public identity.</div>
              </div>
              <div className="col-12">
                <label className="form-label">Crime Type</label>
                <input
                  required
                  className={`form-control ${criminalSubmitted && !criminalForm.crimeType ? 'is-invalid' : ''}`}
                  placeholder="Organized crime"
                  value={criminalForm.crimeType}
                  onChange={(e) => setCriminalForm((prev) => ({ ...prev, crimeType: e.target.value }))}
                />
              </div>
              <div className="col-12">
                <label className="form-label">Zone</label>
                <input
                  className="form-control"
                  placeholder="Gotham"
                  value={criminalForm.zone}
                  onChange={(e) => setCriminalForm((prev) => ({ ...prev, zone: e.target.value }))}
                />
              </div>
              <div className="col-12">
                <label className="form-label">Threat Level</label>
                <select
                  className="form-select"
                  value={criminalForm.threatLevel}
                  onChange={(e) => setCriminalForm((prev) => ({ ...prev, threatLevel: e.target.value }))}
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Extreme</option>
                </select>
              </div>
              <div className="col-12">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  rows="2"
                  placeholder="Case notes"
                  value={criminalForm.description}
                  onChange={(e) => setCriminalForm((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="col-12">
                <label className="form-label">Image URL</label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://"
                  value={criminalForm.image}
                  onChange={(e) => setCriminalForm((prev) => ({ ...prev, image: e.target.value }))}
                />
              </div>
              <div className="col-12">
                <label className="form-label">Upload Image</label>
                <input type="file" className="form-control" accept="image/*" onChange={(e) => setCriminalImageFile(e.target.files?.[0] || null)} />
              </div>
              <div className="col-12">
                <Button htmlType="submit" type="primary" icon={<PlusOutlined />} loading={uploadingType === 'criminal'} block>
                  Add Criminal
                </Button>
              </div>
            </form>
          </Card>
        </div>
        <div className="col-12 col-xl-8">
          <Card title="Criminal Watch List">
            <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
              <Input
                allowClear
                className="toolbar-search"
                prefix={<SearchOutlined />}
                placeholder="Search criminals"
                value={criminalSearch}
                onChange={(e) => setCriminalSearch(e.target.value)}
              />
              <Select
                className="toolbar-select"
                value={criminalThreatFilter}
                onChange={setCriminalThreatFilter}
                options={[
                  { value: 'all', label: 'All Threat Levels' },
                  { value: 'Low', label: 'Low' },
                  { value: 'Medium', label: 'Medium' },
                  { value: 'High', label: 'High' },
                  { value: 'Extreme', label: 'Extreme' },
                ]}
              />
              <Button icon={<DownloadOutlined />} onClick={() => exportToCsv(filteredCriminals, 'criminals.csv', 'criminal')}>
                Export
              </Button>
              <Button danger onClick={() => bulkDelete('criminal')} disabled={!selectedCriminalIds.length || !isPrivilegedUser}>
                Bulk Delete
              </Button>
              <Text type="secondary" className="ms-auto">
                Showing {filteredCriminals.length} of {criminals.length} criminals
              </Text>
            </div>

            <Table
              rowKey="_id"
              size="small"
              loading={loading}
              dataSource={filteredCriminals}
              columns={criminalColumns}
              rowSelection={{ selectedRowKeys: selectedCriminalIds, onChange: (keys) => setSelectedCriminalIds(keys) }}
              pagination={{ pageSize: 8, showSizeChanger: false }}
              scroll={{ x: 860 }}
              locale={{ emptyText: <Empty description={showSearchMiss ? 'Oops, character not found' : 'No criminals found'} /> }}
              onRow={(record) => ({
                onClick: () => onCharacterSelect('criminal', record),
                className: 'clickable-row',
              })}
            />
          </Card>
        </div>
      </div>
    </div>
  )
}
