import { Button, Card, Typography } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'

const { Paragraph, Title } = Typography

export default function CharacterNotFoundPage({ query, onBackHome }) {
  return (
    <div className="character-not-found-page">
      <Card className="character-not-found-card" variant="borderless">
        <div className="character-not-found-media">
          <img
            src="/images/joker%20error03.jpg"
            alt="Character not found"
            className="character-not-found-image"
          />
        </div>
        <div className="character-not-found-copy">
          <Title level={2}>Oops, character not found</Title>
          <Paragraph>
            No matching registry record was found for <strong>{query}</strong>.
          </Paragraph>
          <Paragraph>
            Try searching by alias, real name, role, power, or crime type.
          </Paragraph>
          <Button type="primary" icon={<ArrowLeftOutlined />} onClick={onBackHome}>
            Back home
          </Button>
        </div>
      </Card>
    </div>
  )
}
