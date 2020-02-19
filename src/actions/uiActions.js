import React from 'react'
import Button from '@material-ui/core/Button'
import * as types from 'constants/actionTypes'
import Helper from 'helpers/miscHelpers'
import { selectCompanyData, selectAccountIdentityAddr } from 'selectors'
import { translate } from 'services/translations/translations'

export function updateSpinner(item, value) {
	return function(dispatch) {
		return dispatch({
			type: types.UPDATE_SPINNER,
			spinner: item,
			value: value,
		})
	}
}

export function updateGlobalUi(item, value, category) {
	return function(dispatch) {
		return dispatch({
			type: types.UPDATE_GLOBAL_UI,
			item: item,
			value: value,
			category: category,
		})
	}
}

export function updateUiByIdentity(item, value, category) {
	return function(dispatch, getState) {
		const identity = selectAccountIdentityAddr(getState())
		return dispatch({
			type: types.UPDATE_UI_BY_IDENTITY,
			identity,
			item: item,
			value: value,
			category: category,
		})
	}
}

export function addToast({
	type,
	action,
	label = '',
	timeout = false,
	unclosable,
	anchorOrigin,
	top,
}) {
	return function(dispatch) {
		const id = Helper.getGuid()
		dispatch({
			type: types.ADD_TOAST,
			toast: {
				type,
				action,
				label,
				timeout,
				unclosable,
				anchorOrigin,
				top,
				id,
			},
		})

		return id
	}
}

export function removeToast(toastId) {
	return function(dispatch) {
		return dispatch({
			type: types.REMOVE_TOAST,
			toast: toastId,
		})
	}
}

export function confirmAction(
	onConfirm,
	onCancel,
	{ confirmLabel = '', cancelLabel = '', title = '', text = '' } = {},
	noActionBtns,
	active
) {
	return async function(dispatch) {
		return await dispatch({
			type: types.CONFIRM_ACTION,
			confirm: {
				onConfirm: onConfirm,
				onCancel: onCancel,
				data: {
					confirmLabel: confirmLabel,
					cancelLabel: cancelLabel,
					title: title,
					text: text,
				},
				noActionBtns,
				active,
			},
		})
	}
}

export function updateNav(item, value) {
	return function(dispatch) {
		return dispatch({
			type: types.UPDATE_NAV,
			item: item,
			value: value,
		})
	}
}

export function changeLanguage(lang) {
	return function(dispatch) {
		return dispatch({
			type: types.CHANGE_LANGUAGE,
			lang: lang,
		})
	}
}

export function updateRegistrationAllowed(search) {
	return function(dispatch) {
		const searchParams = new URLSearchParams(search)
		if (searchParams.get('eddie') === 'themoonicorn') {
			updateGlobalUi('allowRegistration', true)(dispatch)
		}
	}
}

export function updateCompanyData(newData) {
	return async function(dispatch, getState) {
		try {
			const companyData = selectCompanyData(getState())
			const newCompanyData = { ...companyData, ...newData }
			updateUiByIdentity('companyData', newCompanyData)(dispatch, getState)
		} catch (err) {
			console.error('ERR_UPDATING_COMPANY_DATA', err)
			addToast({
				type: 'cancel',
				label: translate('ERR_UPDATING_COMPANY_DATA'),
				timeout: 20000,
			})(dispatch)
		}
	}
}

export function updateSelectedItems(collection, selectedItems) {
	return function(dispatch) {
		return dispatch({
			type: types.UPDATE_SELECTED_ITEMS,
			selectedItems,
			collection,
		})
	}
}

export function updateSelectedCampaigns(selectedItems) {
	return function(dispatch) {
		return updateSelectedItems('campaigns', selectedItems)(dispatch)
	}
}

export function refreshCacheAndReload({ version, notification = false }) {
	return function(dispatch) {
		try {
			if (notification) {
			} else {
				addToast({
					type: 'accept',
					action: (
						// eslint-disable-next-line react/react-in-jsx-scope
						<Button
							color='primary'
							size='small'
							variant='contained'
							onClick={() => {
								if (caches) {
									// Service worker cache should be cleared with caches.delete()
									caches.keys().then(async function(names) {
										await Promise.all(names.map(name => caches.delete(name)))
									})
								}
								window.location.reload(true)
							}}
						>
							{translate('REFRESH')}
						</Button>
					),
					label: translate('SUCCESS_UPDATING_NEW_APP_VERSION', {
						args: [version],
					}),
					timeout: 5000,
				})(dispatch)
			}
		} catch (err) {
			console.error('ERR_UPDATING_APP', err)
			addToast({
				type: 'cancel',
				label: translate('ERR_UPDATING_APP'),
				timeout: 20000,
			})(dispatch)
		}
	}
}

export function handleRedirectParams(search) {
	return function(dispatch) {
		const searchParams = new URLSearchParams(search)

		const email = searchParams.get('confirm-email')
		const identity = searchParams.get('confirm-identity')
		const grant = searchParams.get('confirm-grant')

		if (email && identity && !grant) {
			addToast({
				type: 'accept',
				label: translate('CONFIRM_IDENTITY_EMAIL', {
					args: [email, identity],
				}),
				timeout: 20000,
			})(dispatch)
		} else if (email && identity && grant) {
			addToast({
				type: 'accept',
				label: translate('CONFIRM_IDENTITY_EMAIL_GRANT', {
					args: [email, identity, grant],
				}),
				timeout: 20000,
			})(dispatch)
		}
	}
}

export function updateEasterEggsAllowed(search) {
	return function(dispatch) {
		const searchParams = new URLSearchParams(search)

		if (
			searchParams.get(process.env.EASTER_EGGS_PARAM) ===
			process.env.EASTER_EGGS_VALUE
		) {
			updateGlobalUi('allowEasterEggs', true)(dispatch)
		}
	}
}

export function updatePrivilegesWarningAccepted(accepted) {
	return function(dispatch, getState) {
		updateUiByIdentity('privilegesWarningAccepted', accepted)(
			dispatch,
			getState
		)
	}
}
