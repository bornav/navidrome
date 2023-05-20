import React, { useCallback } from 'react'
import { useGetOne } from 'react-admin'
import { GlobalHotKeys } from 'react-hotkeys'
import { LoveButton, useToggleLove } from '../common'
import { UpdateQueueButton } from '../common/UpdateQueueButton'
import { keyMap } from '../hotkeys'
import config from '../config'

const Placeholder = () => (
  <>
    {config.enableFavourites && (
      <LoveButton disabled={true} resource={'song'} />
    )}
    <UpdateQueueButton label={'queue'} />
  </>
)

const Toolbar = ({ id }) => {
  const { data, loading } = useGetOne('song', id)
  const [toggleLove, toggling] = useToggleLove('song', data)

  const handlers = {
    TOGGLE_LOVE: useCallback(() => toggleLove(), [toggleLove]),
  }

  return (
    <>
      <GlobalHotKeys keyMap={keyMap} handlers={handlers} allowChanges />
      {config.enableFavourites && (
        <LoveButton
          record={data}
          resource={'song'}
          disabled={loading || toggling}
        />
      )}
      <UpdateQueueButton label="queue" />
    </>
  )
}

const PlayerToolbar = ({ id, isRadio }) =>
  id && !isRadio ? <Toolbar id={id} /> : <Placeholder />

export default PlayerToolbar
