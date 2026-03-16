import { Modal } from 'antd'

export default function CriminalEditModal({
  editingCriminal,
  editCriminalForm,
  editCriminalImageFile,
  editSubmitting,
  onCancel,
  onSave,
  onFormChange,
  onImageFileChange,
}) {
  return (
    <Modal
      title={editingCriminal ? `Edit Villain: ${editingCriminal.alias}` : 'Edit Villain'}
      open={Boolean(editingCriminal)}
      onCancel={onCancel}
      onOk={onSave}
      okText="Save changes"
      confirmLoading={editSubmitting}
      destroyOnHidden
    >
      <div className="row g-3">
        <div className="col-12">
          <label className="form-label">Name</label>
          <input className="form-control" value={editCriminalForm.name} onChange={(e) => onFormChange('name', e.target.value)} />
        </div>
        <div className="col-12">
          <label className="form-label">Alias</label>
          <input className="form-control" value={editCriminalForm.alias} onChange={(e) => onFormChange('alias', e.target.value)} />
        </div>
        <div className="col-12">
          <label className="form-label">Crime Type</label>
          <input className="form-control" value={editCriminalForm.crimeType} onChange={(e) => onFormChange('crimeType', e.target.value)} />
        </div>
        <div className="col-12">
          <label className="form-label">Zone</label>
          <input className="form-control" value={editCriminalForm.zone} onChange={(e) => onFormChange('zone', e.target.value)} />
        </div>
        <div className="col-12">
          <label className="form-label">Threat Level</label>
          <select className="form-select" value={editCriminalForm.threatLevel} onChange={(e) => onFormChange('threatLevel', e.target.value)}>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
            <option>Extreme</option>
          </select>
        </div>
        <div className="col-12">
          <label className="form-label">Image URL</label>
          <input className="form-control" value={editCriminalForm.image} onChange={(e) => onFormChange('image', e.target.value)} />
        </div>
        <div className="col-12">
          <label className="form-label">Replace Image</label>
          <input type="file" accept="image/*" className="form-control" onChange={(e) => onImageFileChange(e.target.files?.[0] || null)} />
          {editCriminalImageFile && <small className="text-muted d-block mt-1">Selected file: {editCriminalImageFile.name}</small>}
        </div>
        <div className="col-12">
          <label className="form-label">Notes</label>
          <textarea className="form-control" rows="4" value={editCriminalForm.description} onChange={(e) => onFormChange('description', e.target.value)} />
        </div>
      </div>
    </Modal>
  )
}
