import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
})

export const cadastroSchema = z.object({
  company_name: z.string().min(2, 'Nome da empresa deve ter no mínimo 2 caracteres'),
  cnpj: z.string().optional(),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
  confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
  message: 'As senhas não coincidem',
  path: ['confirm_password'],
})

export const recuperarSenhaSchema = z.object({
  email: z.string().email('E-mail inválido'),
})

export const novaSenhaSchema = z.object({
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
  confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
  message: 'As senhas não coincidem',
  path: ['confirm_password'],
})

export type LoginForm = z.infer<typeof loginSchema>
export type CadastroForm = z.infer<typeof cadastroSchema>
export type RecuperarSenhaForm = z.infer<typeof recuperarSenhaSchema>
export type NovaSenhaForm = z.infer<typeof novaSenhaSchema>