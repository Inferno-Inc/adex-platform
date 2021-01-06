import { createSelector } from 'reselect'
import {
	t,
	selectCampaignsArray,
	selectRoutineWithdrawTokens,
	selectAdSlotsArray,
	selectAdUnits,
	creatArrayOnlyLengthChangeSelector,
	selectCampaignAnalyticsByChannelStats,
	selectCampaignEventsCount,
	selectCampaignAnalyticsByChannelToAdUnit,
	selectTotalStatsByAdUnits,
	selectCampaignUnitsById,
	selectMainToken,
	selectAnalytics,
	selectPublisherAdvanceStatsToAdUnit,
	selectPublisherStatsByCountry,
	selectCampaignAnalyticsByChannelToCountry,
	selectCampaignAnalyticsByChannelToCountryPay,
	selectPublisherAggrStatsByCountry,
	selectCampaignAggrStatsByCountry,
	selectPublisherPayStatsByCountry,
	selectPublisherAdvanceStatsToAdSlot,
	selectSavedAudiences,
	selectAudienceByCampaignId,
	selectSide,
} from 'selectors'
import { utils } from 'ethers'
import chartCountriesData from 'world-atlas/countries-50m.json'
import { scaleLinear } from 'd3-scale'
import { formatAbbrNum } from 'helpers/formatters'
import {
	PRIMARY_DARKEST,
	PRIMARY_LIGHTEST,
	SECONDARY,
	SECONDARY_LIGHT,
} from 'components/App/themeMUi'
import { grey } from '@material-ui/core/colors'
import { constants, helpers } from 'adex-models'
const { CountryNames, numericToAlpha2 } = constants
const { pricingBondsToUserInputPerMile } = helpers

export const selectCampaignsTableData = createSelector(
	[selectCampaignsArray, selectRoutineWithdrawTokens, selectSide],
	(campaigns, tokens, side) =>
		campaigns
			.filter(x => !x.archived)
			.map(item => {
				const { decimals = 18 } = tokens[item.depositAsset] || {}
				const {
					id,
					spec = {},
					adUnits = [],
					status,
					pricingBoundsCPMUserInput,
					specPricingBounds,
				} = item

				const firstUnit = adUnits[0] || {}

				const to = `/dashboard/${side}/campaigns/${id}`
				const toReceipt = `/dashboard/${side}/receipt/${id}`

				const cpm =
					pricingBoundsCPMUserInput ||
					pricingBondsToUserInputPerMile({
						pricingBounds: specPricingBounds.IMPRESSION
							? specPricingBounds
							: {
									IMPRESSION: {
										min: item.minPerImpression || spec.minPerImpression,
										max: item.maxPerImpression || spec.maxPerImpression,
									},
							  },
						decimals,
					})

				return {
					media: {
						side,
						id,
						mediaUrl: firstUnit.mediaUrl || '',
						mediaMime: firstUnit.mediaMime || '',
						to,
					},
					title: item.title,
					status: {
						status,
						id,
					},
					depositAmount: Number(
						utils.formatUnits(item.depositAmount || '0', decimals)
					),
					fundsDistributedRatio: item.status.fundsDistributedRatio || 0,
					impressions: selectCampaignEventsCount('IMPRESSION', id),
					clicks: selectCampaignEventsCount('CLICK', id),

					ctr:
						(selectCampaignEventsCount('CLICK', id) /
							selectCampaignEventsCount('IMPRESSION', id)) *
							100 || 0,
					minPerImpression: Number(cpm.IMPRESSION.min),

					maxPerImpression: Number(cpm.IMPRESSION.max),
					created: item.created,
					activeFrom: spec.activeFrom || item.activeFrom,
					withdrawPeriodStart:
						spec.withdrawPeriodStart || item.withdrawPeriodStart,
					actions: {
						side,

						id,
						to,
						toReceipt,
						receiptReady:
							(item.status.humanFriendlyName === 'Closed' ||
								item.status.humanFriendlyName === 'Completed') &&
							(item.status.name === 'Exhausted' ||
								item.status.name === 'Expired'),
					},
					id,
					receiptAvailable:
						item.status.humanFriendlyName === 'Closed' ||
						item.status.humanFriendlyName === 'Completed',
				}
			})
)

export const selectCampaignsTableDataOnLengthChange = creatArrayOnlyLengthChangeSelector(
	selectCampaignsTableData,
	data => data
)

export const selectCampaignsMaxImpressions = createSelector(
	selectCampaignsArray,
	campaigns =>
		Math.max.apply(null, campaigns.map(i => Number(i.impressions || 0))) || 1
)

export const selectCampaignsMaxClicks = createSelector(
	selectCampaignsArray,
	campaigns =>
		Math.max.apply(null, campaigns.map(i => Number(i.clicks || 0))) || 1
)

export const selectCampaignsMaxDeposit = createSelector(
	[selectCampaignsArray, selectRoutineWithdrawTokens],
	(campaigns, tokens) =>
		Math.max.apply(
			null,
			campaigns.map(i => {
				const { decimals = 18 } = tokens[i.depositAsset] || {}
				return Number(utils.formatUnits(i.depositAmount, decimals) || 0)
			})
		)
)

export const selectAdSlotsTableData = createSelector(
	[selectAdSlotsArray, selectPublisherAdvanceStatsToAdSlot, (_, side) => side],
	(
		slots,
		{
			impressionsByAdSlot,
			clicksByAdSlot,
			impressionsPayByAdSlot,
			clicksPayByAdSlot,
		},
		side
	) =>
		slots
			.filter(x => !x.archived)
			.map(item => {
				const id = item.id || item.ipfs
				const to = `/dashboard/${side}/slots/${id}`

				const { title, mediaUrl, mediaMime, type, created } = item

				const clicks = clicksByAdSlot[id]
				const impressions = impressionsByAdSlot[id]
				return {
					media: {
						id,
						mediaUrl,
						mediaMime,
						to,
					},
					title: title,
					type: type.replace('legacy_', ''),
					created: created,
					impressions,
					clicks,
					ctr: ((clicks || 0) / (impressions || 1)) * 100,
					earnings:
						Number(impressionsPayByAdSlot[id] || 0) +
						Number(clicksPayByAdSlot[id] || 0),
					actions: {
						to,
						item,
						id,
						title,
					},
				}
			})
)

export const selectAdUnitsTableData = createSelector(
	[
		(state, { side, campaignId, items }) => {
			const selectOnImage = !!items
			return {
				selectOnImage,
				side,
				items:
					items ||
					(campaignId
						? selectCampaignUnitsById(state, campaignId)
						: selectAdUnits(state)),
				impressionsByAdUnit: id =>
					campaignId
						? selectCampaignAnalyticsByChannelToAdUnit(state, {
								type: 'IMPRESSION',
								campaignId,
						  })[id]
						: selectTotalStatsByAdUnits(state, {
								type: 'IMPRESSION',
								adUnitId: id,
						  }),
				clicksByAdUnit: id =>
					campaignId
						? selectCampaignAnalyticsByChannelToAdUnit(state, {
								type: 'CLICK',
								campaignId,
						  })[id]
						: selectTotalStatsByAdUnits(state, {
								type: 'CLICK',
								adUnitId: id,
						  }),
			}
		},
	],
	({ selectOnImage, side, items, impressionsByAdUnit, clicksByAdUnit }) =>
		Object.values(items)
			.filter(x => !x.archived)
			.map(item => {
				const id = item.id || item.ipfs
				const to = `/dashboard/${side}/units/${id}`
				const { title, mediaUrl, mediaMime, type, created } = item

				return {
					id,
					media: {
						selectOnImage,
						id,
						mediaUrl,
						mediaMime,
						to,
					},
					impressions: impressionsByAdUnit(id) || 0,
					clicks: clicksByAdUnit(id) || 0,
					ctr: (clicksByAdUnit(id) / impressionsByAdUnit(id)) * 100 || 0,
					title,
					type,
					created,
					actions: {
						id,
						title,
						to,
						item,
					},
				}
			})
)

export const selectAudiencesTableData = createSelector(
	[selectSavedAudiences],
	audiences =>
		audiences
			.filter(x => !x.archived)
			.map(item => {
				const { id, title, inputs, version, created, updated } = item

				const to = `/dashboard/advertiser/audiences/${id}`

				return {
					title: {
						title: title || id,
						to,
					},
					created,
					updated,
					actions: {
						id,
						audienceInput: { inputs, version },
						title,
						to: `/dashboard/advertiser/audiences/${id}`,
					},
				}
			})
)

const mapByCountryTableData = ({
	impressionsByCountry,
	clicksByCountry,
	impressionsAggrByCountry,
	impressionsPayByCountry,
	clicksPayByCountry,
} = {}) => {
	const addEarnings = impressionsPayByCountry && clicksPayByCountry
	// NOTE: assume that there are no click without impressions
	return Object.keys(impressionsByCountry).map(key => {
		return {
			countryName: CountryNames[key],
			impressions: impressionsByCountry[key] || 0,
			percentImpressions:
				((impressionsByCountry[key] || 0) /
					(impressionsAggrByCountry.total || 1)) *
				100,
			clicks: clicksByCountry[key] || 0,

			ctr:
				((clicksByCountry[key] || 0) / (impressionsByCountry[key] || 1)) * 100,
			...(addEarnings && {
				earnings:
					(impressionsPayByCountry[key] || 0) + (clicksPayByCountry[key] || 0),
				averageCPM:
					(Number(impressionsPayByCountry[key] || 0) /
						Number(impressionsByCountry[key] || 1)) *
					1000,
			}),
		}
	})
}

export const selectPublisherStatsByCountryData = createSelector(
	[
		state => selectPublisherStatsByCountry(state, 'IMPRESSION'),
		state => selectPublisherStatsByCountry(state, 'CLICK'),
		state => selectPublisherAggrStatsByCountry(state, 'IMPRESSION'),
		state => selectPublisherPayStatsByCountry(state, 'IMPRESSION'),
		state => selectPublisherPayStatsByCountry(state, 'CLICK'),
	],
	(
		impressionsByCountry,
		clicksByCountry,
		impressionsAggrByCountry,
		impressionsPayByCountry,
		clicksPayByCountry
	) => ({
		impressionsByCountry,
		clicksByCountry,
		impressionsAggrByCountry,
		impressionsPayByCountry,
		clicksPayByCountry,
	})
)

export const selectCampaignAnalyticsToCountryData = createSelector(
	(state, { campaignId }) => {
		return [
			selectCampaignAnalyticsByChannelToCountry(state, {
				type: 'IMPRESSION',
				campaignId,
			}),
			selectCampaignAnalyticsByChannelToCountry(state, {
				type: 'CLICK',
				campaignId,
			}),
			selectCampaignAggrStatsByCountry(state, {
				campaignId,
				type: 'IMPRESSION',
			}),
			selectCampaignAnalyticsByChannelToCountryPay(state, {
				type: 'IMPRESSION',
				campaignId,
			}),
			selectCampaignAnalyticsByChannelToCountryPay(state, {
				type: 'CLICK',
				campaignId,
			}),
		]
	},
	([
		impressionsByCountry,
		clicksByCountry,
		impressionsAggrByCountry,
		impressionsPayByCountry,
		clicksPayByCountry,
	]) => {
		return {
			impressionsByCountry,
			clicksByCountry,
			impressionsAggrByCountry,
			impressionsPayByCountry,
			clicksPayByCountry,
		}
	}
)

export const selectPublisherStatsByCountryTableData = createSelector(
	selectPublisherStatsByCountryData,
	data => mapByCountryTableData(data)
)

export const selectCampaignAnalyticsToCountryTableData = createSelector(
	[
		(state, { campaignId }) => {
			return selectCampaignAnalyticsToCountryData(state, { campaignId })
		},
	],
	data => mapByCountryTableData(data)
)

const mapByCountryMapChartData = ({
	impressionsByCountry,
	clicksByCountry,
	impressionsAggrByCountry,
} = {}) => {
	const colorScale = scaleLinear()
		.domain([0, impressionsAggrByCountry.max])
		.range([PRIMARY_LIGHTEST, PRIMARY_DARKEST])

	const hoverColor = SECONDARY
	const pressedColor = SECONDARY_LIGHT
	const chartData = { ...chartCountriesData }

	chartData.objects.countries.geometries = chartCountriesData.objects.countries.geometries.map(
		data => {
			const id = numericToAlpha2(data.id)
			const impressions = impressionsByCountry[id] || 0
			const clicks = clicksByCountry[id] || 0
			const name = CountryNames[id] || data.name
			const percentImpressions =
				((impressions || 0) / impressionsAggrByCountry.total) * 100 || 0
			const ctr = ((clicks || 0) / (impressions || 1)) * 100 || 0
			const tooltipElements = [
				`${name}:`,
				`${t('LABEL_IMPRESSIONS')}: ${formatAbbrNum(impressions, 2)}`,
				`${t('LABEL_CLICKS')}: ${formatAbbrNum(clicks, 2)}`,
				`${t('LABEL_PERC')}: ${percentImpressions.toFixed(2)} %`,
				`${t('LABEL_CTR')}: ${ctr.toFixed(4)} %`,
			]

			const fillColor = impressions > 0 ? colorScale(impressions) : grey[400]

			const properties = {
				name,
				fillColor,
				tooltipElements,
			}

			return { ...data, properties }
		}
	)

	return { chartData, hoverColor, pressedColor }
}

export const selectPublisherStatsByCountryMapChartData = createSelector(
	[selectPublisherStatsByCountryData],
	data => mapByCountryMapChartData(data)
)

export const selectCampaignAnalyticsToCountryMapChartData = createSelector(
	[
		(state, { campaignId }) =>
			selectCampaignAnalyticsToCountryData(state, { campaignId }),
	],
	data => mapByCountryMapChartData(data)
)

export const selectBestEarnersTableData = createSelector(
	selectPublisherAdvanceStatsToAdUnit,
	items =>
		items.map(item => {
			const {
				id,
				mediaUrl,
				mediaMime,
				type,
				impressions,
				clicks,
				impressionsPay,
				clicksPay,
			} = item
			return {
				id,
				media: {
					id,
					mediaUrl,
					mediaMime,
				},
				type,
				impressions,
				clicks,
				ctr: ((clicks || 0) / (impressions || 1)) * 100,
				earnings: impressionsPay + clicksPay,
			}
		})
)

export const selectCampaignStatsTableData = createSelector(
	[
		selectAudienceByCampaignId,
		(state, campaignId) => {
			return {
				impressions: selectCampaignAnalyticsByChannelStats(state, {
					type: 'IMPRESSION',
					campaignId,
				}),
				clicks: selectCampaignAnalyticsByChannelStats(state, {
					type: 'CLICK',
					campaignId,
				}),
			}
		},
	],
	(campaignAudienceInput, { impressions, clicks }) => {
		const imprStats = impressions.reportChannelToHostname || {}
		const clickStats = clicks.reportChannelToHostname || {}
		const earnStats = impressions.reportChannelToHostnamePay || {}

		const rules = campaignAudienceInput
			? campaignAudienceInput.inputs.publishers
			: null

		return Object.keys(imprStats).map(key => ({
			isBlacklisted:
				rules &&
				((rules.apply === 'nin' &&
					(rules.nin || []).some(x => x.includes(key))) ||
					(rules.apply === 'ni' &&
						!(rules.in || []).some(x => x.includes(key)))),

			website: key,
			impressions: imprStats[key] || 0,
			ctr: ((clickStats[key] || 0) / (imprStats[key] || 1)) * 100,
			earnings: Number(earnStats[key] || 0),
			averageCPM:
				(Number(earnStats[key] || 0) / Number(imprStats[key] || 1)) * 1000,
			clicks: clickStats[key] || 0,
		}))
	}
)

export const selectCampaignTotalValues = createSelector(
	(state, channelId) => selectCampaignStatsTableData(state, channelId),
	data =>
		data.reduce(
			(result, current) => {
				const newResult = { ...result }
				newResult.totalClicks += current.clicks
				newResult.totalImpressions += current.impressions
				newResult.totalEarnings += current.earnings
				return newResult
			},
			{ totalClicks: 0, totalImpressions: 0, totalEarnings: 0 }
		)
)

export const selectCampaignStatsMaxValues = createSelector(
	(state, channelId) => selectCampaignStatsTableData(state, channelId),
	data =>
		data.reduce(
			(result, current) => {
				const newResult = { ...result }

				newResult.maxClicks = Math.max(current.clicks, newResult.maxClicks)
				newResult.maxCTR = Math.max(current.ctr, newResult.maxCTR)
				newResult.maxImpressions = Math.max(
					current.impressions,
					newResult.maxImpressions
				)
				newResult.maxEarnings = Math.max(
					current.earnings,
					newResult.maxEarnings
				)
				return newResult
			},
			{ maxClicks: 0, maxImpressions: 0, maxEarnings: 0, maxCTR: 0 }
		)
)

export const selectAdUnitsStatsMaxValues = createSelector(
	(state, { side, items, campaignId }) =>
		selectAdUnitsTableData(state, { side, items, campaignId }),
	data =>
		data.reduce(
			(result, current) => {
				const newResult = { ...result }

				newResult.maxClicks = Math.max(current.clicks, newResult.maxClicks)
				newResult.maxCTR = Math.max(current.ctr, newResult.maxCTR)
				newResult.maxImpressions = Math.max(
					current.impressions,
					newResult.maxImpressions
				)
				return newResult
			},
			{ maxClicks: 0, maxImpressions: 0, maxCTR: 0 }
		)
)

export const selectPublisherReceiptsStatsByMonthTableData = createSelector(
	[selectAnalytics, selectMainToken, (_, date) => date],
	({ receipts }, token, date) => {
		const result = []
		if (receipts && receipts[date]) {
			const { decimals = 18 } = token || {}
			for (let [key, value] of Object.entries(receipts[date])) {
				result.push({
					impressions: value.impressions,
					payouts: Number(utils.formatUnits(value.payouts || '0', decimals)),
					date: +key,
				})
			}
		}
		return result
	}
)

export const selectPublisherReceiptsStatsByMonthTotalValues = createSelector(
	[selectPublisherReceiptsStatsByMonthTableData],
	data =>
		data.reduce(
			(result, current) => {
				const newResult = { ...result }
				newResult.totalPayouts += +current.payouts
				newResult.totalImpressions += +current.impressions
				return newResult
			},
			{ totalPayouts: 0, totalImpressions: 0 }
		)
)
