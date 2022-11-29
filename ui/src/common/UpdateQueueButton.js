import React, { useCallback } from 'react'
import PropTypes from 'prop-types'
import CloudDownloadOutlinedIcon from '@material-ui/icons/CloudDownloadOutlined'
import { IconButton } from '@material-ui/core'
import { useDispatch } from 'react-redux'
import { playTracks, clearQueue, currentPlaying } from '../actions'
import { GetSongId } from '../audioplayer/Player'
import { httpClient } from '../dataProvider'
import subsonic from '../subsonic'

const UpdateQueueButton = ({ record, size, className }) => {
  const dispatch = useDispatch()
  const getSongData = async (data) => {
    let idString = `/api/song?id=${data[0].id}`
    for (var i = 1; i < data.length; i++) {
      idString = `${idString}&id=${data[i].id}`
    }
    const object = await httpClient(idString)
    let songObj = {}
    for (i = 0; i < data.length; i++) {
      //placeholder to be added when the detection of the queurest is implemented
      // uncommenting this makes the request the same as when using the ui to set the playlist
      // let obj = object.json[object.json.findIndex(index => {return  index.id === data[i].id;})]
      // obj.comment = ""
      // songObj[data[i].id] = obj
      // songObj[data[i].id] = object.json[object.json.findIndex(index => {return  index.id === data[i].id;})]
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
    if (localStorage.getItem('sync') === 'false') {
      return
    }
    subsonic
      .getStoredQueue()
      .then((res) => {
        let data = JSON.parse(res.body)
        getSongData(data['subsonic-response'].playQueue.entry)
          .then((res) => {
            const res_new = {}
            let size = data['subsonic-response'].playQueue.entry.length
            for (let i = 0; i < size; i++) {
              //this will be remove, just a brute force solution to test the concept
              res_new[i + 1] = res[i]
              res_new[i + 1].mediaFileId = res[i].id
              res_new[i + 1].id = `${i + 1}`
            }
            let data_ids = Array.from({ length: size }, (v, i) => `${++i}`)
            //let data_ids = GetSongId(data['subsonic-response'].playQueue.entry)
            dispatch(
              playTracks(
                res_new,
                data_ids,
                data['subsonic-response'].playQueue.current
              )
            ) // why is it not setting the track to the desired one?, but always to the first one, even tho the return values are the same
            //before moving this this was located inside of the Player object and it had access to the audioInstance so as a fixup to above manulay set the playqueue
            // audioInstance.playByIndex(
            //   data_ids.indexOf(data['subsonic-response'].playQueue.current)
            // )
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
