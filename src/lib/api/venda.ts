import { api } from './axios'

export interface VendaItemCreateDTO {
  medicamentoId: number
  quantidade: number
  receita: boolean
}

export interface VendaCreateDTO {
  cliente_id: number
  filial_id: number
  itens: VendaItemCreateDTO[]
}

export interface VendaItemDTO {
  medicamentoId: number
  medicamentoNome: string
  valorUnitario: number
  quantidade: number
  subtotal: number
  receita: boolean
}

export interface VendaDTO {
  id: number
  dataHora: string
  total: number
  id_cliente: number
  id_filial: number
  itens: VendaItemDTO[]
}

export async function criarVenda(payload: VendaCreateDTO) {
  const { data } = await api.post<VendaDTO>('/venda', payload)
  return data
}

export async function listarVendas() {
  const { data } = await api.get<VendaDTO[]>('/venda')
  return data
}

export async function obterVenda(id: number) {
  const { data } = await api.get<VendaDTO>(`/venda/${id}`)
  return data
}

export async function atualizarVenda(id: number, payload: VendaCreateDTO) {
  const { data } = await api.put<VendaDTO>(`/venda/${id}`, payload)
  return data
}

export async function deletarVenda(id: number) {
  await api.delete(`/venda/${id}`)
}
