const { castArray, isFunction, map, toLower, toNumber, startCase, trimStart } = require('lodash')

const config = require('../../config')

function selectCheckboxFilter (query, filter) {
  const data = map(filter, (item) => {
    map(castArray(query), (element) => {
      if (element === item.value) {
        item.checked = true
      }
    })
    return item
  })
  return data
}

/**
 * @param key = company_name
 * @param value = req.query['company-name']
 * @param utility = utility function e.g. for transforming string to array,
 */

function sanitizeKeyValuePair (key, value = '', utility = {}) {
  if (isFunction(utility)) {
    return (value.length && { [key]: utility(value) })
  } else {
    return (value.length && { [key]: value })
  }
}

function transformPageToOffset (page) {
  if (page === 1) {
    return 0
  } else {
    return (page * config.paginationOffset) - config.paginationOffset
  }
}

function transformQueryToTurnoverFilter (key, min = '', max = '') {
  return ((min.length || max.length) && { [key]: {
    'min': getNumber(min),
    'max': getNumber(max),
  } })
}

function transformToLowerTrimStart (value) {
  return trimStart(toLower(value))
}

function transformQueryToEvidenceFilter (key, min = '', max = '') {
  return ((min.length || max.length) && { [key]: {
    'min': getCappedDate(min, 'startDate'),
    'max': getCappedDate(max, 'endDate'),
  } })
}

function getCappedDate (element, cap) {
  if (element.length) {
    return element
  } else if (cap === 'startDate') {
    return new Date(0)
  } else if (cap === 'endDate') {
    return new Date()
  }
}

/**
 * value = last_export_evidence:desc
 */
function getSortValues (value = '') {
  const list = value.split(/:| /)

  return {
    field: list[0],
    ascending: list[1] === 'asc',
  }
}

function getNumber (element) {
  if (element.length) {
    return toNumber(element)
  }
}

function transformQueryToDoubleFilter (key, value = '') {
  return (value.length && { [key]: {
    'code_match': value,
  } })
}

function transformQueryToSortFilter (value = '') {
  const values = getSortValues(value) || value
  const field = values.field || 'export_propensity'
  const ascending = values.ascending || false

  return {
    field,
    ascending,
  }
}

function transformStringToOption (string) {
  return {
    value: string,
    text: startCase(toLower(string)),
  }
}

module.exports = {
  selectCheckboxFilter,
  sanitizeKeyValuePair,
  transformPageToOffset,
  transformQueryToDoubleFilter,
  transformQueryToEvidenceFilter,
  transformQueryToSortFilter,
  transformQueryToTurnoverFilter,
  transformStringToOption,
  transformToLowerTrimStart,
}



