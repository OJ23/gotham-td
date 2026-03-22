import { Avatar, Button, Card, Space, Tag, Typography } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import GothamMap from '../GothamMap.jsx'

const { Title, Text } = Typography

export default function HomePage({
  homeCarouselSlides,
  homeCarouselIndex,
  setHomeCarouselIndex,
  heroes,
  criminals,
  setActivePage,
  onCharacterSelect,
}) {
  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero-bg" aria-hidden="true">
          <img src="/images/4k-04.jpg" alt="" className="home-hero-bg-image" />
        </div>
        <div className="home-hero-copy">
          <Text className="home-kicker">City Intelligence Network</Text>
          <Title className="home-hero-title">Gotham&apos;s registry starts here.</Title>
          <Text className="home-hero-text">
            Monitor defenders, track threats, and move from street-level visibility to
            real-time oversight in one console.
          </Text>
          <Space wrap className="home-hero-actions">
            <Button type="primary" size="large" onClick={() => setActivePage('map')}>
              Open city map
            </Button>
            <Button size="large" onClick={() => setActivePage('dashboard')}>
              View dashboard
            </Button>
          </Space>
        </div>
      </section>

      <section className="home-map-section">
        <div className="home-section-header">
          <Title level={1} className="home-map-title">
            Welcome to Gotham
          </Title>
          <Text className="home-map-text">
            Explore the city&apos;s active heroes and villains, then dive into the live tactical
            map.
          </Text>
        </div>
        {homeCarouselSlides.length ? (
          <div className="registry-carousel">
            <div
              className="registry-carousel-track"
              style={{ transform: `translateX(-${homeCarouselIndex * 100}%)` }}
            >
              {homeCarouselSlides.map((slide, index) => (
                <div key={`slide-${index}`} className="registry-carousel-slide">
                  <div className="registry-carousel-grid">
                    {slide.map((item) => (
                      <Card
                        key={item.key}
                        className="registry-carousel-card clickable-card"
                        variant="borderless"
                        onClick={() => onCharacterSelect(item.type === 'Hero' ? 'hero' : 'criminal', item.source)}
                      >
                        <div className="registry-carousel-media">
                          {item.image ? (
                            <img src={item.image} alt={item.alias} className="registry-carousel-image" />
                          ) : (
                            <div className="registry-carousel-fallback">
                              <Avatar size={72} icon={<UserOutlined />} />
                            </div>
                          )}
                        </div>
                        <div className="registry-carousel-content">
                          <Tag color={item.type === 'Hero' ? 'success' : 'error'}>{item.type}</Tag>
                          <Title level={4} className="mb-0">
                            {item.alias}
                          </Title>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {homeCarouselSlides.length > 1 && (
              <div className="registry-carousel-dots">
                {homeCarouselSlides.map((_, index) => (
                  <button
                    key={`dot-${index}`}
                    type="button"
                    className={`registry-carousel-dot ${index === homeCarouselIndex ? 'is-active' : ''}`}
                    onClick={() => setHomeCarouselIndex(index)}
                    aria-label={`Show roster slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : null}

        <div className="home-map-shell">
          <GothamMap heroes={heroes} criminals={criminals} />
        </div>
      </section>
    </div>
  )
}
