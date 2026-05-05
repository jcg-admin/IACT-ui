import React from 'react'
import PropTypes from 'prop-types'

function FilterForm({ data, onChange }) {
  const _handleChange = (e) => {
    const { name, value } = e.target
    onChange?.({ ...data, [name]: value })
  }

  return (
    <div className="content-filter-form">
      <h3>Seleccionar Filtros</h3>
      <form className="filter-fields">
        <div className="form-group">
          <label>Rango de fechas:</label>
          <input type="date" name="startDate" value={data.startDate || ''} onChange={_handleChange} />
          <input type="date" name="endDate" value={data.endDate || ''} onChange={_handleChange} />
        </div>
        <div className="form-group">
          <label>Estado:</label>
          <select name="status" value={data.status || ''} onChange={_handleChange}>
            <option value="">Todos</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>
        <div className="form-group">
          <label>Formato:</label>
          <select name="format" value={data.format || 'csv'} onChange={_handleChange}>
            <option value="csv">CSV</option>
            <option value="xlsx">XLSX</option>
            <option value="json">JSON</option>
          </select>
        </div>
      </form>
    </div>
  )
}

FilterForm.propTypes = {
  data: PropTypes.object,
  onChange: PropTypes.func
}

export default FilterForm
