import { App as AntApp, ConfigProvider, message, notification, theme } from 'antd'
import AuthGate from './components/AuthGate.jsx'
import RegistryWorkspace from './components/RegistryWorkspace.jsx'
import './App.css'

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
            <RegistryWorkspace
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
