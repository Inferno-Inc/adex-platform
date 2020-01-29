import React from 'react'
import Grid from '@material-ui/core/Grid'
import { makeStyles } from '@material-ui/core/styles'
import { useSelector } from 'react-redux'
import { selectLocationQuery } from 'selectors'
import AuthMetamask from './AuthMetamask'
import AuthTrezor from './AuthTrezor'
import AuthLedger from './AuthLedger'

const useStyles = makeStyles(theme => {
	const spacing = theme.spacing(1)

	return {
		tabsContainer: {
			display: 'flex',
			flexGrow: 1,
			overflowY: 'auto',
			position: 'relative',
			margin: spacing,
		},
	}
})

function AuthMethod() {
	const classes = useStyles()
	const query = useSelector(selectLocationQuery)
	const method = query['external']

	return (
		<Grid container spacing={2} direction='row' alignContent='flex-start'>
			<Grid item xs={12} className={classes.tabsContainer}>
				{method === 'metamask' && <AuthMetamask />}
				{method === 'trezor' && <AuthTrezor />}
				{method === 'ledger' && <AuthLedger />}
			</Grid>
		</Grid>
	)
}

export default AuthMethod
