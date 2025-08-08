import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { listarClientes, type ClienteDTO } from '@/lib/api/cliente'
import { listarFiliais, type FilialDTO } from '@/lib/api/filial'
import { listarMedicamentos, type MedicamentoDTO } from '@/lib/api/medicamento'
import { criarVenda } from '@/lib/api/venda'

type Cliente = ClienteDTO
type Filial = FilialDTO
type Medicamento = MedicamentoDTO

interface ItemForm { medicamentoId: string; quantidade: string; receita: boolean }
interface VendaForm { cliente_id: string; filial_id: string; itens: ItemForm[] }

export default function Vendas() {
    const [clientes, setClientes] = useState<Cliente[]>([])
    const [filiais, setFiliais] = useState<Filial[]>([])
    const [medicamentos, setMedicamentos] = useState<Medicamento[]>([])
    const [form, setForm] = useState<VendaForm>({ cliente_id: '', filial_id: '', itens: [{ medicamentoId: '', quantidade: '1', receita: false }] })
    const [loading, setLoading] = useState(false)
    const [erro, setErro] = useState<string | null>(null)
    const [salvando, setSalvando] = useState(false)
    const [sucesso, setSucesso] = useState<string | null>(null)

    async function carregarDados() {
        setLoading(true)
        setErro(null)
        try {
            const [c, f, m] = await Promise.all([
                listarClientes(),
                listarFiliais(),
                listarMedicamentos()
            ])
            setClientes(c)
            setFiliais(f)
            setMedicamentos(m)
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : 'Erro ao carregar dados'
            setErro(msg)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { carregarDados() }, [])

    function atualizarItem(index: number, patch: Partial<ItemForm>) {
        setForm(f => ({
            ...f,
            itens: f.itens.map((it, i) => i === index ? { ...it, ...patch } : it)
        }))
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
            if (med.tipo === 'CONTROLADO' && !it.receita) return `Item ${i + 1}: medicamento controlado requer receita`
        }
        return null
    }

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault()
        setSucesso(null)
        const erroValid = validar()
        if (erroValid) { setErro(erroValid); return }
        setErro(null)
        setSalvando(true)
        try {
            const payload = {
                cliente_id: Number(form.cliente_id),
                filial_id: Number(form.filial_id),
                itens: form.itens.map(it => ({
                    medicamentoId: Number(it.medicamentoId),
                    quantidade: Number(it.quantidade),
                    receita: !!it.receita
                }))
            }
            await criarVenda(payload)
            setSucesso('Venda registrada com sucesso')
            setForm({ cliente_id: '', filial_id: '', itens: [{ medicamentoId: '', quantidade: '1', receita: false }] })
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : 'Erro ao registrar venda'
            setErro(msg)
        } finally {
            setSalvando(false)
        }
    }

    const medById = (id: string | number) => medicamentos.find(m => m.id === Number(id))

    return (
        <div className="p-6 max-w-6xl mx-auto flex flex-col gap-6">
            <h1 className="text-2xl font-semibold text-stone-700">Vendas</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Registrar Venda</CardTitle>
                    <CardDescription>Selecione cliente, filial e adicione os itens.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={onSubmit} className="flex flex-col gap-6" noValidate>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-medium" htmlFor="cliente_id">Cliente</label>
                                <select id="cliente_id" name="cliente_id" value={form.cliente_id} onChange={e => setForm(f => ({ ...f, cliente_id: e.target.value }))} className="border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-stone-400 bg-white" disabled={salvando || loading} required>
                                    <option value="" disabled>{loading ? 'Carregando...' : 'Selecione o cliente'}</option>
                                    {clientes.map(c => <option key={c.id} value={c.id}>{c.id} - {c.nome}</option>)}
                                </select>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-medium" htmlFor="filial_id">Filial</label>
                                <select id="filial_id" name="filial_id" value={form.filial_id} onChange={e => setForm(f => ({ ...f, filial_id: e.target.value }))} className="border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-stone-400 bg-white" disabled={salvando || loading} required>
                                    <option value="" disabled>{loading ? 'Carregando...' : 'Selecione a filial'}</option>
                                    {filiais.map(f => <option key={f.id} value={f.id}>{f.id} - {f.endereco}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-semibold text-stone-600">Itens</h2>
                                <button type="button" onClick={adicionarItem} className="text-xs px-2 py-1 rounded border bg-white hover:bg-stone-50 transition disabled:opacity-50" disabled={salvando}>Adicionar item</button>
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
                                                    <select value={it.medicamentoId} onChange={e => atualizarItem(idx, { medicamentoId: e.target.value, receita: false })} className="border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-stone-400 bg-white" disabled={salvando || loading} required>
                                                        <option value="" disabled>{loading ? 'Carregando...' : 'Selecione'}</option>
                                                        {medicamentos.map(m => <option key={m.id} value={m.id}>{m.id} - {m.nome} ({m.tipo})</option>)}
                                                    </select>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-xs font-medium">Qtd.</label>
                                                    <input type="number" min={1} value={it.quantidade} onChange={e => atualizarItem(idx, { quantidade: e.target.value })} className="border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-stone-400" disabled={salvando} required />
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-xs font-medium">Receita</label>
                                                    <div className="flex items-center gap-2 h-10 px-3 border rounded-md bg-white">
                                                        <input id={`receita-${idx}`} type="checkbox" checked={it.receita} onChange={e => atualizarItem(idx, { receita: e.target.checked })} disabled={salvando || controlado && false || !med} className="accent-stone-700 scale-110" />
                                                        <span className="text-xs text-stone-700">{controlado ? 'Obrigatória' : 'Necessária?'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center text-xs text-stone-600">
                                                <div>
                                                    {med && (
                                                        <span className="font-medium">{med.nome}</span>
                                                    )}
                                                    {controlado && <span className="ml-2 text-red-600 font-semibold">CONTROLADO</span>}
                                                </div>
                                                {form.itens.length > 1 && (
                                                    <button type="button" onClick={() => removerItem(idx)} className="text-red-600 hover:underline disabled:opacity-50" disabled={salvando}>Remover</button>
                                                )}
                                            </div>
                                            {controlado && !it.receita && (
                                                <div className="text-xs text-red-600">Este medicamento exige receita.</div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {erro && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{erro}</div>}
                        {sucesso && <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded px-3 py-2">{sucesso}</div>}

                        <div className="flex items-center gap-3">
                            <button type="submit" disabled={salvando || loading} className="bg-stone-700 hover:bg-stone-800 text-white text-sm font-medium px-5 py-2 rounded-md disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
                                {salvando ? 'Registrando...' : 'Registrar Venda'}
                            </button>
                            <button type="button" onClick={carregarDados} disabled={loading} className="text-xs text-stone-600 hover:underline disabled:opacity-50">
                                {loading ? 'Atualizando dados...' : 'Atualizar dados'}
                            </button>
                        </div>
                    </form>
                </CardContent>
                <CardFooter>
                    <p className="text-[11px] text-stone-500">Medicamentos CONTROLADO exigem marcação de receita.</p>
                </CardFooter>
            </Card>
        </div>
    )
}