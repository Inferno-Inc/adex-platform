import React, { useState, useEffect, Fragment } from 'react'
import SideNav from './SideNav'
import TopBar from './TopBar'
import { Route, Switch } from 'react-router'
import Campaign from 'components/dashboard/containers/Campaign'
import { Receipt } from 'components/dashboard/containers/Receipt'
import {
	PublisherStats,
	AdvertiserStats,
} from 'components/dashboard/containers/DashboardStats'
import Unit from 'components/dashboard/containers/Unit'
import Slot from 'components/dashboard/containers/Slot'
import Websites from 'components/dashboard/containers/Websites'
import Account from 'components/dashboard/account/AccountInfo'
import TopUp from 'components/dashboard/deposit/TopUp'
import {
	NewUnitDialog,
	NewCampaignDialog,
	NewSlotDialog,
} from 'components/dashboard/forms/items/NewItems'
import {
	CampaignsTable,
	AdSlotsTable,
	AdUnitsTable,
} from 'components/dashboard/containers/Tables'
import { Drawer, Box, Hidden, Paper } from '@material-ui/core'
import { Alert } from '@material-ui/lab'
import PageNotFound from 'components/page_not_found/PageNotFound'
import { makeStyles } from '@material-ui/core/styles'
import { Add } from '@material-ui/icons'
import { styles } from './styles'
import Anchor from 'components/common/anchor/anchor'
import {
	execute,
	resolveEnsAddress,
	updatePrivilegesWarningAccepted,
	loadAccountData,
	stopAccountDataUpdate,
	updateNav,
	updateMemoryUi,
} from 'actions'
import {
	t,
	selectAccountIdentityAddr,
	selectWalletPrivileges,
	selectPrivilegesWarningAccepted,
	selectInitialDataLoaded,
} from 'selectors'
import { useSelector } from 'react-redux'
import GettingStarted from '../getting-started/GettingStarted'

const Campaigns = () => {
	const privileges = useSelector(selectWalletPrivileges)
	const disabled = privileges <= 1
	return (
		<Box>
			<NewCampaignDialog
				disabled={disabled}
				fabButton
				variant='extended'
				color='secondary'
				btnLabel='NEW_CAMPAIGN'
				size='medium'
				icon={<Add />}
			/>

			<CampaignsTable />
		</Box>
	)
}

const AdUnits = () => (
	<Box>
		<NewUnitDialog
			fabButton
			variant='extended'
			color='secondary'
			btnLabel='NEW_UNIT'
			size='medium'
			icon={<Add />}
		/>
		<AdUnitsTable />
	</Box>
)

const AdSlots = () => (
	<Box>
		<NewSlotDialog
			fabButton
			variant='extended'
			color='secondary'
			btnLabel='NEW_SLOT'
			size='medium'
			icon={<Add />}
		/>
		<AdSlotsTable />
	</Box>
)

const useStyles = makeStyles(styles)

function Dashboard(props) {
	const [mobileOpen, setMobileOpen] = useState(false)
	const address = useSelector(selectAccountIdentityAddr)
	const privileges = useSelector(selectWalletPrivileges)
	const privilegesWarningAccepted = useSelector(selectPrivilegesWarningAccepted)
	const showTxPrivLevelWarning = privileges <= 1 && !privilegesWarningAccepted

	const { match } = props
	const { side } = match.params
	const classes = useStyles()

	const dataLoaded = useSelector(selectInitialDataLoaded)

	useEffect(() => {
		async function updateInitialData() {
			execute(loadAccountData())
		}

		updateInitialData()

		return () => {
			execute(stopAccountDataUpdate())
		}
	}, [])

	useEffect(() => {
		execute(resolveEnsAddress({ address }))
	}, [address])

	useEffect(() => {
		execute(updateNav('side', side))
	}, [side])

	const handleDrawerToggle = () => {
		setMobileOpen(!mobileOpen)
	}

	const drawer = <SideNav side={side} />

	return (
		<div className={classes.root}>
			<TopBar
				side={side}
				open={mobileOpen}
				handleDrawerToggle={handleDrawerToggle}
			/>
			<Hidden mdUp>
				<Drawer
					variant='temporary'
					anchor='left'
					open={mobileOpen}
					onClose={handleDrawerToggle}
					classes={{
						paper: classes.drawerPaper,
					}}
					ModalProps={{
						keepMounted: true, // Better open performance on mobile.
					}}
				>
					{drawer}
				</Drawer>
			</Hidden>
			<Hidden smDown implementation='css'>
				<Drawer
					variant='permanent'
					open
					classes={{
						paper: classes.drawerPaper,
					}}
				>
					{drawer}
				</Drawer>
			</Hidden>

			<main className={classes.content}>
				<div className={classes.contentInner}>
					<Box>
						{showTxPrivLevelWarning && (
							<Box mb={2}>
								<Alert
									variant='outlined'
									severity='info'
									onClose={() => {
										execute(updatePrivilegesWarningAccepted(true))
									}}
								>
									{t('PRIVILEGES_LEVEL_WARNING_MSG', {
										args: [`PRIV_${privileges}_LABEL`],
									})}
								</Alert>
							</Box>
						)}

						{dataLoaded && <GettingStarted side={side} />}
						<Switch>
							<Route
								exact
								path='/dashboard/advertiser/campaigns'
								component={Campaigns}
							/>
							<Route
								exact
								path='/dashboard/advertiser/units'
								component={AdUnits}
							/>
							<Route
								exact
								path='/dashboard/advertiser/campaigns/:itemId'
								component={Campaign}
							/>
							<Route
								exact
								path='/dashboard/advertiser/receipts'
								component={Receipt}
							/>
							<Route
								exact
								path='/dashboard/advertiser/receipt/:itemId'
								component={Receipt}
							/>
							<Route
								exact
								path='/dashboard/advertiser/units/:itemId'
								component={Unit}
							/>
							<Route
								exact
								path='/dashboard/publisher/slots'
								component={AdSlots}
							/>
							<Route
								exact
								path='/dashboard/publisher/slots/:itemId'
								component={Slot}
							/>
							<Route
								exact
								path='/dashboard/publisher/websites'
								component={Websites}
							/>
							<Route
								exact
								path='/dashboard/publisher/receipts'
								component={Receipt}
							/>
							<Route
								exact
								path={'/dashboard/:side/account'}
								component={Account}
							/>
							<Route exact path={'/dashboard/:side/topup'} component={TopUp} />
							{/* <Route
								auth={this.props.auth}
								exact
								path={'/dashboard/:side/transactions'}
								component={props => <Transactions {...props} />}
							/> */}
							<Route
								exact
								path='/dashboard/advertiser'
								component={AdvertiserStats}
							/>
							<Route
								exact
								path='/dashboard/publisher'
								component={PublisherStats}
							/>
							<Route component={PageNotFound} />
						</Switch>
					</Box>
				</div>
			</main>
		</div>
	)
}

export default Dashboard
