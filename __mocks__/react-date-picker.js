const React = require('react')
function DatePicker({ value, onChange, disabled }) {
  return React.createElement('input', {
    type: 'date',
    'data-testid': 'date-picker',
    disabled: !!disabled,
    onChange: (e) => onChange && onChange(e.target.value ? new Date(e.target.value) : null),
  })
}
module.exports = DatePicker
module.exports.default = DatePicker
