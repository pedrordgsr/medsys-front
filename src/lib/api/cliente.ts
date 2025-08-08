import { api } from './axios'

export interface ClienteDTO {
  id: number
  nome: string
  cpf: string
}

export interface ClienteCreateDTO {
  nome: string
  cpf: string
}

export async function listarClientes() {
  const { data } = await api.get<ClienteDTO[]>('/cliente')
  return data
}

export async function criarCliente(payload: ClienteCreateDTO) {
  const { data } = await api.post<ClienteDTO>('/cliente', payload)
  return data
}

export async function atualizarCliente(id: number, payload: ClienteCreateDTO) {
  const { data } = await api.put<ClienteDTO>(`/cliente/${id}`, payload)
  return data
}

export async function deletarCliente(id: number) {
  await api.delete(`/cliente/${id}`)
}
