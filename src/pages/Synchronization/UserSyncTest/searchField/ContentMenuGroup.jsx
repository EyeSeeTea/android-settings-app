import i18n from '@dhis2/d2-i18n'
import isEmpty from 'lodash/isEmpty'
import PropTypes from 'prop-types'
import React from 'react'
import ContentMenuItem from './ContentMenuItem.jsx'

const ContentMenuGroup = ({ items, loading, error, addItem }) => {
    if (error) {
        return (
            <ContentMenuItem
                name={i18n.t('Error loading users')}
                valid={false}
            />
        )
    }

    if (loading) {
        return (
            <ContentMenuItem name={i18n.t('Loading users...')} valid={false} />
        )
    }

    if (isEmpty(items)) {
        return <ContentMenuItem name={i18n.t('No user found')} valid={false} />
    }

    return items.map((item) => (
        <ContentMenuItem
            key={item.id || item.key}
            onInsert={addItem(item)}
            name={item.name || item.displayName}
            valid={true}
        />
    ))
}

ContentMenuGroup.propTypes = {
    addItem: PropTypes.func,
    error: PropTypes.bool,
    items: PropTypes.array,
    loading: PropTypes.bool,
}

export default ContentMenuGroup
