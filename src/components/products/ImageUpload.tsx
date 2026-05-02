import { useState, useRef } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { ImageIcon, Upload, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface ImageUploadProps {
  currentImageUrl?: string | null
  onImageChange: (url: string | null) => void
  disabled?: boolean
}

export function ImageUpload({ currentImageUrl, onImageChange, disabled }: ImageUploadProps) {
  const { company } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleUpload(file: File) {
    if (!company?.id) return

    // Valida tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Imagem muito grande. Máximo 5MB.')
      return
    }

    // Valida tipo
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Formato inválido. Use JPEG, PNG ou WebP.')
      return
    }

    setUploading(true)

    try {
      // Gera nome único para o arquivo
      const ext = file.name.split('.').pop()
      const fileName = `${company.id}/${Date.now()}.${ext}` 

      // Remove imagem anterior se existir
      if (currentImageUrl) {
        const oldPath = currentImageUrl.split('/product-images/')[1]
        if (oldPath) {
          await supabase.storage.from('product-images').remove([oldPath])
        }
      }

      // Faz upload
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      // Obtém URL pública
      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName)

      setPreview(data.publicUrl)
      onImageChange(data.publicUrl)
      toast.success('Imagem enviada com sucesso!')

    } catch (err) {
      toast.error('Erro ao enviar imagem. Tente novamente.')
    } finally {
      setUploading(false)
    }
  }

  async function handleRemove() {
    if (!currentImageUrl) return

    try {
      const oldPath = currentImageUrl.split('/product-images/')[1]
      if (oldPath) {
        await supabase.storage.from('product-images').remove([oldPath])
      }
    } catch (err) {
      // Ignora erro ao remover — pode já ter sido deletado
    }

    setPreview(null)
    onImageChange(null)
  }

  if (disabled) {
    return (
      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
        <ImageIcon size={16} className="text-slate-400" />
        <span className="text-sm text-slate-400">
          Imagem de produto não disponível no seu plano atual
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {preview ? (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
          <img
            src={preview}
            alt="Imagem do produto"
            className="w-full h-full object-contain"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div
          onClick={() => !uploading && fileRef.current?.click()}
          className="w-full aspect-video rounded-lg border-2 border-dashed border-slate-300 
            hover:border-blue-400 hover:bg-slate-50 transition-colors cursor-pointer
            flex flex-col items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <Loader2 size={24} className="text-blue-600 animate-spin" />
              <p className="text-sm text-slate-500">Enviando imagem...</p>
            </>
          ) : (
            <>
              <ImageIcon size={24} className="text-slate-400" />
              <p className="text-sm text-slate-500">Clique para adicionar imagem</p>
              <p className="text-xs text-slate-400">JPEG, PNG ou WebP · Máx. 5MB</p>
            </>
          )}
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleUpload(file)
          e.target.value = ''
        }}
      />

      {preview && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
        >
          <Upload size={14} className="mr-2" />
          Trocar imagem
        </Button>
      )}
    </div>
  )
}
