import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { atualizarVenda, deletarVenda, obterVenda, type VendaDTO } from '@/lib/api/venda'
import { listarClientes, type ClienteDTO } from '@/lib/api/cliente'
import { listarFiliais, type FilialDTO } from '@/lib/api/filial'
import { listarMedicamentos, type MedicamentoDTO } from '@/lib/api/medicamento'

interface ItemForm { medicamentoId: string; quantidade: string; receita: boolean; id?: number }
interface VendaForm { cliente_id: string; filial_id: string; itens: ItemForm[] }

export default function VendaDetalheOuEditarPage() {
  const { id } = useParams()
  const vendaId = Number(id)
  const navigate = useNavigate()

  const [venda, setVenda] = useState<VendaDTO | null>(null)
  const [form, setForm] = useState<VendaForm>({ cliente_id: '', filial_id: '', itens: [] })
  const [clientes, setClientes] = useState<ClienteDTO[]>([])
  const [filiais, setFiliais] = useState<FilialDTO[]>([])
  const [medicamentos, setMedicamentos] = useState<MedicamentoDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    async function carregar() {
      setLoading(true)
      setErro(null)
      try {
        const [v, c, f, m] = await Promise.all([
          obterVenda(vendaId),
          listarClientes(),
          listarFiliais(),
          listarMedicamentos()
        ])
        setVenda(v)
        setClientes(c)
        setFiliais(f)
        setMedicamentos(m)
        setForm({
          cliente_id: String(v.id_cliente),
          filial_id: String(v.id_filial),
          itens: (v.itens || []).map(it => ({ medicamentoId: String(it.medicamentoId), quantidade: String(it.quantidade), receita: !!it.receita }))
        })
      } catch (e: unknown) {
        setErro(e instanceof Error ? e.message : 'Erro ao carregar venda')
      } finally {
        setLoading(false)
      }
    }
    if (!Number.isFinite(vendaId)) {
      setErro('ID inválido')
      setLoading(false)
      return
    }
    carregar()
  }, [vendaId])

  function atualizarItem(index: number, patch: Partial<ItemForm>) {
    setForm(f => ({ ...f, itens: f.itens.map((it, i) => i === index ? { ...it, ...patch } : it) }))
  }
  function adicionarItem() {
    setForm(f => ({ ...f, itens: [...f.itens, { medicamentoId: '', quantidade: '1', receita: false }] }))
  }
  function removerItem(index: number) {
    setForm(f => ({ ...f, itens: f.itens.filter((_, i) => i !== index) }))
  }

  function validar(): string | null {
    if (!form.cliente_id) return 'Selecione o cliente'
    if (!form.filial_id) return 'Selecione a filial'
    if (!form.itens.length) return 'Adicione ao menos 1 item'
    for (const [i, it] of form.itens.entries()) {
      if (!it.medicamentoId) return `Item ${i + 1}: selecione o medicamento`
      const med = medicamentos.find(m => m.id === Number(it.medicamentoId))
      if (!med) return `Item ${i + 1}: medicamento inválido`
      const qtd = Number(it.quantidade)
      if (!qtd || qtd <= 0) return `Item ${i + 1}: quantidade inválida`
      if (typeof med.estoque === 'number' && qtd > med.estoque) return `Item ${i + 1}: quantidade solicitada (${qtd}) maior que estoque disponível (${med.estoque})`
      if (med.tipo === 'CONTROLADO' && !it.receita) return `Item ${i + 1}: medicamento controlado requer receita`
    }
    return null
  }

  async function salvarAlteracoes() {
    const err = validar()
    if (err) { setErro(err); return }
    setErro(null)
    setSalvando(true)
    try {
      await atualizarVenda(vendaId, {
        cliente_id: Number(form.cliente_id),
        filial_id: Number(form.filial_id),
        itens: form.itens.map(it => ({ medicamentoId: Number(it.medicamentoId), quantidade: Number(it.quantidade), receita: !!it.receita }))
      })
      navigate(`/vendas/${vendaId}`)
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro ao salvar')
    } finally {
      setSalvando(false)
    }
  }

  async function excluir() {
    if (!confirm('Deseja realmente excluir esta venda?')) return
    try {
      await deletarVenda(vendaId)
      navigate('/vendas')
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Erro ao excluir')
    }
  }

  const medById = (id: string | number) => medicamentos.find(m => m.id === Number(id))

  const isEditable = useMemo(() => location.pathname.endsWith('/editar'), [])

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <p className="text-stone-600">Carregando...</p>
      </div>
    )
  }

  if (erro) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{erro}</div>
        <Link to="/vendas" className="inline-block mt-3 text-sm underline">Voltar</Link>
      </div>
    )
  }

  if (!venda) return null

  return (
    <div className="p-6 max-w-6xl mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-stone-700">Venda #{vendaId}</h1>
        <div className="flex gap-2">
          <Link to="/vendas" className="text-sm px-4 py-2 rounded-md border bg-white hover:bg-stone-50">Voltar</Link>
          {!isEditable && <Link to={`/vendas/${vendaId}/editar`} className="text-sm px-4 py-2 rounded-md bg-stone-700 text-white hover:bg-stone-800">Editar</Link>}
          <button onClick={excluir} className="text-sm px-4 py-2 rounded-md border border-red-300 text-red-700 hover:bg-red-50">Excluir</button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isEditable ? 'Editar venda' : 'Detalhes da venda'}</CardTitle>
          <CardDescription>{isEditable ? 'Atualize os dados da venda e itens.' : 'Visualize os dados da venda.'}</CardDescription>
        </CardHeader>
        <CardContent>
          {isEditable ? (
            <div className="flex flex-col gap-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium" htmlFor="cliente_id">Cliente</label>
                  <select id="cliente_id" name="cliente_id" value={form.cliente_id} onChange={e => setForm(f => ({ ...f, cliente_id: e.target.value }))} className="border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-stone-400 bg-white" required>
                    <option value="" disabled>Selecione o cliente</option>
                    {clientes.map(c => <option key={c.id} value={c.id}>{c.id} - {c.nome}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium" htmlFor="filial_id">Filial</label>
                  <select id="filial_id" name="filial_id" value={form.filial_id} onChange={e => setForm(f => ({ ...f, filial_id: e.target.value }))} className="border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-stone-400 bg-white" required>
                    <option value="" disabled>Selecione a filial</option>
                    {filiais.map(f => <option key={f.id} value={f.id}>{f.id} - {f.endereco}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-stone-600">Itens</h2>
                  <button type="button" onClick={adicionarItem} className="text-xs px-2 py-1 rounded border bg-white hover:bg-stone-50 transition">Adicionar item</button>
                </div>
                <div className="flex flex-col gap-3">
                  {form.itens.map((it, idx) => {
                    const med = medById(it.medicamentoId)
                    const controlado = med?.tipo === 'CONTROLADO'
                    return (
                      <div key={idx} className="border rounded-md p-3 flex flex-col gap-3 bg-stone-50/50">
                        <div className="grid md:grid-cols-4 gap-3 items-end">
                          <div className="flex flex-col gap-1 md:col-span-2">
                            <label className="text-xs font-medium">Medicamento</label>
                            <select value={it.medicamentoId} onChange={e => atualizarItem(idx, { medicamentoId: e.target.value, receita: false })} className="border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-stone-400 bg-white" required>
                              <option value="" disabled>Selecione</option>
                              {medicamentos.map(m => <option key={m.id} value={m.id}>{m.id} - {m.nome} ({m.tipo}) • estoque: {m.estoque ?? 0}</option>)}
                            </select>
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium">Qtd.</label>
                            <input type="number" min={1} value={it.quantidade} onChange={e => atualizarItem(idx, { quantidade: e.target.value })} className="border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-stone-400" required />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium">Receita</label>
                            <div className="flex items-center gap-2 h-10 px-3 border rounded-md bg-white">
                              <input id={`receita-${idx}`} type="checkbox" checked={it.receita} onChange={e => atualizarItem(idx, { receita: e.target.checked })} className="accent-stone-700 scale-110" />
                              <span className="text-xs text-stone-700">{controlado ? 'Obrigatória' : 'Necessária?'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-xs text-stone-600">
                          <div>
                            {med && (
                              <span className="font-medium">{med.nome} <span className="ml-2 text-[11px] text-stone-500">(Estoque: {med.estoque ?? 0})</span></span>
                            )}
                            {controlado && <span className="ml-2 text-red-600 font-semibold">CONTROLADO</span>}
                          </div>
                          {form.itens.length > 1 && (
                            <button type="button" onClick={() => removerItem(idx)} className="text-red-600 hover:underline">Remover</button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={salvarAlteracoes} disabled={salvando} className="bg-stone-700 hover:bg-stone-800 text-white text-sm font-medium px-5 py-2 rounded-md disabled:opacity-60">{salvando ? 'Salvando...' : 'Salvar alterações'}</button>
                <Link to={`/vendas/${vendaId}`} className="text-sm px-4 py-2 rounded-md border bg-white hover:bg-stone-50">Cancelar</Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-stone-500">Cliente</div>
                  <div className="text-sm">{(clientes.find(c => c.id === venda.id_cliente)?.nome) ?? `#${venda.id_cliente}`}</div>
                </div>
                <div>
                  <div className="text-xs text-stone-500">Filial</div>
                  <div className="text-sm">{(filiais.find(f => f.id === venda.id_filial)?.endereco) ?? `#${venda.id_filial}`}</div>
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold text-stone-600 mb-2">Itens</div>
                <div className="border rounded-md overflow-hidden">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-stone-600 border-b">
                        <th className="py-2 px-3">ID</th>
                        <th className="py-2 px-3">Medicamento</th>
                        <th className="py-2 px-3">Qtd.</th>
                        <th className="py-2 px-3">Receita</th>
                      </tr>
                    </thead>
                    <tbody>
                      {venda.itens?.length ? venda.itens.map((it, idx) => (
                        <tr key={`${it.medicamentoId}-${idx}`} className="border-b last:border-0">
                          <td className="py-2 px-3">{idx + 1}</td>
                          <td className="py-2 px-3">{it.medicamentoNome} (#{it.medicamentoId})</td>
                          <td className="py-2 px-3">{it.quantidade}</td>
                          <td className="py-2 px-3">{it.receita ? 'Sim' : 'Não'}</td>
                        </tr>
                      )) : (
                        <tr><td colSpan={4} className="py-3 px-3 text-stone-500">Sem itens</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
