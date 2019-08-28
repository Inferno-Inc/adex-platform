import * as types from 'constants/actionTypes'
import { addSig, getSig } from 'services/auth/auth'
import { getSession, checkSession } from 'services/adex-market/actions'
import {
	relayerConfig,
	regAccount,
	getGrantType,
} from 'services/adex-relayer/actions'
import { updateSpinner } from './uiActions'
import { translate } from 'services/translations/translations'
import { getAuthSig } from 'services/smart-contracts/actions/ethers'
import { getAccountStats } from 'services/smart-contracts/actions/stats'
import { addToast } from './uiActions'
import { removeLegacyKey } from 'services/wallet/wallet'

// MEMORY STORAGE
export function updateSignin(prop, value) {
	return function(dispatch) {
		return dispatch({
			type: types.UPDATE_SIGNIN,
			prop: prop,
			value: value,
		})
	}
}

export function resetSignin() {
	return function(dispatch) {
		return dispatch({
			type: types.RESET_SIGNIN,
		})
	}
}

// PERSISTENT STORAGE
export function createAccount(acc) {
	return function(dispatch) {
		return dispatch({
			type: types.CREATE_ACCOUNT,
			account: acc,
		})
	}
}

// LOGOUT
export function resetAccount() {
	return function(dispatch) {
		return dispatch({
			type: types.RESET_ACCOUNT,
		})
	}
}

export function updateAccount({ meta, newValues }) {
	return function(dispatch) {
		return dispatch({
			type: types.UPDATE_ACCOUNT,
			meta: meta,
			newValues: newValues,
		})
	}
}

export function updateGasData({ gasData }) {
	return function(dispatch) {
		return dispatch({
			type: types.UPDATE_GAS_DATA,
			gasData: gasData,
		})
	}
}

export function updateAccountStats() {
	return async function(dispatch, getState) {
		const { account } = getState().persist
		try {
			const stats = await getAccountStats({ account })

			updateAccount({ newValues: { stats } })(dispatch)
		} catch (err) {
			console.error('ERR_STATS', err)
			addToast({
				type: 'cancel',
				label: translate('ERR_STATS', { args: [err] }),
				timeout: 20000,
			})(dispatch)
		}
	}
}

export function registerAccount({ wallet, identityData, email }) {
	return async function(dispatch) {
		updateSpinner('registering-account', true)(dispatch)
		try {
			const { txnsRaw, signatures, identityAddr } = identityData
			await regAccount({
				owner: wallet.address,
				email,
				txnsRaw,
				identityAddr,
				signatures,
			})
		} catch (err) {
			console.error('ERR_REGISTERING_ACCOUNT', err)
			addToast({
				type: 'cancel',
				label: translate('ERR_REGISTERING_ACCOUNT', { args: [err] }),
				timeout: 20000,
			})(dispatch)
		}

		updateSpinner('registering-account', false)(dispatch)
	}
}

export function updateAccountSettings() {
	return async function(dispatch, getState) {
		const { identity } = getState().persist.account
		try {
			const settings = {}
			if (settings.grantType === undefined) {
				settings.grantType = (await getGrantType({
					identity: identity.address,
				})).type
				updateAccount({ newValues: { settings } })(dispatch)
			}
		} catch (err) {
			console.error('ERR_SETTINGS', err)
			addToast({
				type: 'cancel',
				label: translate('ERR_SETTINGS', { args: [err] }),
				timeout: 20000,
			})(dispatch)
		}
	}
}

export function createSession({ wallet, identity, email, deleteLegacyKey }) {
	return async function(dispatch) {
		updateSpinner('creating-session', true)(dispatch)
		try {
			const newWallet = { ...wallet }
			const sessionSignature =
				getSig({
					addr: newWallet.address,
					mode: newWallet.authType,
					identity: identity.address,
				}) || null

			const hasSession =
				!!sessionSignature &&
				(await checkSession({
					authSig: sessionSignature,
					skipErrToast: true,
				}))

			if (hasSession) {
				newWallet.authSig = sessionSignature
			} else {
				const {
					signature,
					mode,
					authToken,
					hash,
					typedData,
				} = await getAuthSig({ wallet: newWallet })

				const { status, expiryTime } = await getSession({
					identity: identity.address,
					mode: mode,
					signature: signature,
					authToken: authToken,
					hash,
					typedData,
					signerAddress: newWallet.address,
				})

				if (status === 'OK') {
					addSig({
						addr: wallet.address,
						sig: signature,
						mode: wallet.authType,
						expiryTime: expiryTime,
						identity: identity.address,
					})
					newWallet.authSig = signature
				}
			}

			updateAccount({
				newValues: {
					email: email,
					wallet: newWallet,
					identity: identity,
				},
			})(dispatch)

			if (deleteLegacyKey) {
				removeLegacyKey({
					email: wallet.email,
					password: wallet.password,
				})
			}
		} catch (err) {
			console.error('ERR_GETTING_SESSION', err)
			addToast({
				type: 'cancel',
				label: translate('ERR_GETTING_SESSION', { args: [err] }),
				timeout: 20000,
			})(dispatch)
		}

		updateSpinner('creating-session', false)(dispatch)
	}
}

export function getRelayerConfig() {
	return async function(dispatch) {
		const cfg = await relayerConfig()
		return dispatch({
			type: types.UPDATE_RELAYER_CFG,
			cfg,
		})
	}
}
