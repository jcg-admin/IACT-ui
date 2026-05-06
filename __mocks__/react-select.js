const React = require('react')
function Select({ options = [], onChange, placeholder, isMulti, isDisabled, value, noOptionsMessage, formatOptionLabel, getOptionLabel, getOptionValue, theme, isOptionDisabled, classNamePrefix, styles }) {
  return React.createElement('select', {
    'data-testid': 'react-select',
    onChange: (e) => {
      if (onChange) {
        const opt = options.find(o => String(getOptionValue ? getOptionValue(o) : o.value) === e.target.value)
        onChange(opt || null)
      }
    },
    disabled: isDisabled,
    multiple: !!isMulti,
  },
    React.createElement('option', { value: '' }, placeholder),
    ...options.map(o => React.createElement('option', { key: getOptionValue ? getOptionValue(o) : o.value, value: getOptionValue ? getOptionValue(o) : o.value }, getOptionLabel ? getOptionLabel(o) : o.label))
  )
}
module.exports = Select
module.exports.default = Select
