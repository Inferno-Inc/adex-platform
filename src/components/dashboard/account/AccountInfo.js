import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import copy from 'copy-to-clipboard'
import Translate from 'components/translate/Translate'
import {
	WithdrawEth,
	WithdrawTokens,
	DepositEth,
	DepositToken,
	WithdrawEthFromIdentity,
	WithdrawTokenFromIdentity
} from 'components/dashboard/forms/web3/transactions'
import { withStyles } from '@material-ui/core/styles'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import ListDivider from '@material-ui/core/Divider'
import IconButton from '@material-ui/core/IconButton'
import CopyIcon from '@material-ui/icons/FileCopy'
import { styles } from './styles.js'

// const RRButton = withReactRouterLink(Button)

class AccountInfo extends React.Component {

	UNSAFE_componentWillMount() {
		const { t, actions, account } = this.props
		const { updateNav, updateAccountStats } = actions
		updateNav('navTitle', t('ACCOUNT'))
		updateAccountStats(account)
	}

	onSave = () => {
		// this.getStats()
	}

	render() {
		const { t, account, classes } = this.props
		const formated = account.stats.formated || {}
		const {
			walletAddress,
			walletAuthType,
			walletPrivileges,
			walletBalanceEth,
			walletBalanceDai,
			identityAddress,
			identityBalanceDai
		} = formated

		return (
			<div>
				<List
				// dense={true}
				>
					<ListItem>
						<ListItemText
							className={classes.address}
							primary={walletAddress}
							secondary={(account.authType === 'demo')
								? t('DEMO_ACCOUNT_WALLET_ADDRESS', { args: [walletAuthType, walletPrivileges] })
								: t('WALLET_ETH_ADDR', { args: [walletAuthType, walletPrivileges] })
							}
						/>
						<IconButton
							color='default'
							onClick={() => {
								copy(walletAddress)
								this.props.actions
									.addToast({ type: 'accept', action: 'X', label: t('COPIED_TO_CLIPBOARD'), timeout: 5000 })
							}}
						>
							<CopyIcon />
						</IconButton>
					</ListItem>
					<ListDivider />
					<ListItem
					>
						<ListItemText
							primary={walletBalanceEth + ' ETH'}
							secondary={t('WALLET_ETH_BALANCE')}
						/>
						<div className={classes.itemActions}>
							<WithdrawEth
								variant='contained'
								color='primary'
								onSave={this.onSave}
								availableAmount={walletBalanceEth}
								tokenName='ETH'
								accAddr={walletAddress}
								className={classes.actionBtn}
								size='small'
							/>
						</div>
					</ListItem>
					<ListDivider />
					<ListItem
					>
						<ListItemText
							primary={walletBalanceDai + ' DAI'}
							secondary={t('WALLET_DAI_BALANCE')}
						/>
						<div className={classes.itemActions}>
							<WithdrawTokens
								variant='contained'
								color='primary'
								onSave={this.onSave}
								availableAmount={walletBalanceDai}
								tokenName='DAI'
								accAddr={walletAddress}
								className={classes.actionBtn}
								size='small'
							/>
						</div>
					</ListItem>
					<ListDivider />
					<ListItem>
						<ListItemText
							className={classes.address}
							primary={identityAddress}
							secondary={(account._authType === 'demo')
								? t('DEMO_ACCOUNT_IDENTITY_ADDRESS')
								: t('IDENTITY_ETH_ADDR')
							}
						/>
						<IconButton
							color='default'
							onClick={() => {
								copy(identityAddress)
								this.props.actions
									.addToast({ type: 'accept', action: 'X', label: t('COPIED_TO_CLIPBOARD'), timeout: 5000 })
							}}
						>
							<CopyIcon />
						</IconButton>
					</ListItem>
					<ListDivider />
					<ListItem
					>
						<ListItemText
							primary={identityBalanceDai + ' DAI'}
							secondary={t('IDENTITY_DAI_BALANCE_AVAILABLE')}
						/>
						<div className={classes.itemActions}>
							<DepositToken
								variant='contained'
								color='secondary'
								onSave={this.onSave}
								walletBalance={walletBalanceDai}
								token='DAI'
								className={classes.actionBtn}
								size='small'
							/>
							<WithdrawTokenFromIdentity
								variant='contained'
								color='primary'
								onSave={this.onSave}
								identityAvailable={identityBalanceDai}
								token='DAI'
								className={classes.actionBtn}
								size='small'
							/>
						</div>
					</ListItem>
					<ListDivider />
				</List>
			</div>
		)
	}
}

AccountInfo.propTypes = {
	actions: PropTypes.object.isRequired,
	account: PropTypes.object.isRequired
}

function mapStateToProps(state, props) {
	const { persist, memory } = state
	const { account } = persist

	return {
		account: account,
		side: memory.nav.side,
	}
}

function mapDispatchToProps(dispatch) {
	return {
		actions: bindActionCreators(actions, dispatch)
	}
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(withStyles(styles)(Translate(AccountInfo)))
