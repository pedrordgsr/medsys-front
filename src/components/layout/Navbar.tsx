import { Link, NavLink } from 'react-router-dom'
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent } from '@/components/ui/navigation-menu'
import { cn } from '@/lib/utils'

const links = [
  { to: '/', label: 'Início' },
  { to: '/clientes', label: 'Clientes' },
  { to: '/medicamentos', label: 'Medicamentos' },
  { to: '/filiais', label: 'Filiais' },
]

export function Navbar() {
  return (
    <header className="w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-40">
      <div className="mx-auto max-w-6xl px-4 flex items-center h-14 gap-6">
        <Link to="/" className="font-semibold text-stone-700 text-sm tracking-wide">MedSys</Link>
        <NavigationMenu viewport={false} className="flex-1 justify-start">
          <NavigationMenuList>
            {links.map(l => (
              <NavigationMenuItem key={l.to}>
                <NavLink
                  to={l.to}
                  className={({ isActive }) => cn(
                    'px-3 py-2 rounded-md text-sm font-medium transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-stone-300',
                    'hover:bg-stone-100 data-[active=true]:bg-stone-200/60',
                    isActive && 'data-[active=true]')}
                >
                  {l.label}
                </NavLink>
              </NavigationMenuItem>
            ))}

            {/* Dropdown de Vendas */}
            <NavigationMenuItem>
              <NavigationMenuTrigger className="px-3 py-2 rounded-md text-sm font-medium">Vendas</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="w-56 bg-white rounded-md border shadow p-1">
                  <NavLink
                    to="/vendas"
                    className={({ isActive }) => cn(
                      'block rounded-sm px-3 py-2 text-sm hover:bg-stone-100',
                      isActive && 'bg-stone-200/60')}
                  >
                    Todas as vendas
                  </NavLink>
                  <NavLink
                    to="/vendas/nova"
                    className={({ isActive }) => cn(
                      'block rounded-sm px-3 py-2 text-sm hover:bg-stone-100',
                      isActive && 'bg-stone-200/60')}
                  >
                    Nova venda
                  </NavLink>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </header>
  )
}
