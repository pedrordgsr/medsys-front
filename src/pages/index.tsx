
import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <div className='min-h-[calc(100vh-3.5rem)] flex flex-col relative'>
      <div className='flex flex-col flex-1 justify-around'>
        <h1 className='text-stone-600 text-2xl'>Bem-Vindo ao MedSys</h1>
        <div className=" text-red flex gap-5 justify-center">
          <div className='border-2 rounded-md w-32 h-32 itens-center flex flex-col justify-center hover:border-stone-600  transition duration-300 ease-in-out cursor-pointer'>
            Medicamentos
          </div>
          <Link to="/clientes" className='border-2 rounded-md w-32 h-32 itens-center flex flex-col justify-center hover:border-stone-600  transition duration-300 ease-in-out cursor-pointer'>
            Clientes
          </Link>
          <div className='border-2 rounded-md w-32 h-32 itens-center flex flex-col justify-center hover:border-stone-600  transition duration-300 ease-in-out cursor-pointer'>
            Filiais
          </div>
            <div className='border-2 rounded-md w-32 h-32 itens-center flex flex-col justify-center hover:border-stone-600  transition duration-300 ease-in-out cursor-pointer'>
            Vendas
          </div>

        </div>
        <footer className="text-center text-xs text-stone-500 pb-4">
          Desenvolvido por Pedro Rodrigues Ltda.
        </footer>
      </div>
    
    </div>
  );
}