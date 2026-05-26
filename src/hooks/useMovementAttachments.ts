import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

export interface MovementAttachment {
  id: string
  movement_id: string
  file_name: string
  file_url: string
  file_size: number | null
  uploaded_by: string | null
  created_at: string
}

export function useMovementAttachments() {
  const { profile } = useAuth()
  const [uploading, setUploading] = useState(false)

  async function uploadAttachment(
    movementId: string,
    file: File
  ): Promise<MovementAttachment | null> {
    if (!profile?.id) return null

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo 10MB.')
      return null
    }

    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      toast.error('Formato inválido. Use PDF, JPG ou PNG.')
      return null
    }

    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const fileName = `${movementId}/${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('movement-attachments')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: urlData } = await supabase.storage
        .from('movement-attachments')
        .createSignedUrl(fileName, 60 * 60 * 24 * 7)

      const { data, error } = await supabase
        .from('movement_attachments')
        .insert({
          movement_id: movementId,
          file_name: file.name,
          file_url: urlData?.signedUrl || '',
          file_size: file.size,
          uploaded_by: profile.id,
        })
        .select()
        .single()

      if (error) throw error
      toast.success('Arquivo anexado com sucesso!')
      return data
    } catch (err) {
      toast.error('Erro ao anexar arquivo')
      return null
    } finally {
      setUploading(false)
    }
  }

  async function deleteAttachment(id: string, fileUrl: string) {
    try {
      const path = fileUrl.split('/movement-attachments/')[1]?.split('?')[0]
      if (path) {
        await supabase.storage.from('movement-attachments').remove([path])
      }
      await supabase.from('movement_attachments').delete().eq('id', id)
      toast.success('Anexo removido.')
      return true
    } catch (err) {
      toast.error('Erro ao remover anexo')
      return false
    }
  }

  async function fetchAttachments(movementId: string): Promise<MovementAttachment[]> {
    const { data } = await supabase
      .from('movement_attachments')
      .select('*')
      .eq('movement_id', movementId)
      .order('created_at')
    return data || []
  }

  return { uploading, uploadAttachment, deleteAttachment, fetchAttachments }
}
