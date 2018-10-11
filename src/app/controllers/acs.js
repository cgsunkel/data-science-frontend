const { isEmpty, map, castArray, toLower } = require('lodash')

const config = require('../config')
const backendService = require('../lib/backend-service')
const getCacheTime = require('../lib/get-cache-time')
const logger = require('../lib/logger')

const {
  selectCheckboxFilter,
  sanitizeKeyValuePair,
  tranformQueryToDoubleFilter,
  transformQueryToEvidenceFilter,
  transformQueryToTurnoverFilter,
  transformStringToOption,
} = require('../transformers')
const { buildPagination } = require('../lib/pagination')

async function buildFilters (req, res, next) {
  res.locals.query = {
    filters: {
      ...sanitizeKeyValuePair('company_name', req.query['company-name'], toLower),
      ...sanitizeKeyValuePair('export_propensity', req.query['export-potential'], castArray),
      ...tranformQueryToDoubleFilter('export_codes', req.query['commodity-code']),
      ...transformQueryToEvidenceFilter('last_export_evidence', req.query['export-evidence-start-date'], req.query['export-evidence-end-date']),
      ...tranformQueryToDoubleFilter('sic_codes', req.query['sic-codes']),
      ...transformQueryToTurnoverFilter('turnover', req.query['turnover-minimum'], req.query['turnover-maximum']),
      ...sanitizeKeyValuePair('market_of_interest', req.query['market-of-interest'], castArray),
      ...sanitizeKeyValuePair('market_exported', req.query['market-exported-to'], castArray),
      ...sanitizeKeyValuePair('service_usage', req.query['service-used'], castArray),
      ...sanitizeKeyValuePair('region', req.query['uk-regions'], castArray),
    },
  }

  next()
}

async function dataByType (req, res) {
  const data = await backendService.getDataByType(req.params.type)

  if (!config.isDev) {
    const cacheTime = getCacheTime()

    res.setHeader('Cache-Control', 'public, max-age=' + cacheTime.seconds)
    res.setHeader('Expires', cacheTime.utc)
  }

  res.json(data.body)
}

async function getData (req, res, query = {}) {
  try {
    const page = req.query.page || 0
    const offset = page === 0 ? page : page * 20
    const query = isEmpty(res.locals.query.filters) ? {} : res.locals.query
    // TODO(jf): store the default offset and limit vals

    return await backendService.searchForCompanies(offset, 20, query)
  } catch (err) {
    logger.error(err)
  }
}

async function internalCompanyIdEvents (req, res) {
  const data = await backendService.getEventsByInternalCompanyId(req.params.id)

  res.json(data.body)
}

function getLatestExportFilter (startDate = '', endDate = '') {
  if (startDate.length || endDate.length) {
    return {
      latestExport: {
        startDate,
        endDate,
      },
    }
  }
}

async function renderIndex (req, res) {
  const marketOfInterestList = await backendService.getDataByType('market_of_interest')
  const serviceUsed = await backendService.getDataByType('service_usage')
  const marketExportedTo = await backendService.getDataByType('market_exported')
  const ukRegions = await backendService.getDataByType('region')
  const exportPotential = await backendService.getDataByType('export_propensity')
  const data = await getData(req, res, req.body).then((response) => {
    const result = response.body.result || {}

    return {
      ...response,
      page: 1,
      limit: 20,
      pagination: buildPagination(req.query, { count: config.paginationMaxResults, page: 1, result }),
      result,
    }
  })

  const latestExport = getLatestExportFilter(req.query['export-evidence-start-date'], req.query['export-evidence-end-date'])

  return res.render('acs/index', {
    result: data,
    filters: {
      companyName: req.query['company-name'],
      exportPotential: selectCheckboxFilter(req.query['export-potential'], map(exportPotential.body.result, transformStringToOption)),
      commodityCode: req.query['commodity-code'],
      latestExport,
      sicCodes: req.query['sic-codes'],
      turnover: res.locals.query.filters.turnover,
      marketOfInterest: selectCheckboxFilter(req.query['market-of-interest'], map(marketOfInterestList.body.result, transformStringToOption)),
      marketExportedTo: selectCheckboxFilter(req.query['market-exported-to'], map(marketExportedTo.body.result, transformStringToOption)),
      serviceUsed: selectCheckboxFilter(req.query['service-used'], map(serviceUsed.body.result, transformStringToOption)),
      ukRegions: selectCheckboxFilter(req.query['uk-regions'], map(ukRegions.body.result, transformStringToOption)),
    },
  })
}

async function search (req, res) {
  const offset = req.query.offset
  const limit = req.query.limit
  const postData = req.body
  const data = await backendService.searchForCompanies(offset, limit, postData)

  res.json(data.body)
}

async function searchBySicCode (req, res) {
  const data = await backendService.searchBySicCode(req.params.code)

  res.json(data.body)
}

async function searchByExportCode (req, res) {
  const data = await backendService.searchByExportCode(req.params.code)

  res.json(data.body)
}

module.exports = {
  buildFilters,
  dataByType,
  internalCompanyIdEvents,
  renderIndex,
  search,
  searchBySicCode,
  searchByExportCode,
}
