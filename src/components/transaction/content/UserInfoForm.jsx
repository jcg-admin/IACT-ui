import React from 'react'
import PropTypes from 'prop-types'

function UserInfoForm({ data, onChange }) {
  const _handleChange = (e) => {
    const { name, value } = e.target
    onChange?.({ ...data, [name]: value })
  }

  return (
    <div className="content-user-info-form">
      <h3>Información del Usuario</h3>
      <form className="form-fields">
        <div className="form-group">
          <label>Nombre:</label>
          <input type="text" name="firstName" value={data.firstName || ''} onChange={_handleChange} />
        </div>
        <div className="form-group">
          <label>Apellido:</label>
          <input type="text" name="lastName" value={data.lastName || ''} onChange={_handleChange} />
        </div>
        <div className="form-group">
          <label>Email:</label>
          <input type="email" name="email" value={data.email || ''} onChange={_handleChange} />
        </div>
        <div className="form-group">
          <label>Username:</label>
          <input type="text" name="username" value={data.username || ''} onChange={_handleChange} />
        </div>
      </form>
    </div>
  )
}

UserInfoForm.propTypes = {
  data: PropTypes.object,
  onChange: PropTypes.func
}

export default UserInfoForm
