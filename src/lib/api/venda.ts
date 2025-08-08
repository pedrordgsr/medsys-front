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

export interface VendaItemDTO extends VendaItemCreateDTO {
  id: number
}

export interface VendaDTO {
  id: number
  cliente_id: number
  filial_id: number
  itens: VendaItemDTO[]
  createdAt?: string
}

export async function criarVenda(payload: VendaCreateDTO) {
  const { data } = await api.post<VendaDTO>('/venda', payload)
  return data
}
