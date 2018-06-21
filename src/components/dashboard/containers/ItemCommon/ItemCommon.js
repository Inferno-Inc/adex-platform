import React from 'react'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import IconButton from '@material-ui/core/IconButton'
import EditIcon from '@material-ui/icons/Edit'
import Img from 'components/common/img/Img'
import { items as ItemsConstants } from 'adex-constants'
import { Item } from 'adex-models'
import { validUrl } from 'helpers/validators'
import ValidItemHoc from 'components/dashboard/forms/ValidItemHoc'
import Anchor from 'components/common/anchor/anchor'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'

const { AdSizesByValue, AdTypesByValue } = ItemsConstants

const FallbackAdData = ({ item, t, rightComponent, url, classes, ...rest }) => {
    let errFallbackAdUrl = rest.invalidFields['fallbackAdUrl']

    return (
        <div>
            <div
            // className={theme.integrationLabel}
            >
                {t('FALLBACK_DATA')}
            </div>
            <Card
                className={classes.card}
                raised={false}
            >
                <CardMedia
                    classes={{ root: classes.mediaRoot }}
                >
                    <Img
                        className={classes.img}
                        src={Item.getImgUrl(item.fallbackAdImg, process.env.IPFS_GATEWAY) || ''}
                        alt={item.fallbackAdUrl} onClick={rest.toggleFallbackImgEdit}
                        style={{ cursor: 'pointer' }}
                    />
                </CardMedia>
                <CardContent>

                    {rest.activeFields.fallbackAdUrl ?
                        <TextField
                            // required
                            autoFocus
                            type='text'
                            label={t('fallbackAdUrl', { isProp: true })}
                            value={item.fallbackAdUrl || ''}
                            onChange={(ev) => rest.handleChange('fallbackAdUrl', ev.target.value)}
                            // maxLength={1024}
                            onBlur={() => { rest.setActiveFields('fallbackAdUrl', false); rest.validate('fallbackAdUrl', { isValid: !item.fallbackAdUrl || validUrl(item.fallbackAdUrl), err: { msg: 'ERR_INVALID_URL' }, dirty: true }); }}
                            onFocus={() => rest.validate('fallbackAdUrl', { isValid: !item.fallbackAdUrl || validUrl(item.fallbackAdUrl), err: { msg: 'ERR_INVALID_URL' }, dirty: false })}
                            error={errFallbackAdUrl && !!errFallbackAdUrl.dirty ? <span> {errFallbackAdUrl.errMsg} </span> : null}
                            helperText={!errFallbackAdUrl || !errFallbackAdUrl.dirty ?
                                <div>
                                    {t('SLOT_FALLBACK_AD_URL_DESCRIPTION')}
                                </div> : null}
                        />
                        :
                        <div >
                            <div>
                                {item.fallbackAdUrl ?
                                    <Anchor href={item.fallbackAdUrl} target='_blank'>
                                        {item.fallbackAdUrl}
                                    </Anchor>
                                    :
                                    <span style={{ opacity: 0.3 }}> {t('NO_FALLBACK_URL_YET')}</span>
                                }
                                <span>
                                    <IconButton
                                        className={classes.buttonRight}
                                        color='secondary'
                                        onClick={() => rest.setActiveFields('fallbackAdUrl', true)}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                </span>
                            </div>
                            {errFallbackAdUrl && !!errFallbackAdUrl.dirty ?
                                <div>
                                    <span className={classes.error}> {errFallbackAdUrl.errMsg} </span>
                                </div> : null}

                        </div>
                    }

                </CardContent>
            </Card>
        </div >
    )
}

const ValidatedFallbackAdData = ValidItemHoc(FallbackAdData)

const basicProps = ({ item, t, rightComponent, url, classes, ...rest }) => {
    const adSize = (AdSizesByValue[item._meta.size] || {})

    return (
        <div >
            <Grid container spacing={8} style={{ padding: 0 }}>
                <Grid item xs={12} sm={12} md={12} lg={7}>
                    <div >
                        <div
                            className={classes.basicInfo}
                        >
                            <Card
                                className={classes.card}
                                raised={false}
                            >
                                <CardMedia
                                    classes={{ root: classes.mediaRoot }}
                                >
                                    <Img
                                        src={Item.getImgUrl(item.meta.img, process.env.IPFS_GATEWAY) || ''}
                                        alt={item.fullName}
                                        onClick={rest.toggleImgEdit}
                                        style={{ cursor: rest.canEditImg ? 'pointer' : '' }}
                                        className={classes.img}
                                    />
                                </CardMedia>
                                <CardContent>
                                    <Anchor href={url} target='_blank'>
                                        {url}
                                    </Anchor>
                                </CardContent>
                            </Card>

                            <div>
                                <div>
                                    <TextField
                                        // type='text'
                                        value={(AdTypesByValue[item.adType] || {}).label}
                                        label={t('adType', { isProp: true })}
                                        disabled
                                        margin='dense'
                                    />
                                </div>
                                <div>
                                    <TextField
                                        // type='text'
                                        value={t(adSize.label, { args: adSize.labelArgs || [] })}
                                        label={t('size', { isProp: true })}
                                        disabled
                                        margin='dense'
                                    />
                                </div>
                            </div>
                        </div>

                    </div>
                    <br />
                    {item.fallbackAdImg || item.fallbackAdUrl ?
                        <ValidatedFallbackAdData validateId={item._id} item={item} t={t} url={url} classes={classes} {...rest} />
                        : null
                    }
                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={5}>
                    {rightComponent}
                </Grid>
            </Grid>
        </div >
    )
}

export const BasicProps = withStyles(styles)(basicProps)