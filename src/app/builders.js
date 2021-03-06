const { castArray, isNil } = require('lodash')

const config = require('../../config')

const {
  sanitizeKeyValuePair,
  transformQueryToDoubleFilter,
  transformQueryToEvidenceFilter,
  transformQueryToSortFilter,
  transformQueryToTurnoverFilter,
  transformToLowerTrimStart,
  transformPostcodeFilter,
} = require('./transformers')

function buildHeader (req, res, next) {
  if (config.sso.bypass) {
    res.locals.globalHeader = {
      name: 'dit user',
      email: 'user@email.com',
      supportUrl: `${config.datahubDomain}/support`,
      permitted_applications: [ 'datahub-crm', 'find-exporters' ].map((key) => ({ key })),
      profileUrl: `${config.datahubDomain}/profile`,
    }

    next()
  } else {
    const introspect = req.session.introspect

    if (!isNil(introspect)) {
      res.locals.globalHeader = {
        name: `${introspect.first_name} ${introspect.last_name}`,
        email: introspect.username,
        supportUrl: `${config.datahubDomain}/support`,
        permitted_applications: introspect.permitted_applications,
        profileUrl: `${config.datahubDomain}/profile`,
      }
    }

    next()
  }
}

async function buildFilters (req, res, next) {
  res.locals.query = {
    filters: {
      ...sanitizeKeyValuePair('company_name', req.query['company-name'], transformToLowerTrimStart),
      ...sanitizeKeyValuePair('export_propensity', req.query['export-potential'], castArray),
      ...transformQueryToDoubleFilter('export_codes', req.query['export-codes']),
      ...transformQueryToEvidenceFilter('last_export_evidence', req.query['export-evidence-start-date'], req.query['export-evidence-end-date']),
      ...transformQueryToDoubleFilter('sic_codes', req.query['sic-codes']),
      ...transformQueryToTurnoverFilter('turnover', req.query['turnover-minimum'], req.query['turnover-maximum']),
      ...sanitizeKeyValuePair('market_of_interest', req.query['market-of-interest'], castArray),
      ...sanitizeKeyValuePair('market_exported', req.query['market-exported-to'], castArray),
      ...sanitizeKeyValuePair('dit_sectors', req.query['dit-sectors'], castArray),
      ...sanitizeKeyValuePair('service_usage', req.query['service-used'], castArray),
      ...sanitizeKeyValuePair('region', req.query['uk-regions'], castArray),
      ...sanitizeKeyValuePair('postcode', req.query.postcode, transformPostcodeFilter),
    },
    sort: {
      ...transformQueryToSortFilter(req.query.sort),
    },
  }
  next()
}

module.exports = {
  buildHeader,
  buildFilters,
}
