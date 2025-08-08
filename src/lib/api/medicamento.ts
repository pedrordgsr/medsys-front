import { api } from './axios'

export interface MedicamentoDTO {
  id: number
  nome: string
  preco: number
  tipo: string
  filialId: number
}

export interface MedicamentoCreateDTO {
  nome: string
  preco: number
  tipo: string
  filialId: number
}

export async function listarMedicamentos() {
  const { data } = await api.get<MedicamentoDTO[]>('/medicamento')
  return data
}

export async function criarMedicamento(payload: MedicamentoCreateDTO) {
  const { data } = await api.post<MedicamentoDTO>('/medicamento', payload)
  return data
}

export async function atualizarMedicamento(id: number, payload: MedicamentoCreateDTO) {
  const { data } = await api.put<MedicamentoDTO>(`/medicamento/${id}`, payload)
  return data
}

export async function deletarMedicamento(id: number) {
  await api.delete(`/medicamento/${id}`)
}
