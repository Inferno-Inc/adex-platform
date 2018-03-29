import React from 'react'
import theme from './theme.css'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
// import moment from 'moment'
// import { Button, IconButton } from 'react-toolbox/lib/button'
import Dropdown from 'react-toolbox/lib/dropdown'
import Translate from 'components/translate/Translate'
import { web3Utils } from 'services/smart-contracts/ADX'
import { getGasData, DEFAULT_DATA } from 'services/eth/gas'

// TODO: Move component to side nav ?
class GasPrice extends React.Component {
    constructor(props, context) {
        super(props, context)

        this.state = {
            gasPrices: this.mapGasPrices(DEFAULT_DATA)
        }
    }

    mapGasPrices = (gasData) => {
        let prices = Object.keys(gasData).map((key) => {
            let pr = gasData[key]
            let inGwei = pr.price
            let inWei = web3Utils.toWei(inGwei.toString(), 'Gwei')

            // TODO: Translations
            return { value: inWei, label: inGwei + ' Gwei - ' + pr.wait + 'min' }
        })

        return prices
    }

    getGasPrices = () => {
        getGasData()
            .then((gasData) => {
                let prices = this.mapGasPrices(gasData)
                this.setState({ gasPrices: prices })
            })
    }

    componentWillMount() {
        this.getGasPrices()
    }

    changeGasPrice = (val) => {
        let settings = { ...this.props.account._settings }
        settings.gasPrice = val
        this.props.actions.updateAccount({ ownProps: { settings: settings } })
    }

    render() {
        let account = this.props.account
        let settings = account._settings
        let gasPrice

        if (settings && settings.gasPrice) {
            gasPrice = settings.gasPrice
        } else {
            gasPrice = this.state.gasPrices[1].value
        }

        console.log(gasPrice)
        return (
            <span>
                <Dropdown
                    theme={theme}
                    auto={false}
                    label='GAS_PRICE_LABEL'
                    onChange={this.changeGasPrice}
                    source={this.state.gasPrices}
                    value={gasPrice}
                />
            </span>
        )
    }
}

GasPrice.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired
}

function mapStateToProps(state, props) {
    let persist = state.persist
    // let memory = state.memory
    let account = persist.account
    return {
        account: account
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
)(Translate(GasPrice))
