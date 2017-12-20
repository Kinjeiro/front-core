import onPropsUpdate from './on-props-update';

/**
 * Метод для работы со статусами - см \src\stub\app-redux\helpers\create-status-reducer.js
 * @param statusPropPath
 * @returns {function}
 */
export default function onStatusPropUpdate(statusPropPath) {
  return onPropsUpdate(
    `${statusPropPath}.isFetching`,
    {
      afterCustomFilter(currentFunction, newProps, otherData) {
        const oldStatus = otherData.oldProps[statusPropPath];
        const newStatus = newProps[statusPropPath];
        let result;

        if (oldStatus && oldStatus.isFetching && !newStatus.isFetching && !newStatus.isError) {
          // важно передать правильный контекст через this
          result = currentFunction.call(this, newProps, otherData);
        }
        return result;
      },
    },
  );
}
