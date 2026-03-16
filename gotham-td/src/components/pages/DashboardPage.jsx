import { Button, Card, Empty, Progress, Table, Timeline, Typography } from 'antd'

const { Title, Text } = Typography

export default function DashboardPage({
  heroes,
  criminals,
  heroCities,
  activityItems,
  recentRecords,
  recentColumns,
  loadData,
  onJumpToForm,
}) {
  return (
    <div className="container-fluid p-0">
      <div className="row g-3 mb-3">
        <div className="col-12 col-md-6 col-xl-3">
          <Card className="metric-card">
            <Text type="secondary">Total Heroes</Text>
            <Title level={3} className="mb-0">
              {heroes.length}
            </Title>
          </Card>
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <Card className="metric-card">
            <Text type="secondary">Total Criminals</Text>
            <Title level={3} className="mb-0">
              {criminals.length}
            </Title>
          </Card>
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <Card className="metric-card">
            <Text type="secondary">High-Risk Criminals</Text>
            <Title level={3} className="mb-0">
              {criminals.filter((item) => ['High', 'Extreme'].includes(item.threatLevel)).length}
            </Title>
          </Card>
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <Card className="metric-card">
            <Text type="secondary">Cities Covered</Text>
            <Title level={3} className="mb-0">
              {heroCities.length}
            </Title>
          </Card>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-12 col-xl-4">
          <Card title="Recent Activity" className="h-100">
            {activityItems.length ? (
              <Timeline
                items={activityItems.map((item) => ({
                  color: item.itemType === 'hero' ? 'green' : 'red',
                  content: (
                    <span>
                      <strong>{item.alias}</strong> added to{' '}
                      {item.itemType === 'hero' ? 'hero registry' : 'criminal watch list'}
                    </span>
                  ),
                }))}
              />
            ) : (
              <Empty description="No activity yet" />
            )}
          </Card>
        </div>
        <div className="col-12 col-xl-4">
          <Card title="KPI Overview" className="h-100">
            <div className="d-grid gap-3">
              <div>
                <Text>Hero/Criminal Balance</Text>
                <Progress
                  percent={Math.min(
                    100,
                    Math.round((heroes.length / Math.max(1, heroes.length + criminals.length)) * 100),
                  )}
                  strokeColor="#2f54eb"
                />
              </div>
              <div>
                <Text>Watchlist Severity</Text>
                <Progress
                  percent={Math.min(
                    100,
                    Math.round(
                      (criminals.filter((item) => ['High', 'Extreme'].includes(item.threatLevel)).length /
                        Math.max(1, criminals.length)) *
                        100,
                    ),
                  )}
                  status="active"
                  strokeColor="#fa8c16"
                />
              </div>
              <div>
                <Text>Image Coverage</Text>
                <Progress
                  percent={Math.round(
                    ((heroes.filter((item) => item.image).length +
                      criminals.filter((item) => item.image).length) /
                      Math.max(1, heroes.length + criminals.length)) *
                      100,
                  )}
                  strokeColor="#52c41a"
                />
              </div>
            </div>
          </Card>
        </div>
        <div className="col-12 col-xl-4">
          <Card title="Quick Actions" className="h-100">
            <div className="d-grid gap-2">
              <Button type="primary" onClick={() => onJumpToForm('heroes', 'hero-form')}>
                Add Hero
              </Button>
              <Button onClick={() => onJumpToForm('criminals', 'criminal-form')}>Add Criminal</Button>
              <Button onClick={loadData}>Refresh Data</Button>
            </div>
          </Card>
        </div>
        <div className="col-12">
          <Card title="Recent Records">
            <Table
              rowKey="key"
              size="small"
              dataSource={recentRecords}
              columns={recentColumns}
              pagination={{ pageSize: 5, showSizeChanger: false }}
              locale={{ emptyText: <Empty description="No records found" /> }}
            />
          </Card>
        </div>
      </div>
    </div>
  )
}
