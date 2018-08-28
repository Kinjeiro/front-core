import { API_CONFIGS } from '../../../../common/api/api-users';

import { createMockRoute } from '../../../utils/mock-utils';
import { downloadFile } from '../../../utils/hapi-utils';
import { getToken } from '../../../utils/auth-utils';

import {
  editUser,
  deleteUser,
  getUserAvatar,
} from './users';

export default [
  createMockRoute(API_CONFIGS.editUser, (requestData, request, reply) => {
    return editUser(getToken(request), requestData);
  }),
  createMockRoute(API_CONFIGS.deleteUser, (requestData, request, reply) => {
    return deleteUser(getToken(request));
  }),
  createMockRoute(API_CONFIGS.avatar, (requestData, request, reply) => {
    const { username } = request.params;
    return downloadFile(reply, getUserAvatar(username));
  }),
];
