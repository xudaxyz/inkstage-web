import type { FrontArticleCommentList } from '../types/comment';
import { CommentTopStatus } from '../types/enums';

/**
 * 对评论进行排序处理
 * 1. 分离置顶评论和普通评论
 * 2. 对普通评论按照指定方式排序
 * 3. 重新组合评论，置顶评论放在最前面
 *
 * @param comments 评论列表
 * @param sortBy 排序方式：hot（最热）、new（最新）
 * @returns 排序后的评论列表
 */
export function sortComments (
  comments: FrontArticleCommentList[],
  sortBy: 'hot' | 'new'
): FrontArticleCommentList[] {
  if (!comments || comments.length === 0) {
    return [];
  }

  // 分离置顶评论和普通评论
  const topComments = comments.filter(comment => comment.top === CommentTopStatus.TOP);
  const normalComments = comments.filter(comment => comment.top === CommentTopStatus.NOT_TOP);

  // 对普通评论按照用户选择的排序方式进行排序
  if (sortBy === 'hot') {
    normalComments.sort((a, b) => b.likeCount - a.likeCount);
  } else if (sortBy === 'new') {
    normalComments.sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime());
  }

  // 重新组合评论，置顶评论放在最前面
  return [...topComments, ...normalComments];
}

/**
 * 递归更新评论状态
 *
 * @param comments 评论列表
 * @param commentId 评论ID
 * @param updateFn 更新函数
 * @returns 更新后的评论列表
 */
export function updateCommentStatus (
  comments: FrontArticleCommentList[],
  commentId: number,
  updateFn: (comment: FrontArticleCommentList) => FrontArticleCommentList
): FrontArticleCommentList[] {
  return comments.map(comment => {
    if (comment.id === commentId) {
      return updateFn(comment);
    }
    if (comment.replies && comment.replies.length > 0) {
      return {
        ...comment,
        replies: updateCommentStatus(comment.replies, commentId, updateFn)
      };
    }
    return comment;
  });
}
