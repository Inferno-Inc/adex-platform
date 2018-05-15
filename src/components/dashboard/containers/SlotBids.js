
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import theme from './theme.css'
import RTButtonTheme from 'styles/RTButton.css'
import ItemsList from './ItemsList'
import Rows from 'components/dashboard/collection/Rows'
import { Tab, Tabs } from 'react-toolbox'
import { Grid, Row, Col } from 'react-flexbox-grid'
import BidsStatsGenerator from 'helpers/dev/bidsStatsGenerator'
import { BidsStatusBars, BidsStatusPie, SlotsClicksAndRevenue, BidsTimeStatistics } from 'components/dashboard/charts/slot'
import Translate from 'components/translate/Translate'
import { getSlotBids, getAvailableBids } from 'services/adex-node/actions'
import { items as ItemsConstants, exchange as ExchangeConstants } from 'adex-constants'
import { AcceptBid, GiveupBid, VerifyBid } from 'components/dashboard/forms/web3/transactions'
import classnames from 'classnames'
import { SORT_PROPERTIES_BIDS, FILTER_PROPERTIES_BIDS, FILTER_PROPERTIES_BIDS_NO_STATE } from 'constants/misc'
import { getCommonBidData, renderCommonTableRow, renderTableHead, searchMatch, getPublisherBidData, getBidData } from './BidsCommon'
import { getAddrBids, sortBids } from 'services/store-data/bids'
import { getBidEvents } from 'services/adex-node/actions'
import { IconButton } from 'react-toolbox/lib/button'
import BidsStatistics from './BidsStatistics'

const { BID_STATES, BidStatesLabels } = ExchangeConstants

// const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#EBE', '#FAC']

export class SlotBids extends Component {

    constructor(props) {
        super(props)
        this.state = {
            tabIndex: 3,
            bids: [],
            openBids: [],
            statsBids: []
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        // TODO:
        return (JSON.stringify(this.props) !== JSON.stringify(nextProps)) || (JSON.stringify(this.state) !== JSON.stringify(nextState))
    }

    // TODO: map bid and set amount to number or make something to parse the amount in the items list sort function
    getBids = () => {
        if (this.props.getSlotBids) {
            getSlotBids({
                authSig: this.props.account._authSig,
                adSlot: this.props.item._ipfs
            })
                .then((bids) => {
                    // console.log('unit bids', bids)
                    this.setState({ bids: bids })
                })

            getAvailableBids({
                authSig: this.props.account._authSig,
                sizeAndType: this.props.item.sizeAndType
            })
                .then((bids) => {
                    // console.log('unit openBids', bids)
                    this.setState({ openBids: bids })
                })
        } else {
            getAddrBids({ authSig: this.props.account._authSig })
        }
    }

    componentWillMount() {
        this.getBids()
    }

    handleTabChange = (index) => {
        this.setState({ tabIndex: index })
    }

    // TODO: make something common with unit bids 
    renderTableRow(bid, index, { to, selected }) {
        let t = this.props.t
        const bidData = getBidData({
            bid: bid,
            t: t,
            transactions: this.props.transactions,
            side: this.props.side,
            item: this.props.item,
            account: this.props.account,
            onSave: this.getBids
        })

        return renderCommonTableRow({ bidData, t })
    }

    renderRows = (items) =>
        <Rows
            multiSelectable={false}
            selectable={false}
            side={this.props.side}
            item={items}
            rows={items}
            rowRenderer={this.renderTableRow.bind(this)}
            tableHeadRenderer={renderTableHead.bind(this, { t: this.props.t, side: this.props.side })}
        />

    render() {
        let openBids = this.state.openBids || []
        let t = this.props.t
        let sorted = []

        if (this.props.getSlotBids) {
            sorted = sortBids(this.state.bids || [])
        } else {
            sorted = this.props.pubBids
        }

        return (
            <div>
                {this.props.getSlotBids ? null :
                    <div className={classnames(theme.heading, theme.Transactions)}>
                        <h2 > {t('ALL_BIDS')} </h2>
                    </div>
                }
                <Tabs
                    theme={theme}
                    index={this.state.tabIndex}
                    onChange={this.handleTabChange}
                >
                    {this.props.getSlotBids ?
                        <Tab label={t('OPEN_BIDS')}>
                            <div>
                                <ItemsList
                                    items={openBids}
                                    listMode='rows'
                                    renderRows={this.renderRows}
                                    sortProperties={SORT_PROPERTIES_BIDS}
                                    searchMatch={this.searchMatch}
                                    filterProperties={FILTER_PROPERTIES_BIDS_NO_STATE}
                                />
                            </div>
                        </Tab>
                        : null}
                    <Tab label={t('BIDS_READY_TO_VERIFY')}>
                        <ItemsList
                            items={sorted.action}
                            listMode='rows'
                            renderRows={this.renderRows.bind(this)}
                            sortProperties={SORT_PROPERTIES_BIDS}
                            searchMatch={searchMatch}
                            filterProperties={FILTER_PROPERTIES_BIDS}
                        />
                    </Tab>
                    <Tab label={t('BIDS_ACTIVE')}>
                        <ItemsList
                            items={sorted.active}
                            listMode='rows'
                            renderRows={this.renderRows.bind(this)}
                            sortProperties={SORT_PROPERTIES_BIDS}
                            searchMatch={searchMatch}
                            filterProperties={FILTER_PROPERTIES_BIDS}
                        />
                    </Tab>
                    <Tab label={t('BIDS_CLOSED')}>
                        <ItemsList
                            items={sorted.closed}
                            listMode='rows'
                            renderRows={this.renderRows.bind(this)}
                            sortProperties={SORT_PROPERTIES_BIDS}
                            searchMatch={this.searchMatch}
                            filterProperties={FILTER_PROPERTIES_BIDS}
                        />
                    </Tab>
                    <Tab label={t('STATISTICS')}>
                        <BidsStatistics bids={sorted.action.concat(sorted.active, sorted.closed)} />
                    </Tab>
                </Tabs>
            </div>
        )
    }
}

SlotBids.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    item: PropTypes.object
}

function mapStateToProps(state, props) {
    const persist = state.persist
    const memory = state.memory
    return {
        account: persist.account,
        bids: persist.bids.bidsById,
        transactions: persist.web3Transactions[persist.account._addr] || {},
        pubBids: persist.bids.pubBids,
        side: memory.nav.side
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
)(Translate(SlotBids))
