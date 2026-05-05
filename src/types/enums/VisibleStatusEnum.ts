export const VisibleStatus = {
  PRIVATE: 'PRIVATE',
  PUBLIC: 'PUBLIC',
  FOLLOWERS_ONLY: 'FOLLOWERS_ONLY'
} as const;

export type VisibleStatus = typeof VisibleStatus[keyof typeof VisibleStatus];

export const VisibleStatusLabel: Record<VisibleStatus, string> = {
  [VisibleStatus.PRIVATE]: '私有',
  [VisibleStatus.PUBLIC]: '公开',
  [VisibleStatus.FOLLOWERS_ONLY]: '仅粉丝可见'
};
