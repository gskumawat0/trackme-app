import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, Send, Trash2, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { useActivityLogComments, useAddActivityLogComment, useDeleteActivityLogComment } from '@/hooks/useActivityLogs';
import type { ActivityLogComment, ActivityLog } from '@/types';

interface ActivityLogCommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activityLog: ActivityLog | null;
}

const ActivityLogCommentsModal: React.FC<ActivityLogCommentsModalProps> = ({
  isOpen,
  onClose,
  activityLog
}) => {
  const [newComment, setNewComment] = useState('');

  const {
    data: commentsResponse,
    isLoading: isLoadingComments,
    refetch: refetchComments
  } = useActivityLogComments(activityLog?.id || '');

  const {
    mutate: addComment,
    isPending: isAddingComment
  } = useAddActivityLogComment();

  const {
    mutate: deleteComment,
    isPending: isDeletingComment
  } = useDeleteActivityLogComment();

  const comments = commentsResponse?.data || [];

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !activityLog) {
      toast.error('Please enter a comment');
      return;
    }

    addComment({
      id: activityLog.id,
      data: { comment: newComment.trim() }
    }, {
      onSuccess: () => {
        setNewComment('');
        toast.success('Comment added successfully!');
        refetchComments();
      },
      onError: (error) => {
        toast.error('Failed to add comment');
        console.error('Add comment error:', error);
      }
    });
  };

  const handleDeleteComment = (commentId: string) => {
    if (!activityLog) return;

    deleteComment({
      activityLogId: activityLog.id,
      commentId
    }, {
      onSuccess: () => {
        toast.success('Comment deleted successfully!');
        refetchComments();
      },
      onError: (error) => {
        toast.error('Failed to delete comment');
        console.error('Delete comment error:', error);
      }
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  const handleClose = () => {
    setNewComment('');
    onClose();
  };

  if (!isOpen || !activityLog) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-5 w-5 text-primary" />
            <div>
              <h2 className="text-lg font-semibold">Comments</h2>
              <p className="text-sm text-muted-foreground">
                {activityLog.activity?.title || 'Unknown Activity'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Add Comment Form */}
          <div className="flex gap-2 mb-6">
            <Input
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isAddingComment}
              className="flex-1"
            />
            <Button
              onClick={handleAddComment}
              disabled={isAddingComment || !newComment.trim()}
              size="sm"
            >
              {isAddingComment ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Comments List */}
          {isLoadingComments ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span className="text-muted-foreground">Loading comments...</span>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No comments yet.</p>
              <p className="text-sm text-muted-foreground">Be the first to add one!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment: ActivityLogComment) => (
                <div
                  key={comment.id}
                  className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="text-sm leading-relaxed">{comment.comment}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatDate(comment.createdAt)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteComment(comment.id)}
                    disabled={isDeletingComment}
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                  >
                    {isDeletingComment ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-muted/30">
          <div className="text-sm text-muted-foreground">
            {comments.length} comment{comments.length !== 1 ? 's' : ''}
          </div>
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ActivityLogCommentsModal; 