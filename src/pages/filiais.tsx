import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { listarFiliais, criarFilial, atualizarFilial, deletarFilial, type FilialDTO } from '@/lib/api/filial'

type Filial = FilialDTO

interface NovoFilialForm { endereco: string; telefone: string }

export default function Filiais() {
    const [filiais, setFiliais] = useState<Filial[]>([])
    const [loading, setLoading] = useState(false)
    const [erro, setErro] = useState<string | null>(null)
    const [form, setForm] = useState<NovoFilialForm>({ endereco: '', telefone: '' })
    const [salvando, setSalvando] = useState(false)
    const [editandoId, setEditandoId] = useState<number | null>(null)

    async function carregar() {
        setLoading(true)
        setErro(null)
        try {
            const data = await listarFiliais()
            setFiliais(data)
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : 'Erro ao buscar filiais'
            setErro(msg)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { carregar() }, [])

    function onChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target
        setForm(f => ({ ...f, [name]: value }))
    }

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!form.endereco.trim() || !form.telefone.trim()) {
            setErro('Preencha endereço e telefone')
            return
        }
        setErro(null)
        setSalvando(true)
        try {
            const payload = { endereco: form.endereco.trim(), telefone: form.telefone.trim() }
            if (editandoId != null) {
                await atualizarFilial(editandoId, payload)
            } else {
                await criarFilial(payload)
            }
            setForm({ endereco: '', telefone: '' })
            setEditandoId(null)
            await carregar() // Recarrega lista
            } catch (e: unknown) {
                const msg = e instanceof Error ? e.message : 'Erro ao salvar'
                setErro(msg)
        } finally {
            setSalvando(false)
        }
    }

    function iniciarEdicao(filial: Filial) {
        if (salvando || loading) return
        setForm({ endereco: filial.endereco, telefone: filial.telefone })
        setEditandoId(filial.id)
        setErro(null)
    }

    function cancelarEdicao() {
        if (salvando) return
        setForm({ endereco: '', telefone: '' })
        setEditandoId(null)
        setErro(null)
    }

    async function deletar(id: number) {
        if (salvando || loading) return
        const confirmacao = window.confirm('Deseja realmente excluir esta filial?')
        if (!confirmacao) return
        setSalvando(true)
        setErro(null)
        try {
            await deletarFilial(id)
            // Se estava editando esse mesmo id, cancela edição
            if (editandoId === id) cancelarEdicao()
            await carregar()
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : 'Erro ao deletar'
            setErro(msg)
        } finally {
            setSalvando(false)
        }
    }

    return (
        <div className="p-6 max-w-5xl mx-auto flex flex-col gap-6">
            <h1 className="text-2xl font-semibold text-stone-700">Filiais</h1>
            <div className="grid md:grid-cols-2 gap-6 items-start">
                <Card>
                    <CardHeader>
                        <CardTitle>Nova Filial</CardTitle>
                        <CardDescription>Cadastrar filial com Endereço e Telefone.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
                            <div className="flex flex-col gap-1">
                                <label htmlFor="endereco" className="text-sm font-medium">Endereço</label>
                                <input
                                    id="endereco"
                                    name="endereco"
                                    value={form.endereco}
                                    onChange={onChange}
                                    className="border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-stone-400"
                                    placeholder="Endereço completo"
                                    disabled={salvando}
                                    required
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label htmlFor="telefone" className="text-sm font-medium">Telefone</label>
                                <input
                                    id="telefone"
                                    name="telefone"
                                    value={form.telefone}
                                    onChange={onChange}
                                    className="border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-stone-400"
                                    placeholder="(xx) xxxxx-xxxx"
                                    disabled={salvando}
                                    required
                                    maxLength={11}
                                />
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
                        <button
                            type="button"
                            onClick={carregar}
                            disabled={loading}
                            className="text-xs text-stone-600 hover:underline disabled:opacity-50">{loading ? 'Atualizando...' : 'Atualizar lista'}</button>
                    </CardFooter>
                </Card>

                <Card className="min-h-[300px]">
                    <CardHeader>
                        <CardTitle>Lista de Filiais</CardTitle>
                        <CardDescription>{loading ? 'Carregando...' : filiais.length ? `${filiais.length} filial(is)` : 'Nenhuma filial cadastrada'}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm border-collapse">
                                <thead>
                                    <tr className="text-left border-b">
                                        <th className="py-2 pr-4">ID</th>
                                        <th className="py-2 pr-4">Endereço</th>
                                        <th className="py-2 pr-4">Telefone</th>
                                        <th className="py-2 pr-2">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {!loading && filiais.map(f => (
                                        <tr key={f.id} className="border-b last:border-b-0 hover:bg-stone-50">
                                            <td className="py-2 pr-4 font-mono text-xs">{f.id}</td>
                                            <td className="py-2 pr-4">{f.endereco}</td>
                                            <td className="py-2 pr-4 font-mono">{f.telefone}</td>
                                            <td className="py-2 pr-2 whitespace-nowrap text-xs">
                                                <button
                                                    type="button"
                                                    onClick={() => iniciarEdicao(f)}
                                                    disabled={loading || salvando}
                                                    className="text-blue-600 hover:underline disabled:opacity-50 mr-2">
                                                    Editar
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => deletar(f.id)}
                                                    disabled={loading || salvando}
                                                    className="text-red-600 hover:underline disabled:opacity-50">
                                                    Excluir
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {loading && (
                                        <tr><td colSpan={3} className="py-4 text-center text-stone-500">Carregando...</td></tr>
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