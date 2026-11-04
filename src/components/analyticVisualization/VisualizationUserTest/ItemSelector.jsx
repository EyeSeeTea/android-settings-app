import { useDataEngine } from '@dhis2/app-runtime'
import { Popover, FlyoutMenu } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { createRef, useEffect, useState } from 'react'
import useDebounce from '../../../utils/useDebounce'
import ContentMenuGroup from './ContentMenuGroup.jsx'
import ItemSearchField from './ItemSearchField.jsx'
import styles from './styles/ItemSelector.module.css'
import { getUserQuery } from './userQuery'

const ItemSelector = ({ selection }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [filter, setFilter] = useState('')
    const [items, setItems] = useState(null)
    const [error, setError] = useState(false)
    const [disableField, setDisableField] = useState(false)
    const dataEngine = useDataEngine()
    const debouncedFilterText = useDebounce(filter, 350)

    useEffect(() => {
        const controller = new AbortController()
        const query = getUserQuery(debouncedFilterText)
        dataEngine
            .query({ items: query }, { signal: controller.signal })
            .then((res) => {
                if (!controller.signal.aborted) {
                    setItems(res.items.users)
                    setError(false)
                }
            })
            .catch(() => {
                if (!controller.signal.aborted) {
                    setError(true)
                }
            })
        return () => controller.abort()
    }, [debouncedFilterText])

    const closeMenu = () => {
        setIsOpen(false)
        setFilter('')
        selection('')
    }

    const openMenu = () => setIsOpen(true)

    const addItem = (item) => () => {
        setDisableField(true)
        closeMenu()
        setFilter(item.name)
        selection(item)
    }

    const clearField = () => {
        closeMenu()
        setDisableField(false)
    }

    const getMenus = () => {
        const displayItems = items?.slice(0, 5)
        return (
            <ContentMenuGroup
                items={displayItems}
                loading={items === null}
                error={error}
                addItem={addItem}
            />
        )
    }

    const updateFilter = ({ value }) => setFilter(value)

    const inputRef = createRef()

    return (
        <>
            <span ref={inputRef}>
                <ItemSearchField
                    value={filter}
                    onChange={updateFilter}
                    onFocus={openMenu}
                    onClear={clearField}
                    disabled={disableField}
                />
            </span>
            {isOpen && (
                <Popover
                    reference={inputRef}
                    placement="bottom-start"
                    onClickOutside={closeMenu}
                    arrow={false}
                    maxWidth={300}
                >
                    <div className={styles.popover}>
                        <FlyoutMenu
                            className={styles.menu}
                            dataTest="item-menu"
                            maxWidth="300px"
                            maxHeight="120px"
                        >
                            {getMenus()}
                        </FlyoutMenu>
                    </div>
                </Popover>
            )}
        </>
    )
}

ItemSelector.propTypes = {
    selection: PropTypes.func,
}

export default ItemSelector
