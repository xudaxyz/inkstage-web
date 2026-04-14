/**
 * 通知模板变量枚举
 * 与后端 NotificationTemplateVariable 枚举保持一致
 */

export interface NotificationTemplateVariable {
  key: string;
  description: string;
  category: 'user' | 'article' | 'comment' | 'system' | 'general' | 'notification' | 'report';
}

// 用户相关变量
export const USER_VARIABLES: NotificationTemplateVariable[] = [
  { key: 'userId', description: '用户ID', category: 'user' },
  { key: 'username', description: '用户名', category: 'user' },
  { key: 'userAvatar', description: '用户头像', category: 'user' },
  { key: 'userNickname', description: '用户昵称', category: 'user' }
];

// 文章相关变量
export const ARTICLE_VARIABLES: NotificationTemplateVariable[] = [
  { key: 'articleId', description: '文章ID', category: 'article' },
  { key: 'articleTitle', description: '文章标题', category: 'article' },
  { key: 'articleContent', description: '文章内容', category: 'article' },
  { key: 'articleAuthor', description: '文章作者', category: 'article' },
  { key: 'articleUrl', description: '文章链接', category: 'article' }
];

// 评论相关变量
export const COMMENT_VARIABLES: NotificationTemplateVariable[] = [
  { key: 'commentId', description: '评论ID', category: 'comment' },
  { key: 'commentContent', description: '评论内容', category: 'comment' },
  { key: 'commentAuthor', description: '评论作者', category: 'comment' }
];

// 举报相关变量
export const REPORT_VARIABLES: NotificationTemplateVariable[] = [
  { key: 'reportedContent', description: '举报内容', category: 'report' },
  { key: 'relatedId', description: '关联链接', category: 'report' },
  { key: 'handleResult', description: '处理结果', category: 'report' },
  { key: 'reason', description: '处理说明', category: 'report' }
];

// 系统相关变量
export const SYSTEM_VARIABLES: NotificationTemplateVariable[] = [
  { key: 'systemTime', description: '系统时间', category: 'system' },
  { key: 'systemName', description: '系统名称', category: 'system' },
  { key: 'systemVersion', description: '系统版本', category: 'system' }
];

// 通用变量
export const GENERAL_VARIABLES: NotificationTemplateVariable[] = [
  { key: 'relatedId', description: '关联ID', category: 'general' },
  { key: 'actionUrl', description: '操作链接', category: 'general' },
  { key: 'messageContent', description: '消息内容', category: 'general' }
];

// 通知相关变量
export const NOTIFICATION_VARIABLES: NotificationTemplateVariable[] = [
  { key: 'notificationType', description: '通知类型', category: 'notification' },
  { key: 'notificationTime', description: '通知时间', category: 'notification' },
  { key: 'senderId', description: '发送者ID', category: 'notification' },
  { key: 'senderName', description: '发送者名称', category: 'notification' }
];

// 所有变量汇总
export const ALL_TEMPLATE_VARIABLES: NotificationTemplateVariable[] = [
  ...USER_VARIABLES,
  ...ARTICLE_VARIABLES,
  ...COMMENT_VARIABLES,
  ...REPORT_VARIABLES,
  ...SYSTEM_VARIABLES,
  ...GENERAL_VARIABLES,
  ...NOTIFICATION_VARIABLES
];

// 所有变量 key 集合(用于快速查找)
export const ALL_TEMPLATE_VARIABLE_KEYS = new Set(ALL_TEMPLATE_VARIABLES.map((v) => v.key));

// 按分类获取变量
export const getVariablesByCategory = (
  category: NotificationTemplateVariable['category']
): NotificationTemplateVariable[] => {
  return ALL_TEMPLATE_VARIABLES.filter((v) => v.category === category);
};

// 验证变量是否合法
export const isValidVariable = (key: string): boolean => {
  return ALL_TEMPLATE_VARIABLE_KEYS.has(key);
};

// 验证模板字符串中的变量是否都合法
export const validateTemplateVariables = (template: string): { valid: boolean; invalidVars: string[] } => {
  const regex = /\{\{(\w+)}}|\$\{(\w+)}/g;
  const invalidVars: string[] = [];
  let match;

  while ((match = regex.exec(template)) !== null) {
    const varName = match[1] || match[2];
    if (!isValidVariable(varName)) {
      invalidVars.push(varName);
    }
  }

  return {
    valid: invalidVars.length === 0,
    invalidVars
  };
};

// 提取模板中的所有变量
export const extractTemplateVariables = (template: string): string[] => {
  const regex = /\{\{(\w+)}}|\$\{(\w+)}/g;
  const vars: string[] = [];
  let match;

  while ((match = regex.exec(template)) !== null) {
    const varName = match[1] || match[2];
    if (!vars.includes(varName)) {
      vars.push(varName);
    }
  }

  return vars;
};
