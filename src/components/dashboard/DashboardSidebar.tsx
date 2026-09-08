import { NavLink, useLocation } from 'react-router-dom'
import { ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react'
import { site } from '@/lib/site'
import { visibleDashboardNav } from '@/lib/dashboard-nav'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'
import { useDashboardLayout } from '@/components/dashboard/DashboardLayoutContext'

export function DashboardSidebar() {
  const { user } = useAuth()
  const { config, collapsed, mobileOpen, setMobileOpen, toggleCollapsed } = useDashboardLayout()
  const location = useLocation()
  const items = visibleDashboardNav(user?.role, config.navItems)

  return (
    <>
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-charcoal/50 backdrop-blur-[2px] lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-white/[0.06] bg-[#141012] text-white transition-[width,transform] duration-300 ease-out',
          collapsed ? 'w-[4.5rem]' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <div
          className={cn(
            'flex h-16 shrink-0 items-center border-b border-white/[0.06]',
            collapsed ? 'justify-center px-2' : 'gap-3 px-4',
          )}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-crimson/20 text-crimson-light">
            <LayoutGrid className="h-5 w-5" />
          </div>
          {!collapsed ? (
            <div className="min-w-0">
              <p className="truncate text-sm font-bold tracking-tight">{config.brandTitle}</p>
              <p className="truncate text-[11px] font-medium text-white/45">{site.name}</p>
            </div>
          ) : null}
        </div>

        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-4">
          <ul className="space-y-1">
            {items.map((item) => {
              const Icon = item.icon
              const sectionActive =
                item.path === config.navItems[0]?.path
                  ? location.pathname === item.path
                  : location.pathname === item.path || location.pathname.startsWith(`${item.path}/`)
              const showChildren = !collapsed && item.children && item.children.length > 0

              return (
                <li key={item.id}>
                  <NavLink
                    to={item.path}
                    end={item.path === config.navItems[0]?.path}
                    title={collapsed ? item.label : undefined}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'group flex items-center rounded-xl text-sm font-semibold transition-colors',
                      collapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5',
                      sectionActive
                        ? 'bg-crimson text-white shadow-lg shadow-crimson/25'
                        : 'text-white/65 hover:bg-white/[0.06] hover:text-white',
                    )}
                  >
                    <Icon className={cn('h-[1.125rem] w-[1.125rem] shrink-0', sectionActive && 'text-white')} />
                    {!collapsed ? <span className="truncate">{item.label}</span> : null}
                  </NavLink>

                  {showChildren ? (
                    <ul className="mt-1 space-y-0.5 pl-3">
                      {item.children!.map((child) => {
                        const childActive =
                          location.pathname === child.path ||
                          location.pathname.startsWith(`${child.path}/`)

                        return (
                          <li key={child.id}>
                            <NavLink
                              to={child.path}
                              end
                              onClick={() => setMobileOpen(false)}
                              className={cn(
                                'flex items-center rounded-lg py-2 pl-9 pr-3 text-[13px] font-medium transition-colors',
                                childActive
                                  ? 'bg-white/[0.1] text-white'
                                  : 'text-white/50 hover:bg-white/[0.06] hover:text-white/80',
                              )}
                            >
                              <span className="truncate">{child.label}</span>
                            </NavLink>
                          </li>
                        )
                      })}
                    </ul>
                  ) : null}
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="hidden border-t border-white/[0.06] p-2 lg:block">
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={cn(
              'flex w-full items-center rounded-xl py-2.5 text-sm font-semibold text-white/55 transition-colors hover:bg-white/[0.06] hover:text-white',
              collapsed ? 'justify-center' : 'gap-3 px-3',
            )}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  )
}
