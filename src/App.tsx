import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu"

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Item One</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink>Link</NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      <div className=' h-200 flex flex-col justify-around m-0 p-0'>
      <h1 className='text-stone-600 text-2xl'>Bem-Vindo ao MedSys</h1>
      <div className="card text-red flex gap-5 justify-center">
        <div className='border-2 rounded-md w-32 h-32 itens-center flex flex-col justify-center hover:border-stone-600  transition duration-300 ease-in-out cursor-pointer'>
          Medicamentos
        </div>
        <div className='border-2 rounded-md w-32 h-32 itens-center flex flex-col justify-center hover:border-stone-600  transition duration-300 ease-in-out cursor-pointer'>
          Clientes
        </div>
        <div className='border-2 rounded-md w-32 h-32 itens-center flex flex-col justify-center hover:border-stone-600  transition duration-300 ease-in-out cursor-pointer'>
          Filiais
        </div>
        <div className='border-2 rounded-md w-32 h-32 itens-center flex flex-col justify-center hover:border-stone-600  transition duration-300 ease-in-out cursor-pointer'>
          Vendas
        </div>
      </div>
      <footer className="read-the-docs">
        Desenvolvido por Pedro Rodrigues ltda.
      </footer>
      </div>
      
    </>
  )
}

export default App
