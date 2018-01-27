import { ItemsTypes } from 'constants/itemsTypes'
import { Bid, AdUnit, AdSlot, Campaign, Channel} from 'adex-models'

let initialState = {
    account: {
        account: this.account,
    },
    signin: {
        name: '',
        email: '',
        password: '',
        passConfirm: '',
        seed: '',
        publicKey: '',
        seedCheck: [],
        authenticated: false
    },
    newItem: {
        [ItemsTypes.Campaign.id]: new Campaign().plainObj(),
        [ItemsTypes.AdUnit.id]: new AdUnit().plainObj(),
        [ItemsTypes.AdSlot.id]: new AdSlot().plainObj(),
        [ItemsTypes.Channel.id]: new Channel().plainObj(),
    },
    currentItem: {},
    items: {
        [ItemsTypes.Campaign.id]: {},
        [ItemsTypes.AdUnit.id]: {},
        [ItemsTypes.Channel.id]: {},
        [ItemsTypes.AdSlot.id]: {}
    },
    spinners: {},
    ui: {},
    toasts: [],
    confirm: {
        data: {}
    },
    nav: {
        side: ''
    },
    language: 'en-US',
    validations: {},
    bids: {
        bidsById: {},
        bidsIds: [null],
        bidsByAdslot: {},
        bidsByAdunit: {},
        auctionBids: {} //temp
    },
    newBid: {
        empty: new Bid().plainObj()
    },
    newTransactions: {
        default: {}
    }
}

export default initialState
