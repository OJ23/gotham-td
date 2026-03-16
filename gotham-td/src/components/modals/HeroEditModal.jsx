import { Modal } from 'antd'

export default function HeroEditModal({
  editingHero,
  editHeroForm,
  editHeroImageFile,
  editSubmitting,
  onCancel,
  onSave,
  onFormChange,
  onImageFileChange,
}) {
  return (
    <Modal
      title={editingHero ? `Edit Hero: ${editingHero.alias}` : 'Edit Hero'}
      open={Boolean(editingHero)}
      onCancel={onCancel}
      onOk={onSave}
      okText="Save changes"
      confirmLoading={editSubmitting}
      destroyOnHidden
    >
      <div className="row g-3">
        <div className="col-12">
          <label className="form-label">Name</label>
          <input className="form-control" value={editHeroForm.name} onChange={(e) => onFormChange('name', e.target.value)} />
        </div>
        <div className="col-12">
          <label className="form-label">Alias</label>
          <input className="form-control" value={editHeroForm.alias} onChange={(e) => onFormChange('alias', e.target.value)} />
        </div>
        <div className="col-12">
          <label className="form-label">Role</label>
          <input className="form-control" value={editHeroForm.role} onChange={(e) => onFormChange('role', e.target.value)} />
        </div>
        <div className="col-12">
          <label className="form-label">Power</label>
          <input className="form-control" value={editHeroForm.power} onChange={(e) => onFormChange('power', e.target.value)} />
        </div>
        <div className="col-12">
          <label className="form-label">City</label>
          <input className="form-control" value={editHeroForm.city} onChange={(e) => onFormChange('city', e.target.value)} />
        </div>
        <div className="col-12">
          <label className="form-label">Image URL</label>
          <input className="form-control" value={editHeroForm.image} onChange={(e) => onFormChange('image', e.target.value)} />
        </div>
        <div className="col-12">
          <label className="form-label">Replace Image</label>
          <input type="file" accept="image/*" className="form-control" onChange={(e) => onImageFileChange(e.target.files?.[0] || null)} />
          {editHeroImageFile && <small className="text-muted d-block mt-1">Selected file: {editHeroImageFile.name}</small>}
        </div>
        <div className="col-12">
          <label className="form-label">Notes</label>
          <textarea className="form-control" rows="4" value={editHeroForm.description} onChange={(e) => onFormChange('description', e.target.value)} />
        </div>
      </div>
    </Modal>
  )
}
