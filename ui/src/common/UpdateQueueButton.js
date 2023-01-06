import React, { useCallback } from 'react'
import PropTypes from 'prop-types'
import CloudDownloadOutlinedIcon from '@material-ui/icons/CloudDownloadOutlined'
import { IconButton } from '@material-ui/core'
import { useDispatch } from 'react-redux'
import { playTracks, playTracksByTimestamp } from '../actions'
import { GetSongId } from '../audioplayer/Player'
import { httpClient } from '../dataProvider'
import subsonic from '../subsonic'

const UpdateQueueButton = ({ record, size, className }) => {
  const dispatch = useDispatch()

  //this one is used when we use the album list to play the songs(does not support duplicate songs)
  const queueBuilderId = (data, object) => {
    let songObj = {}
    for (let i = 0; i < data.length; i++) {
      songObj[data[i].id] =
        object.json[
          object.json.findIndex((index) => {
            return index.id === data[i].id
          })
        ]
    }
    return songObj
  }

  //supports duplicate songs
  const queueBuilderInc = (data, object) => {
    let songObj = {}
    for (let i = 0; i < data.length; i++) {
      songObj[i] =
        object.json[
          object.json.findIndex((index) => {
            return index.id === data[i].id
          })
        ]
    }
    return songObj
  }

  const updateQueueButton = useCallback(() => {
    //gets the data of the currently playing songs and formats the data
    const getSongData = async (data, state) => {
      let idString = `/api/song?id=${data[0].id}`
      for (let i = 1; i < data.length; i++) {
        idString = `${idString}&id=${data[i].id}`
      }
      const object = await httpClient(idString)
      return state === false
        ? queueBuilderInc(data, object)
        : queueBuilderId(data, object)
    }
    if (localStorage.getItem('sync') === 'false') {
      return
    }
    subsonic
      .getStoredQueue()
      .then((res) => {
        let data = JSON.parse(res.body)
        getSongData(
          data['subsonic-response'].playQueue.entry,
          data['subsonic-response'].playQueue.current.length > 4 ? true : false
        )
          .then((res) => {
            let res_new = {}
            let data_ids
            let current
            let timestamp
            timestamp = data['subsonic-response'].playQueue.position
            if (data['subsonic-response'].playQueue.current.length > 4) {
              data_ids = GetSongId(data['subsonic-response'].playQueue.entry)
              res_new = res
              current = res[data['subsonic-response'].playQueue.current].id
            } else {
              let size = data['subsonic-response'].playQueue.entry.length
              //dealing with the pass by reference
              for (let i = 0; i < size; i++) {
                let temp = Object.assign({}, res[i])
                temp.mediaFileId = res[i].id
                temp.id = `${i + 1}`
                res_new[i + 1] = temp
              }

              data_ids = Array.from({ length: size }, (v, i) => `${++i}`)
              current = data['subsonic-response'].playQueue.current
            }
            timestamp === undefined
              ? dispatch(playTracks(res_new, data_ids, current))
              : dispatch(
                  playTracksByTimestamp(res_new, data_ids, current, timestamp)
                )
          })
          .catch((err) => {
            console.log(err)
          })
      })
      .catch((err) => {
        console.log(err)
      })
  }, [dispatch])

  return (
    <IconButton
      onClick={(e) => {
        updateQueueButton()
      }}
      aria-label="Get updated Queue"
      size={size}
    >
      <CloudDownloadOutlinedIcon fontSize={size} />
    </IconButton>
  )
}
UpdateQueueButton.propTypes = {
  size: PropTypes.string,
}

UpdateQueueButton.defaultProps = {
  label: 'Get updated Queue',
  size: 'small',
}

export { UpdateQueueButton }
