import { api } from './axios'

export interface FilialDTO {
  id: number
  endereco: string
  telefone: string
}

export interface FilialCreateDTO {
  endereco: string
  telefone: string
}

export async function listarFiliais() {
  const { data } = await api.get<FilialDTO[]>('/filial')
  return data
}

export async function criarFilial(payload: FilialCreateDTO) {
  const { data } = await api.post<FilialDTO>('/filial', payload)
  return data
}

export async function atualizarFilial(id: number, payload: FilialCreateDTO) {
  const { data } = await api.put<FilialDTO>(`/filial/${id}`, payload)
  return data
}

export async function deletarFilial(id: number) {
  await api.delete(`/filial/${id}`)
}
