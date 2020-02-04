import React from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import TextField from '@material-ui/core/TextField'
import Dropdown from 'components/common/dropdown'
import { constants } from 'adex-models'
import { t, selectValidationsById, selectNewTransactionById } from 'selectors'
import { execute, updateNewTransaction } from 'actions'

const { IdentityPrivilegeLevel } = constants

const PRIV_LEVELS_SRC = Object.keys(IdentityPrivilegeLevel).map(key => {
	return {
		value: IdentityPrivilegeLevel[key],
		label: key,
	}
})

function SeAddressPrivilege(props) {
	const { stepsId, validateId } = props
	const { setAddr, privLevel } = useSelector(state =>
		selectNewTransactionById(state, stepsId)
	)

	const validations = useSelector(
		state => selectValidationsById(state, validateId) || {}
	)

	const errAddr = validations['setAddr']
	const warning = validations['setAddrWarning']
	const errPrivLvl = validations['privLevel']

	return (
		<div>
			<div> {t('SET_IDENTITY_PRIVILEGE_MAIN_INFO')}</div>
			<TextField
				type='text'
				required
				fullWidth
				label={t('ADDR_TO_SET_PRIV_LEVEL')}
				name='setAddr'
				value={setAddr || ''}
				onChange={ev =>
					execute(
						updateNewTransaction({
							tx: stepsId,
							key: 'setAddr',
							value: ev.target.value,
						})
					)
				}
				error={errAddr && !!errAddr.dirty}
				helperText={errAddr && !!errAddr.dirty ? errAddr.errMsg : ''}
			/>
			<Dropdown
				required
				label={t('SELECT_PRIV_LEVEL')}
				// helperText={t('SELECT_PRIV_LEVEL_HELPER_TXT')}
				onChange={val =>
					execute(
						updateNewTransaction({
							tx: stepsId,
							key: 'privLevel',
							value: val,
						})
					)
				}
				source={PRIV_LEVELS_SRC}
				value={typeof privLevel === 'number' ? privLevel : ''}
				htmlId='label-privLevel'
				fullWidth
				error={errPrivLvl && !!errPrivLvl.dirty}
				helperText={
					errPrivLvl && !!errPrivLvl.dirty
						? errPrivLvl.errMsg
						: t('SELECT_PRIV_LEVEL_HELPER_TXT')
				}
			/>
		</div>
	)
}

SeAddressPrivilege.propTypes = {
	stepsId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
}

export default SeAddressPrivilege
