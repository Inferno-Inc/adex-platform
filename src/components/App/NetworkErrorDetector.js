import React, { useState, useEffect } from 'react'
import {
	Dialog,
	DialogContent,
	DialogTitle,
	List,
	ListItem,
	ListItemText,
	ListItemIcon,
} from '@material-ui/core'

import {
	BlockSharp as AdBlockIcon,
	SignalCellularConnectedNoInternet0BarSharp as NoNetworkIcon,
	ErrorSharp as NoValidatorIcon,
} from '@material-ui/icons'
import { t } from 'selectors'

const { VALIDATOR_LEADER_URL } = process.env

const DetectAdBlock = () => {
	const [problemDetected, setProblemDetected] = useState(false)

	useEffect(() => {
		const testAdBlock = async () => {
			try {
				// Just detect for moonicorn which is currently blocked by the adblockers
				fetch(`${VALIDATOR_LEADER_URL}/channel/list`, {
					method: 'HEAD',
				})
					.then(res => {
						setProblemDetected(false)
					})
					.catch(err => {
						setProblemDetected(true)
					})
			} catch (err) {
				setProblemDetected(true)
			}
		}

		testAdBlock()
	}, [])

	return (
		<Dialog open={problemDetected}>
			<DialogTitle id='adblock-and-network-dialog-title'>
				{t('PROBLEM_DETECTED_TITLE')}
			</DialogTitle>
			<DialogContent>
				<List subheader={t('PROBLEM_DETECTED_SUBHEADER')}>
					<ListItem>
						<ListItemIcon>
							<AdBlockIcon color='error' />
						</ListItemIcon>
						<ListItemText
							primary={t('PR_ADBLOCKER_PRIMARY')}
							secondary={t('PR_ADBLOCKER_SECONDARY')}
						/>
					</ListItem>
					<ListItem>
						<ListItemIcon>
							<NoNetworkIcon color='error' />
						</ListItemIcon>
						<ListItemText
							color='error'
							primary={t('PR_NO_CONNECTION_PRIMARY')}
							secondary={t('PR_NO_CONNECTION_SECONDARY')}
						/>
					</ListItem>

					<ListItem>
						<ListItemIcon>
							<NoValidatorIcon color='error' />
						</ListItemIcon>
						<ListItemText
							primary={t('PR_NO_VALIDATOR_PRIMARY')}
							secondary={t('PR_NO_VALIDATOR_SECONDARY')}
						/>
					</ListItem>
				</List>
			</DialogContent>
		</Dialog>
	)
}

export default DetectAdBlock
