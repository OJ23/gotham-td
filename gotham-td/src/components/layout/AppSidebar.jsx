import {
  BellOutlined,
  DashboardOutlined,
  EnvironmentOutlined,
  HomeOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SearchOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Avatar, Badge, Button, Dropdown, Input, Menu, Tooltip } from 'antd'

const primaryMenuItems = [
  { key: 'home', icon: <HomeOutlined />, label: 'Home' },
  { key: 'map', icon: <EnvironmentOutlined />, label: 'Map' },
  { key: 'dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
]

const registryMenuItems = [
  {
    type: 'group',
    label: 'Registry',
    children: [
      { key: 'heroes', icon: <TeamOutlined />, label: 'Heroes' },
      { key: 'criminals', icon: <UserOutlined />, label: 'Criminals' },
    ],
  },
]

export default function AppSidebar({
  collapsed,
  activePage,
  onToggle,
  onNavigate,
  registrySearch,
  onRegistrySearchChange,
  onRegistrySearchSubmit,
  onRegistrySearchClick,
  extremeAlertsCount,
  currentUser,
  onLogout,
}) {
  return (
    <>
      <div className={`sider-toggle-row ${collapsed ? 'is-collapsed' : ''}`}>
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onToggle}
          className="sider-toggle-button"
        />
      </div>
      <Menu mode="inline" selectedKeys={[activePage]} items={primaryMenuItems} onClick={({ key }) => onNavigate(key)} />
      <div className={`sider-search-row ${collapsed ? 'is-collapsed' : ''}`}>
        {!collapsed ? (
          <Input
            placeholder="Search registry"
            prefix={<SearchOutlined />}
            className="sider-search"
            value={registrySearch}
            onChange={(event) => onRegistrySearchChange(event.target.value)}
            onPressEnter={onRegistrySearchSubmit}
          />
        ) : (
          <Tooltip title="Search" placement="right">
            <Button
              type="text"
              icon={<SearchOutlined />}
              className="sider-icon-button"
              onClick={onRegistrySearchClick}
              aria-label="Search"
            />
          </Tooltip>
        )}
      </div>
      <Menu mode="inline" selectedKeys={[activePage]} items={registryMenuItems} onClick={({ key }) => onNavigate(key)} />
      <div className={`sider-utility-actions ${collapsed ? 'is-collapsed' : ''}`}>
        <Badge count={extremeAlertsCount}>
          <Button icon={<BellOutlined />} className="sider-icon-button">
            {!collapsed && 'Alerts'}
          </Button>
        </Badge>
        <Dropdown
          trigger={['click']}
          menu={{
            items: [
              { key: 'profile', label: `${currentUser.name} (${currentUser.role})` },
              { key: 'logout', label: 'Logout', onClick: onLogout },
            ],
          }}
        >
          <Button className="d-flex align-items-center gap-2 sider-account-button">
            <Avatar size="small" icon={<UserOutlined />} />
            {!collapsed && <span>{currentUser.name}</span>}
          </Button>
        </Dropdown>
      </div>
    </>
  )
}
