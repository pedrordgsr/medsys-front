import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { listarMedicamentos, criarMedicamento, atualizarMedicamento, deletarMedicamento, type MedicamentoDTO } from '@/lib/api/medicamento'
import { listarFiliais, type FilialDTO } from '@/lib/api/filial'

type Medicamento = MedicamentoDTO
type Filial = FilialDTO

interface NovoMedicamentoForm { nome: string; preco: string; tipo: 'COMUM' | 'CONTROLADO'; filialId: string }

export default function Medicamentos() {
    const [medicamentos, setMedicamentos] = useState<Medicamento[]>([])
    const [filiais, setFiliais] = useState<Filial[]>([])
    const [loading, setLoading] = useState(false)
    const [carregandoFiliais, setCarregandoFiliais] = useState(false)
    const [erro, setErro] = useState<string | null>(null)
    const [form, setForm] = useState<NovoMedicamentoForm>({ nome: '', preco: '', tipo: 'COMUM', filialId: '' })
    const [salvando, setSalvando] = useState(false)
    const [editandoId, setEditandoId] = useState<number | null>(null)

    async function carregarMedicamentos() {
        setLoading(true)
        setErro(null)
        try {
            const data = await listarMedicamentos()
            setMedicamentos(data)
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : 'Erro ao buscar medicamentos'
            setErro(msg)
        } finally {
            setLoading(false)
        }
    }

    async function carregarFiliais() {
        setCarregandoFiliais(true)
        try {
            const data = await listarFiliais()
            setFiliais(data)
        } catch {
            // Silencia erro aqui, mas mostra opção vazia
        } finally {
            setCarregandoFiliais(false)
        }
    }

    useEffect(() => { carregarMedicamentos(); carregarFiliais() }, [])

    function onChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        const { name, value } = e.target
        setForm(f => ({ ...f, [name]: value }))
    }

    function validar(): string | null {
        if (!form.nome.trim()) return 'Informe o nome'
        if (!form.preco.trim()) return 'Informe o preço'
        const precoNum = Number(form.preco.replace(',', '.'))
        if (Number.isNaN(precoNum) || precoNum < 0) return 'Preço inválido'
        if (!form.filialId) return 'Selecione a filial'
        if (!['COMUM', 'CONTROLADO'].includes(form.tipo)) return 'Tipo inválido'
        return null
    }

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault()
        const erroValidacao = validar()
        if (erroValidacao) {
            setErro(erroValidacao)
            return
        }
        setErro(null)
        setSalvando(true)
        try {
            const payload = {
                nome: form.nome.trim(),
                preco: Number(form.preco.replace(',', '.')),
                tipo: form.tipo,
                filialId: Number(form.filialId)
            }
            if (editandoId != null) {
                await atualizarMedicamento(editandoId, payload)
            } else {
                await criarMedicamento(payload)
            }
            setForm({ nome: '', preco: '', tipo: 'COMUM', filialId: '' })
            setEditandoId(null)
            await carregarMedicamentos()
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : 'Erro ao salvar'
            setErro(msg)
        } finally {
            setSalvando(false)
        }
    }

    function iniciarEdicao(m: Medicamento) {
        if (salvando || loading) return
        setForm({
            nome: m.nome,
            preco: String(m.preco).replace('.', ','),
            tipo: (m.tipo === 'CONTROLADO' ? 'CONTROLADO' : 'COMUM'),
            filialId: String(m.filialId)
        })
        setEditandoId(m.id)
        setErro(null)
    }

    function cancelarEdicao() {
        if (salvando) return
        setForm({ nome: '', preco: '', tipo: 'COMUM', filialId: '' })
        setEditandoId(null)
        setErro(null)
    }

    async function deletar(id: number) {
        if (salvando || loading) return
        const confirmacao = window.confirm('Deseja realmente excluir este medicamento?')
        if (!confirmacao) return
        setSalvando(true)
        setErro(null)
        try {
            await deletarMedicamento(id)
            if (editandoId === id) cancelarEdicao()
            await carregarMedicamentos()
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : 'Erro ao deletar'
            setErro(msg)
        } finally {
            setSalvando(false)
        }
    }

    const formatarPreco = (valor: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)
    const filialPorId = (id: number) => filiais.find(f => f.id === id)

    return (
        <div className="p-6 max-w-6xl mx-auto flex flex-col gap-6">
            <h1 className="text-2xl font-semibold text-stone-700">Medicamentos</h1>
            <div className="grid md:grid-cols-2 gap-6 items-start">
                <Card>
                    <CardHeader>
                        <CardTitle>Novo Medicamento</CardTitle>
                        <CardDescription>Cadastrar medicamento com Nome, Preço, Tipo e Filial.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
                            <div className="flex flex-col gap-1">
                                <label htmlFor="nome" className="text-sm font-medium">Nome</label>
                                <input
                                    id="nome"
                                    name="nome"
                                    value={form.nome}
                                    onChange={onChange}
                                    className="border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-stone-400"
                                    placeholder="Nome do medicamento"
                                    disabled={salvando}
                                    required
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label htmlFor="preco" className="text-sm font-medium">Preço (R$)</label>
                                <input
                                    id="preco"
                                    name="preco"
                                    value={form.preco}
                                    onChange={onChange}
                                    className="border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-stone-400"
                                    placeholder="0,00"
                                    disabled={salvando}
                                    required
                                    inputMode="decimal"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label htmlFor="tipo" className="text-sm font-medium">Tipo</label>
                                <select
                                    id="tipo"
                                    name="tipo"
                                    value={form.tipo}
                                    onChange={onChange}
                                    className="border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-stone-400 bg-white"
                                    disabled={salvando}
                                    required
                                >
                                    <option value="COMUM">COMUM</option>
                                    <option value="CONTROLADO">CONTROLADO</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label htmlFor="filialId" className="text-sm font-medium">Filial</label>
                                <select
                                    id="filialId"
                                    name="filialId"
                                    value={form.filialId}
                                    onChange={onChange}
                                    className="border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-stone-400 bg-white"
                                    disabled={salvando || carregandoFiliais}
                                    required
                                >
                                    <option value="" disabled>{carregandoFiliais ? 'Carregando...' : 'Selecione a filial'}</option>
                                    {filiais.map(f => (
                                        <option key={f.id} value={f.id}>{f.id} - {f.endereco}</option>
                                    ))}
                                </select>
                            </div>
                            {erro && (
                                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                                    {erro}
                                </div>
                            )}
                            <div className="flex items-center gap-3">
                                <button
                                    type="submit"
                                    disabled={salvando}
                                    className="bg-stone-700 hover:bg-stone-800 text-white text-sm font-medium px-4 py-2 rounded-md disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
                                    {salvando ? (editandoId != null ? 'Atualizando...' : 'Salvando...') : (editandoId != null ? 'Atualizar' : 'Salvar')}
                                </button>
                                {editandoId != null && (
                                    <button
                                        type="button"
                                        onClick={cancelarEdicao}
                                        disabled={salvando}
                                        className="text-xs text-stone-600 hover:underline disabled:opacity-50">
                                        Cancelar edição
                                    </button>
                                )}
                            </div>
                        </form>
                    </CardContent>
                    <CardFooter>
                        <div className="flex gap-4 items-center">
                            <button
                                type="button"
                                onClick={carregarMedicamentos}
                                disabled={loading}
                                className="text-xs text-stone-600 hover:underline disabled:opacity-50">{loading ? 'Atualizando...' : 'Atualizar lista'}</button>
                            <button
                                type="button"
                                onClick={carregarFiliais}
                                disabled={carregandoFiliais}
                                className="text-xs text-stone-600 hover:underline disabled:opacity-50">{carregandoFiliais ? 'Recarregando filiais...' : 'Recarregar filiais'}</button>
                        </div>
                    </CardFooter>
                </Card>

                <Card className="min-h-[300px]">
                    <CardHeader>
                        <CardTitle>Lista de Medicamentos</CardTitle>
                        <CardDescription>{loading ? 'Carregando...' : medicamentos.length ? `${medicamentos.length} medicamento(s)` : 'Nenhum medicamento cadastrado'}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm border-collapse">
                                <thead>
                                    <tr className="text-left border-b">
                                        <th className="py-2 pr-4">ID</th>
                                        <th className="py-2 pr-4">Nome</th>
                                        <th className="py-2 pr-4">Preço</th>
                                        <th className="py-2 pr-4">Tipo</th>
                                        <th className="py-2 pr-4">Filial</th>
                                        <th className="py-2 pr-2">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {!loading && medicamentos.map(m => {
                                        const filial = filialPorId(m.filialId)
                                        return (
                                            <tr key={m.id} className="border-b last:border-b-0 hover:bg-stone-50">
                                                <td className="py-2 pr-4 font-mono text-xs">{m.id}</td>
                                                <td className="py-2 pr-4">{m.nome}</td>
                                                <td className="py-2 pr-4 font-mono">{formatarPreco(m.preco)}</td>
                                                <td className="py-2 pr-4"><span className="inline-block px-2 py-0.5 rounded bg-stone-100 text-stone-700 text-[11px] font-medium">{m.tipo}</span></td>
                                                <td className="py-2 pr-4 text-xs">{filial ? `${filial.id} - ${filial.endereco}` : m.filialId}</td>
                                                <td className="py-2 pr-2 whitespace-nowrap text-xs">
                                                    <button
                                                        type="button"
                                                        onClick={() => iniciarEdicao(m)}
                                                        disabled={loading || salvando}
                                                        className="text-blue-600 hover:underline disabled:opacity-50 mr-2">
                                                        Editar
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => deletar(m.id)}
                                                        disabled={loading || salvando}
                                                        className="text-red-600 hover:underline disabled:opacity-50">
                                                        Excluir
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                    {loading && (
                                        <tr><td colSpan={6} className="py-4 text-center text-stone-500">Carregando...</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}