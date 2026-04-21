import { useState } from 'react'
import { useCategories, Category } from '@/hooks/useCategories'
import { CategoryTable } from '@/components/categories/CategoryTable'
import { CategoryModal } from '@/components/categories/CategoryModal'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default function CategoriesPage() {
  const { categories, loading, createCategory, updateCategory, deleteCategory } = useCategories()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  function handleEdit(category: Category) {
    setEditingCategory(category)
    setModalOpen(true)
  }

  function handleClose() {
    setModalOpen(false)
    setEditingCategory(null)
  }

  async function handleSubmit(data: { name: string; parent_id?: string | null; is_active?: boolean }) {
    if (editingCategory) {
      return updateCategory(editingCategory.id, data)
    }
    return createCategory(data)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Categorias</h2>
          <p className="text-slate-500 text-sm mt-1">
            Organize seus produtos em categorias
          </p>
        </div>
        <Button
          onClick={() => setModalOpen(true)}
          className="bg-blue-800 hover:bg-blue-900"
        >
          <Plus size={16} className="mr-2" /> Nova categoria
        </Button>
      </div>

      <CategoryTable
        categories={categories}
        loading={loading}
        onEdit={handleEdit}
        onDelete={deleteCategory}
      />

      <CategoryModal
        open={modalOpen}
        onClose={handleClose}
        onSubmit={handleSubmit}
        category={editingCategory}
        categories={categories}
      />
    </div>
  )
}