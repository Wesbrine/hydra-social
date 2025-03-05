// @ts-check

import { getLocale } from '../locales';
import { connectStream } from '../stream';

import {
  fetchAnnouncements,
  updateAnnouncements,
  updateReaction as updateAnnouncementsReaction,
  deleteAnnouncement,
} from './announcements';
import { updateConversations } from './conversations';
import { processNewNotificationForGroups, refreshStaleNotificationGroups, pollRecentNotifications as pollRecentGroupNotifications } from './notification_groups';
import { updateNotifications } from './notifications';
import { updateStatus } from './statuses';
import {
  updateTimeline,
  deleteFromTimelines,
  expandHomeTimeline,
  connectTimeline,
  disconnectTimeline,
  fillHomeTimelineGaps,
  fillPublicTimelineGaps,
  fillCommunityTimelineGaps,
  fillListTimelineGaps,
} from './timelines';

/**
 * @param {number} max
 * @returns {number}
 */
const randomUpTo = max =>
  Math.floor(Math.random() * Math.floor(max));

/**
 * @param {string} timelineId
 * @param {string} channelName
 * @param {Object.<string, string>} params
 * @param {Object} options
 * @param {function(Function, Function): Promise<void>} [options.fallback]
 * @param {function(): void} [options.fillGaps]
 * @param {function(import("mastodon/api_types/statuses").ApiStatusJSON): boolean} [options.accept]
 */
export const connectTimelineStream = (timelineId, channelName, params = {}, options = {}) => {
  const { messages } = getLocale();

  return connectStream(channelName, params, (dispatch, getState) => {
    const locale = getState().getIn(['meta', 'locale']);

    // @ts-expect-error
    let pollingId;

    /**
     * @param {function(Function, Function): Promise<void>} fallback
     */

    const useFallback = async fallback => {
      await fallback(dispatch, getState);
      // eslint-disable-next-line react-hooks/rules-of-hooks -- this is not a react hook
      pollingId = setTimeout(() => useFallback(fallback), 20000 + randomUpTo(20000));
    };

    return {
      onConnect() {
        dispatch(connectTimeline(timelineId));

        // @ts-expect-error
        if (pollingId) {
          // @ts-ignore
          clearTimeout(pollingId); pollingId = null;
        }

        if (options.fillGaps) {
          dispatch(options.fillGaps());
        }
      },

      onDisconnect() {
        dispatch(disconnectTimeline({ timeline: timelineId }));

        if (options.fallback) {
          // @ts-expect-error
          pollingId = setTimeout(() => useFallback(options.fallback), randomUpTo(40000));
        }
      },

      onReceive(data) {
        switch (data.event) {
        case 'update':
          // @ts-expect-error
          dispatch(updateTimeline(timelineId, JSON.parse(data.payload), options.accept));
          break;
        case 'status.update':
          // @ts-expect-error
          dispatch(updateStatus(JSON.parse(data.payload)));
          break;
        case 'delete':
          dispatch(deleteFromTimelines(data.payload));
          break;
        case 'notification': {
          // @ts-expect-error
          const notificationJSON = JSON.parse(data.payload);
          dispatch(updateNotifications(notificationJSON, messages, locale));
          // TODO: remove this once the groups feature replaces the previous one
          dispatch(processNewNotificationForGroups(notificationJSON));
          break;
        }
        case 'notifications_merged': {
          dispatch(refreshStaleNotificationGroups());
          break;
        }
        case 'conversation':
          // @ts-expect-error
          dispatch(updateConversations(JSON.parse(data.payload)));
          break;
        case 'announcement':
          // @ts-expect-error
          dispatch(updateAnnouncements(JSON.parse(data.payload)));
          break;
        case 'announcement.reaction':
          // @ts-expect-error
          dispatch(updateAnnouncementsReaction(JSON.parse(data.payload)));
          break;
        case 'announcement.delete':
          dispatch(deleteAnnouncement(data.payload));
          break;
        }
      },
    };
  });
};

/**
 * @param {Function} dispatch
 */
async function refreshHomeTimelineAndNotification(dispatch) {
  await dispatch(expandHomeTimeline({ maxId: undefined }));

  // TODO: polling for merged notifications
  try {
    await dispatch(pollRecentGroupNotifications());
  } catch {
    // TODO
  }

  await dispatch(fetchAnnouncements());
}

export const connectUserStream = () =>
  connectTimelineStream('home', 'user', {}, { fallback: refreshHomeTimelineAndNotification, fillGaps: fillHomeTimelineGaps });

/**
 * @param {Object} options
 * @param {boolean} [options.onlyMedia]
 */
export const connectCommunityStream = ({ onlyMedia } = {}) =>
  connectTimelineStream(`community${onlyMedia ? ':media' : ''}`, `public:local${onlyMedia ? ':media' : ''}`, {}, { fillGaps: () => (fillCommunityTimelineGaps({ onlyMedia })) });

/**
 * @param {Object} options
 * @param {boolean} [options.onlyMedia]
 * @param {boolean} [options.onlyRemote]
 */
export const connectPublicStream = ({ onlyMedia, onlyRemote } = {}) =>
  connectTimelineStream(`public${onlyRemote ? ':remote' : ''}${onlyMedia ? ':media' : ''}`, `public${onlyRemote ? ':remote' : ''}${onlyMedia ? ':media' : ''}`, {}, { fillGaps: () => fillPublicTimelineGaps({ onlyMedia, onlyRemote }) });

/**
 * @param {string} columnId
 * @param {string} tagName
 * @param {boolean} onlyLocal
 * @param {function(object): boolean} accept
 */
export const connectHashtagStream = (columnId, tagName, onlyLocal, accept) =>
  connectTimelineStream(`hashtag:${columnId}${onlyLocal ? ':local' : ''}`, `hashtag${onlyLocal ? ':local' : ''}`, { tag: tagName }, { accept });

export const connectDirectStream = () =>
  connectTimelineStream('direct', 'direct');

/**
 * @param {string} listId
 */
export const connectListStream = listId =>
  connectTimelineStream(`list:${listId}`, 'list', { list: listId }, { fillGaps: () => fillListTimelineGaps(listId) });

/**
 * @param {string} accountId
 * @param {Object} options
 * @param {boolean} [options.withReplies]
 * @param {string} [options.tagged]
 * @param {boolean} [options.onlyMedia]
 */
export const connectProfileStream = (accountId, { withReplies, tagged, onlyMedia }) =>
  connectTimelineStream(`account:${accountId}${onlyMedia ? ':media' : ''}${withReplies ? ':with_replies' : ''}${tagged ? `:${tagged}` : ''}`, 'profile', { account_id: accountId }, {
    accept (status) {
      let passThrough = true;

      if (!withReplies) {
        passThrough = passThrough && (status.in_reply_to_id === null || status.in_reply_to_account_id === status.account.id);
      }

      if (tagged) {
        passThrough = passThrough && status.tags.some(tag => tag.name === tagged);
      }

      if (onlyMedia) {
        passThrough = passThrough && status.media_attachments.length > 0;
      }

      return passThrough;
    },
  });
