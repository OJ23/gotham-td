import { Avatar, Button, Card, Descriptions, Space, Tag, Typography } from 'antd'
import { ArrowLeftOutlined, UserOutlined } from '@ant-design/icons'

const { Paragraph, Text, Title } = Typography

export default function CharacterProfilePage({ result, onBackToRegistry }) {
  const isHero = result.type === 'hero'
  const title = isHero ? 'Hero profile' : 'Criminal profile'
  const metaItems = isHero
    ? [
        { key: 'name', label: 'Name', children: result.character.name || 'Unknown' },
        { key: 'alias', label: 'Alias', children: result.character.alias || 'Unknown' },
        { key: 'role', label: 'Role', children: result.character.role || 'Unassigned' },
        { key: 'power', label: 'Power', children: result.character.power || 'Unlisted' },
        { key: 'city', label: 'City', children: result.character.city || 'Gotham' },
      ]
    : [
        { key: 'name', label: 'Name', children: result.character.name || 'Unknown' },
        { key: 'alias', label: 'Alias', children: result.character.alias || 'Unknown' },
        {
          key: 'crimeType',
          label: 'Crime Type',
          children: result.character.crimeType || 'Unlisted',
        },
        { key: 'zone', label: 'Zone', children: result.character.zone || 'Gotham' },
        {
          key: 'threat',
          label: 'Threat Level',
          children: (
            <Tag color={result.character.threatLevel === 'Extreme' ? 'error' : 'processing'}>
              {result.character.threatLevel || 'Medium'}
            </Tag>
          ),
        },
      ]

  return (
    <div className="character-profile-page">
      <Card className="character-profile-card" variant="borderless">
        <Space direction="vertical" size={24} className="w-100">
          <Button
            type="default"
            icon={<ArrowLeftOutlined />}
            onClick={onBackToRegistry}
            className="character-profile-back"
          >
            Back to {isHero ? 'heroes' : 'criminals'}
          </Button>

          <div className="character-profile-hero">
            <div className="character-profile-media">
              {result.character.image ? (
                <img
                  src={result.character.image}
                  alt={result.character.alias || result.character.name}
                  className="character-profile-image"
                />
              ) : (
                <div className="character-profile-avatar-fallback">
                  <Avatar size={88} icon={<UserOutlined />} />
                </div>
              )}
            </div>
            <div className="character-profile-copy">
              <Text className="character-profile-kicker">Search Result</Text>
              <Title level={2} className="mb-2 character-profile-title">
                {result.character.alias || result.character.name}
              </Title>
              <Space wrap>
                <Tag color={isHero ? 'success' : 'error'}>{isHero ? 'Hero' : 'Criminal'}</Tag>
                <Tag>{title}</Tag>
              </Space>
              <Paragraph className="character-profile-description">
                {result.character.description || 'No background notes are available for this character yet.'}
              </Paragraph>
            </div>
          </div>

          <section className="case-details-panel">
            <div className="case-details-header">
              <Text className="case-details-kicker">Gotham Case File</Text>
              <Title level={4} className="case-details-title">
                Case details
              </Title>
            </div>
            <Descriptions
              className="case-details-grid"
              bordered
              column={1}
              items={metaItems}
            />
          </section>
        </Space>
      </Card>
    </div>
  )
}
