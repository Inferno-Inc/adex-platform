import React, { Component } from 'react'
import PropTypes from 'prop-types'
import NO_IMAGE from 'resources/no-image-box-eddie.jpg'
import CircularProgress from '@material-ui/core/CircularProgress'
import classnames from 'classnames'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'

const MAX_IMG_LOAD_TIME = 3000

class Img extends Component {

    constructor(props) {
        super(props)
        this.state = {
            imgSrc: null
        }

        this.setDisplayImage = this.setDisplayImage.bind(this)
        this.loadTimeout = null
    }

    componentDidMount() {
        this.displayImage = new Image()
        this.setDisplayImage({ image: this.props.src, fallback: this.props.fallbackSrc || NO_IMAGE })
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.src !== this.props.src) {
            this.setDisplayImage({ image: nextProps.src, fallback: nextProps.fallbackSrc || NO_IMAGE })
        }
    }

    componentWillUnmount() {
        this.clearLoadTimeout()
        if (this.displayImage) {
            this.displayImage.onerror = null
            this.displayImage.onload = null
            this.displayImage.onabort = null
            this.displayImage = null
        }
    }

    clearLoadTimeout = () => {
        if (this.loadTimeout) {
            clearTimeout(this.loadTimeout)
            this.loadTimeout = null
        }
    }

    onFail = (fallback) => {
        if (this.displayImage) {
            this.displayImage.onerror = null
            this.displayImage.onload = null
            this.displayImage.onabort = null

            this.clearLoadTimeout()
            this.displayImage.src = fallback
        }

        this.clearLoadTimeout()

        this.setState({
            imgSrc: fallback || null
        })
    }

    setDisplayImage = ({ image, fallback }) => {
        this.loadTimeout = setTimeout(() => {
            this.onFail(fallback)
        }, MAX_IMG_LOAD_TIME)

        this.displayImage.onerror = this.displayImage.onabort = this.onFail.bind(this, fallback)

        this.displayImage.onload = () => {
            this.clearLoadTimeout()
            this.setState({
                imgSrc: image
            })
        }

        this.displayImage.src = image
    }

    render() {
        const { alt, className, classes, ...other } = this.props
        return (
            this.state.imgSrc ?
                <img
                    {...other}
                    alt={alt}
                    src={this.state.imgSrc}
                    draggable='false'
                    className={classnames(classes.imgLoading, className)}
                    onDragStart={(event) => event.preventDefault() /*Firefox*/}
                />
                :
                <span className={classnames(classes.imgLoading, className)}>
                    <span
                        className={classes.circular}
                    >
                        <CircularProgress />
                    </span>
                </span>
        )
    }
}

Img.propTypes = {
    src: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    fallbackSrc: PropTypes.string,
    alt: PropTypes.string
}

export default withStyles(styles)(Img)
