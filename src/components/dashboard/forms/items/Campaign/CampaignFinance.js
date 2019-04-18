import React, { Component } from 'react'
import PropTypes from 'prop-types'
import NewCampaignHoc from './NewCampaignHoc'
import Translate from 'components/translate/Translate'
import Grid from '@material-ui/core/Grid'
import Dropdown from 'components/common/dropdown'
import TextField from '@material-ui/core/TextField'
import DateTimePicker from 'components/common/DateTimePicker'
import { utils } from 'ethers'
import { validations } from 'adex-models'
import MomentUtils from '@date-io/moment'
const moment = new MomentUtils()

const VALIDATOR_LEADER_URL = process.env.VALIDATOR_LEADER_URL
const VALIDATOR_LEADER_ID = process.env.VALIDATOR_LEADER_ID
const VALIDATOR_LEADER_FEE = '0'
const VALIDATOR_FOLLOWER_URL = process.env.VALIDATOR_FOLLOWER_URL
const VALIDATOR_FOLLOWER_ID = process.env.VALIDATOR_FOLLOWER_ID
const VALIDATOR_FOLLOWER_FEE = '0'

const AdvPlatformValidators = {
	[VALIDATOR_LEADER_ID]: {
		id: VALIDATOR_LEADER_ID,
		url: VALIDATOR_LEADER_URL,
		fee: VALIDATOR_LEADER_FEE
	}
}

const PubPlatformValidators = {
	[VALIDATOR_FOLLOWER_ID]: {
		id: VALIDATOR_FOLLOWER_ID,
		url: VALIDATOR_FOLLOWER_URL,
		fee: VALIDATOR_FOLLOWER_FEE
	}
}

const VALIDATOR_SOURCES = [
	AdvPlatformValidators,
	PubPlatformValidators
]

const AdvValidatorsSrc = Object.keys(AdvPlatformValidators).map(key => {
	const val = AdvPlatformValidators[key]
	return {
		value: key,
		label: `${val.url} - ${val.id}`
	}
})

const PubValidatorsSrc = Object.keys(PubPlatformValidators).map(key => {
	const val = PubPlatformValidators[key]
	return {
		value: key,
		label: `${val.url} - ${val.id}`
	}
})

const getTotalImpressions = ({depositAmount, minPerImpression}) => {
	if(!depositAmount) {
		return 'DEPOSIT_NOT_SET'
	} else if (!minPerImpression) {
		return 'CPM_NOT_SET'
	} else {
		return utils.commify(Math.floor((depositAmount / minPerImpression) * 1000))
	}
}

const validateCampaignDates = ({ created = Date.now(), withdrawPeriodStart, activeFrom }) => {
	let error = null

	if (withdrawPeriodStart && activeFrom && (withdrawPeriodStart <= activeFrom)) {
		error = { message: 'ERR_END_BEFORE_START', prop: 'activeFrom' }
	} else if (withdrawPeriodStart && (withdrawPeriodStart < created)) {
		error = { message: 'ERR_END_BEFORE_NOW', prop: 'withdrawPeriodStart' }
	} else if (activeFrom && (activeFrom < created)) {
		error = { message: 'ERR_START_BEFORE_NOW', prop: 'activeFrom' }
	} else if (activeFrom && !withdrawPeriodStart) {
		error = { message: 'ERR_NO_END', prop: 'withdrawPeriodStart' }
	}

	return { error }
}

const validateAmounts = ({ maxDeposit = 0, depositAmount, minPerImpression }) => {
	const maxDep = parseFloat(maxDeposit)
	const dep = parseFloat(depositAmount)
	const min = parseFloat(minPerImpression)

	let error = null
	if (dep && (dep > maxDep)) {
		error = { message: 'ERR_INSUFFICIENT_IDENTITY_BALANCE', prop: 'depositAmount' }
	} if (dep && (dep < min)) {
		error = { message: 'ERR_CPM_OVER_DEPOSIT', prop: 'minPerImpression' }
	}

	return { error }
}

class CampaignFinance extends Component {
	componentDidMount() {
		const { newItem } = this.props
		this.validateAndUpdateValidator(false, 0, newItem.validators[0])
		this.validateAndUpdateValidator(false, 1, newItem.validators[1])
		this.validateAmount(newItem.depositAmount, 'depositAmount', false, 'REQUIRED_FIELD')
		this.validateAmount(newItem.minPerImpression, 'minPerImpression', false, 'REQUIRED_FIELD')
	}

	validateUnits(adUnits, dirty) {
		const isValid = !!adUnits.length
		this.props.validate(
			'adUnits',
			{
				isValid: isValid,
				err: { msg: 'ERR_ADUNITS_REQIURED' },
				dirty: dirty
			})
	}

	validateAndUpdateValidator = (dirty, index, key, update) => {
		const { validators } = this.props.newItem
		const newValidators = [...validators]
		const newValue = VALIDATOR_SOURCES[index][key]

		newValidators[index] = newValue

		const isValid =
			!!newValidators[0] &&
			!!newValidators[1] &&
			!!newValidators[0].id &&
			!!newValidators[0].url &&
			!!newValidators[1].id &&
			!!newValidators[1].url

		if (update) {
			this.props.handleChange('validators', newValidators)
		}

		this.props.validate('validators', {
			isValid: isValid,
			err: { msg: 'ERR_VALIDATORS' },
			dirty: dirty
		})
	}

	validateAmount(value = '', prop, dirty, errMsg) {
		const isValidNumber = validations.isNumberString(value)
		const isValid = isValidNumber && utils.parseUnits(value, 18)

		if (!isValid) {
			this.props.validate(
				prop,
				{
					isValid: isValid,
					err: { msg: errMsg || 'ERR_INVALID_AMOUNT' },
					dirty: dirty
				})
		} else {

			const { newItem, account } = this.props

			const { identityBalanceDai } = account.stats.formated
			const depositAmount = (prop === 'depositAmount') ? value : newItem.depositAmount
			const minPerImpression = (prop === 'minPerImpression') ? value : newItem.minPerImpression

			const result = validateAmounts({ maxDeposit: identityBalanceDai, depositAmount, minPerImpression })

			this.props.validate(
				prop,
				{
					isValid: !result.error,
					err: { msg: result.error ? result.error.message : '' },
					dirty: dirty
				})
		}
	}

	handleDates = (prop, value, dirty) => {

		const { newItem, handleChange } = this.props
		const withdrawPeriodStart = (prop === 'withdrawPeriodStart') ? value : newItem.withdrawPeriodStart
		const activeFrom = (prop === 'activeFrom') ? value : newItem.activeFrom
		const result = validateCampaignDates({ withdrawPeriodStart, activeFrom, created: newItem.created })

		this.props.validate(
			'activeFrom',
			{
				isValid: !result.error,
				err: { msg: result.error ? result.error.message : '' },
				dirty: dirty
			})

		this.props.validate(
			'withdrawPeriodStart',
			{
				isValid: !result.error,
				err: { msg: result.error ? result.error.message : '' },
				dirty: dirty
			})

		handleChange(prop, value)
	}

	render() {
		const {
			handleChange,
			newItem,
			t,
			invalidFields,
			account
		} = this.props
		const {
			validators,
			depositAmount,
			minPerImpression,
			depositAsset,
			activeFrom,
			withdrawPeriodStart
		} = newItem

		const { identityBalanceDai } = account.stats.formated

		const from = activeFrom || undefined
		const to = withdrawPeriodStart || undefined
		const now = moment.date().valueOf()

		const errDepAmnt = invalidFields['depositAmount']
		const errMin = invalidFields['minPerImpression']
		const errFrom = invalidFields['activeFrom']
		const errTo = invalidFields['withdrawPeriodStart']
		const impressions = getTotalImpressions({depositAmount, minPerImpression})

		return (
			<div>
				<Grid
					container
					spacing={16}
				>
					<Grid item xs={12}>
						<Dropdown
							fullWidth
							required
							onChange={(value) =>
								this.validateAndUpdateValidator(true, 0, value, true)}
							source={AdvValidatorsSrc}
							value={(validators[0] || {}).id + ''}
							label={t('ADV_PLATFORM_VALIDATOR')}
							htmlId='leader-validator-dd'
							name='leader-validator'
						/>
					</Grid>
					<Grid item xs={12}>
						<Dropdown
							fullWidth
							required
							onChange={(value) =>
								this.validateAndUpdateValidator(true, 1, value, true)}
							source={PubValidatorsSrc}
							value={(validators[1] || {}).id + ''}
							label={t('PUB_PLATFORM_VALIDATOR')}
							htmlId='follower-validator-dd'
							name='follower-validator'
						/>
					</Grid>
					<Grid item sm={12} md={6}>
						<TextField
							fullWidth
							type='text'
							required
							label={'Campaign '
								+ t('depositAmount', { isProp: true, args: ['DAI'] })
								+ ` Available on identity ${identityBalanceDai} DAI`
							}
							name='depositAmount'
							value={depositAmount}
							onChange={(ev) =>
								handleChange('depositAmount', ev.target.value)}
							onBlur={() =>
								this.validateAmount(depositAmount, 'depositAmount', true)}
							onFocus={() =>
								this.validateAmount(depositAmount, 'depositAmount', false)}
							error={errDepAmnt && !!errDepAmnt.dirty}
							maxLength={120}
							helperText={
								(errDepAmnt && !!errDepAmnt.dirty)
									? errDepAmnt.errMsg
									: t('DEPOSIT_AMOUNT_HELPER_TXT')
							}
						/>
					</Grid>
					<Grid item sm={12} md={6}>
						<TextField
							fullWidth
							type='text'
							required
							label={'CPM' + t('CPM_LABEL ', { args: ['DAI'] }) + impressions }
							name='minPerImpression'
							value={minPerImpression}
							onChange={(ev) =>
								handleChange('minPerImpression', ev.target.value)}
							onBlur={() =>
								this.validateAmount(minPerImpression, 'minPerImpression', true)}
							onFocus={() =>
								this.validateAmount(minPerImpression, 'minPerImpression', false)}
							error={errMin && !!errMin.dirty}
							maxLength={120}
							helperText={
								(errMin && !!errMin.dirty)
									? errMin.errMsg
									: t('MIN_PER_IMPRESSION_HELPER_TXT')
							}
						/>
					</Grid>			
					<Grid item sm={12} md={6}>
						<DateTimePicker
							emptyLabel={t('SET_CAMPAIGN_START')}
							disablePast
							fullWidth
							calendarIcon
							label={t('CAMPAIGN_STARTS', { isProp: true })}
							minDate={now}
							maxDate={to}
							onChange={(val) => {
								this.handleDates('activeFrom', val.valueOf(), true)
							}}
							value={from || null}
							error={errFrom && !!errFrom.dirty}
							helperText={
								(errFrom && !!errFrom.dirty)
									? errFrom.errMsg
									: t('CAMPAIGN_STARTS_FROM_HELPER_TXT')
							}
						/>
					</Grid>	
					<Grid item sm={12} md={6}>
						<DateTimePicker
							emptyLabel={t('SET_CAMPAIGN_END')}
							disablePast
							fullWidth
							calendarIcon
							label={t('CAMPAIGN_ENDS', { isProp: true })}
							minDate={from || now}
							onChange={(val) =>
								this.handleDates('withdrawPeriodStart', val.valueOf(), true)}
							value={to || null}
							error={errTo && !!errTo.dirty}
							helperText={
								(errTo && !!errTo.dirty)
									? errTo.errMsg
									: t('CAMPAIGN_ENDS_HELPER_TXT')
							}
						/>
					</Grid>
				</Grid>
			</div>
		)
	}
}

CampaignFinance.propTypes = {
	newItem: PropTypes.object.isRequired,
	title: PropTypes.string,
	descriptionHelperTxt: PropTypes.string,
	nameHelperTxt: PropTypes.string,
	adUnits: PropTypes.array.isRequired
}

const NewCampaignFinance = NewCampaignHoc(CampaignFinance)

export default Translate(NewCampaignFinance)
