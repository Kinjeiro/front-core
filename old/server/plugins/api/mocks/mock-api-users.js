import { API_CONFIGS } from '../../../../../src/common/api/api-users';

import { createMockRoute } from '../../../../../src/server/utils/mock-utils';
import { downloadFile } from '../../../../../src/server/utils/hapi-utils';
import { getToken } from '../../../../../src/server/utils/auth-utils';

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
    const avatar = getUserAvatar(username);
    return downloadFile(reply, avatar);
  }),
];
