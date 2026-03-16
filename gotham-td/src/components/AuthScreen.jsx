import { Alert, Button, Card, Input, Space, Typography } from 'antd'
import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons'

const { Paragraph, Text, Title } = Typography

export default function AuthScreen({
  mode,
  form,
  error,
  submitting,
  onModeChange,
  onChange,
  onSubmit,
}) {
  return (
    <div className="auth-screen">
      <div className="auth-backdrop" />
      <Card className="auth-card" variant="borderless">
        <Space orientation="vertical" size={20} className="w-100">
          <div>
            <Text className="auth-kicker">Gotham Registry</Text>
            <Title level={2} className="mb-2">
              {mode === 'login' ? 'Access the command center' : 'Create an operator account'}
            </Title>
            <Paragraph type="secondary" className="mb-0">
              Auth is now required before viewing the map or managing heroes and criminals.
            </Paragraph>
          </div>

          {error ? <Alert type="error" message={error} showIcon /> : null}

          <form onSubmit={onSubmit} className="auth-form">
            <Space orientation="vertical" size={12} className="w-100">
              {mode === 'register' ? (
                <Input
                  size="large"
                  placeholder="Full name"
                  prefix={<UserOutlined />}
                  value={form.name}
                  onChange={(event) => onChange('name', event.target.value)}
                />
              ) : null}
              <Input
                size="large"
                type="email"
                placeholder="Email"
                prefix={<MailOutlined />}
                value={form.email}
                onChange={(event) => onChange('email', event.target.value)}
              />
              <Input.Password
                size="large"
                placeholder="Password"
                prefix={<LockOutlined />}
                value={form.password}
                onChange={(event) => onChange('password', event.target.value)}
              />
              {mode === 'register' ? (
                <Text type="secondary">Passwords must be at least 8 characters.</Text>
              ) : null}
              <Button type="primary" htmlType="submit" size="large" block loading={submitting}>
                {mode === 'login' ? 'Sign In' : 'Create Account'}
              </Button>
            </Space>
          </form>

          <div className="auth-switch">
            <Text type="secondary">
              {mode === 'login' ? 'Need an account?' : 'Already registered?'}
            </Text>
            <Button type="link" onClick={() => onModeChange(mode === 'login' ? 'register' : 'login')}>
              {mode === 'login' ? 'Create one' : 'Sign in'}
            </Button>
          </div>
        </Space>
      </Card>
    </div>
  )
}
