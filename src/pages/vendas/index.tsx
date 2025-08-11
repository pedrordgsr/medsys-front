import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { deletarVenda, listarVendas, type VendaDTO } from '@/lib/api/venda'
import { listarClientes, type ClienteDTO } from '@/lib/api/cliente'
import { listarFiliais, type FilialDTO } from '@/lib/api/filial'

export default function VendasListPage() {
  const [vendas, setVendas] = useState<VendaDTO[]>([])
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [clientes, setClientes] = useState<ClienteDTO[]>([])
  const [filiais, setFiliais] = useState<FilialDTO[]>([])
  const navigate = useNavigate()

  async function carregar() {
    setLoading(true)
    setErro(null)
    try {
      const [vds, cls, fls] = await Promise.all([
        listarVendas(),
        listarClientes(),
        listarFiliais(),
      ])
      setVendas(vds)
      setClientes(cls)
      setFiliais(fls)
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro ao carregar vendas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { carregar() }, [])

  async function excluir(id: number) {
    if (!confirm('Deseja realmente excluir esta venda?')) return
    try {
      await deletarVenda(id)
      setVendas(vs => vs.filter(v => v.id !== id))
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Erro ao excluir')
    }
  }

  const totalVendas = useMemo(() => vendas.length, [vendas])
  const clienteNomeById = useMemo(() => Object.fromEntries(clientes.map(c => [c.id, c.nome])) as Record<number, string>, [clientes])
  const filialEnderecoById = useMemo(() => Object.fromEntries(filiais.map(f => [f.id, f.endereco])) as Record<number, string>, [filiais])

  return (
    <div className="p-6 max-w-6xl mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-stone-700">Vendas</h1>
        <Link to="/vendas/nova" className="text-sm px-4 py-2 rounded-md bg-stone-700 text-white hover:bg-stone-800">Nova venda</Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Vendas</CardTitle>
          <CardDescription>Total: {totalVendas}</CardDescription>
        </CardHeader>
        <CardContent>
          {erro && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 mb-3">{erro}</div>}
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-stone-600 border-b">
                  <th className="py-2 pr-3">ID</th>
                  <th className="py-2 pr-3">Cliente</th>
                  <th className="py-2 pr-3">Filial</th>
                  <th className="py-2 pr-3">Itens</th>
                  <th className="py-2 pr-3">Data/Hora</th>
                  <th className="py-2 pr-3">Total</th>
                  <th className="py-2 pr-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="py-6 text-center text-stone-500">Carregando...</td></tr>
                ) : vendas.length === 0 ? (
                  <tr><td colSpan={7} className="py-6 text-center text-stone-500">Nenhuma venda encontrada</td></tr>
                ) : vendas.map(v => (
                  <tr key={v.id} className="border-b last:border-0">
                    <td className="py-2 pr-3">{v.id}</td>
                    <td className="py-2 pr-3">{clienteNomeById[v.id_cliente] ?? `#${v.id_cliente}`}</td>
                    <td className="py-2 pr-3">{filialEnderecoById[v.id_filial] ?? `#${v.id_filial}`}</td>
                    <td className="py-2 pr-3">{v.itens?.length ?? 0}</td>
                    <td className="py-2 pr-3">{v.dataHora ? new Date(v.dataHora).toLocaleString() : '-'}</td>
                    <td className="py-2 pr-3">{typeof v.total === 'number' ? v.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-'}</td>
                    <td className="py-2 pr-3 flex gap-2">
                      <button className="text-xs text-stone-700 hover:underline" onClick={() => navigate(`/vendas/${v.id}`)}>Ver</button>
                      <button className="text-xs text-stone-700 hover:underline" onClick={() => navigate(`/vendas/${v.id}/editar`)}>Editar</button>
                      <button className="text-xs text-red-700 hover:underline" onClick={() => excluir(v.id)}>Excluir</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
