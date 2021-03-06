import _ from 'lodash'
import pluralize from 'pluralize'

import { Preview, PreviewProvider, Previews, UnresolvedPreview } from 'libs/PreviewProvider'
import Twitch from 'libs/Twitch'
import base from 'styled/base'

/**
 * Preview types.
 */
export enum TwitchPreviewType {
  Clip,
  Video,
}

/**
 * RegExp used to identify a clip link.
 */
const ClipRegExp = /https:\/\/clips\.twitch\.tv\/(\w+)/g

/**
 * RegExp used to identify a video link.
 */
const VideoRegExp = /https:\/\/(?:www\.)?twitch\.tv\/videos\/(\d+)/g

/**
 * Twitch preview provider.
 */
const PreviewTwitch: PreviewProvider = class {
  /**
   * Returns the preview provider id.
   * @return The provider id.
   */
  public static getProviderId() {
    return 'previewTwitch'
  }

  /**
   * Parses a message for potential previews.
   * @param  message - The message to parse.
   * @return The previews.
   */
  public static parse(message: string) {
    const previews: Previews = {}

    let match

    while ((match = ClipRegExp.exec(message)) != null) {
      previews[match[1]] = {
        id: match[1],
        provider: PreviewTwitch.getProviderId(),
        resolved: false,
        type: TwitchPreviewType.Clip,
      }
    }

    while ((match = VideoRegExp.exec(message)) != null) {
      previews[match[1]] = {
        id: match[1],
        provider: PreviewTwitch.getProviderId(),
        resolved: false,
        type: TwitchPreviewType.Video,
      }
    }

    return previews
  }

  /**
   * Resolves a preview.
   * @param  preview - The preview to resolve.
   * @return The resolved preview.
   */
  public static async resolve(preview: UnresolvedPreview): Promise<Preview> {
    if (_.isNil(preview.type)) {
      throw new Error('Missing preview type.')
    }

    if (preview.type === TwitchPreviewType.Clip) {
      const clip = await Twitch.fetchClip(preview.id)

      const meta = `Clipped by ${clip.creator_name} on ${
        clip.broadcaster_name
      } (${clip.view_count.toLocaleString()} ${pluralize('view', clip.view_count)})`

      return {
        ...preview,
        image: clip.thumbnail_url,
        meta,
        resolved: true,
        title: clip.title,
        url: clip.url,
      }
    } else if (preview.type === TwitchPreviewType.Video) {
      const video = await Twitch.fetchVideo(preview.id)

      const meta = `Recorded by ${video.user_name} on ${new Date(
        video.created_at
      ).toLocaleDateString()} (${video.view_count.toLocaleString()} ${pluralize('view', video.view_count)})`

      return {
        ...preview,
        image: Twitch.getTwitchTemplatedUrl(video.thumbnail_url, {
          width: base.previews.thumbnail.width.toString(),
          height: base.previews.thumbnail.height.toString(),
        }),
        meta,
        resolved: true,
        title: video.title,
        url: video.url,
      }
    }

    throw new Error('Invalid preview type.')
  }
}

export default PreviewTwitch
