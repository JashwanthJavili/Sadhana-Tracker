import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Question, Answer } from '../types/questions';
import {
  getQuestionById,
  getAnswersForQuestion,
  upvoteQuestion,
  upvoteAnswer,
  createAnswer,
  acceptAnswer,
  addReply,
  incrementViewCount,
} from '../services/questions';
import {
  ArrowLeft,
  ThumbsUp,
  MessageCircle,
  Eye,
  Send,
  CheckCircle2,
  Reply,
  Clock,
} from 'lucide-react';

const QuestionDetailPage: React.FC = () => {
  const { questionId } = useParams<{ questionId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [newAnswer, setNewAnswer] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!questionId) return;

    const loadQuestion = async () => {
      const q = await getQuestionById(questionId);
      setQuestion(q);
      setLoading(false);

      if (q) {
        await incrementViewCount(questionId);
      }
    };

    const unsubscribe = getAnswersForQuestion(questionId, setAnswers);

    loadQuestion();

    return () => unsubscribe();
  }, [questionId]);

  const handleUpvoteQuestion = async () => {
    if (!user || !questionId) return;
    await upvoteQuestion(questionId, user.uid);
    const updated = await getQuestionById(questionId);
    setQuestion(updated);
  };

  const handleUpvoteAnswer = async (answerId: string) => {
    if (!user || !questionId) return;
    await upvoteAnswer(questionId, answerId, user.uid);
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !questionId || !newAnswer.trim()) return;

    setSubmitting(true);
    try {
      await createAnswer(
        questionId,
        user.uid,
        user.displayName || 'Anonymous',
        newAnswer.trim(),
        user.photoURL || undefined
      );
      setNewAnswer('');
    } catch (error) {
      console.error('Error submitting answer:', error);
      alert('Failed to submit answer. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptAnswer = async (answerId: string) => {
    if (!user || !questionId || !question) return;
    try {
      await acceptAnswer(questionId, answerId, question.userId, user.uid);
    } catch (error: any) {
      alert(error.message || 'Failed to accept answer');
    }
  };

  const handleSubmitReply = async (answerId: string) => {
    if (!user || !questionId || !replyText.trim()) return;

    try {
      await addReply(
        questionId,
        answerId,
        user.uid,
        user.displayName || 'Anonymous',
        replyText.trim(),
        user.photoURL || undefined
      );
      setReplyText('');
      setReplyTo(null);
    } catch (error) {
      console.error('Error submitting reply:', error);
      alert('Failed to submit reply. Please try again.');
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const getCategoryColor = (category: Question['category']) => {
    const colors = {
      spiritual: 'bg-purple-100 text-purple-700 border-purple-300',
      sadhana: 'bg-orange-100 text-orange-700 border-orange-300',
      scripture: 'bg-blue-100 text-blue-700 border-blue-300',
      lifestyle: 'bg-green-100 text-green-700 border-green-300',
      general: 'bg-stone-100 text-stone-700 border-stone-300',
    };
    return colors[category];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mb-4"></div>
          <p className="text-stone-600 font-medium text-lg">Loading question...</p>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="text-center py-16">
        <p className="text-stone-600 text-lg font-medium">Question not found</p>
        <button
          onClick={() => navigate('/questions')}
          className="mt-4 text-orange-600 hover:text-orange-700 font-semibold"
        >
          ← Back to Questions
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-full max-w-5xl mx-auto animate-fadeIn space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/questions')}
        className="flex items-center gap-2 text-stone-600 hover:text-orange-600 font-semibold transition-colors"
      >
        <ArrowLeft size={20} />
        Back to Questions
      </button>

      {/* Question Card */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-stone-200 p-8">
        <div className="flex gap-6">
          {/* Voting */}
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={handleUpvoteQuestion}
              className={`p-3 rounded-lg transition-all ${
                user && question.upvotes?.includes(user.uid)
                  ? 'bg-orange-600 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-orange-50'
              }`}
            >
              <ThumbsUp size={24} />
            </button>
            <span className="font-bold text-2xl text-stone-900">{question.upvotes?.length || 0}</span>
            <span className="text-xs text-stone-500">votes</span>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-3xl font-bold text-stone-900">{question.title}</h1>
              <span className={`px-4 py-2 rounded-lg text-sm font-semibold border ${getCategoryColor(question.category)}`}>
                {question.category}
              </span>
            </div>

            <p className="text-stone-700 text-lg leading-relaxed mb-6 whitespace-pre-wrap">{question.content}</p>

            {/* Tags */}
            {question.tags && question.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {question.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Meta */}
            <div className="flex items-center gap-4 text-sm text-stone-500 border-t border-stone-200 pt-4">
              <span className="flex items-center gap-1">
                <Eye size={16} />
                {question.viewCount} views
              </span>
              <span>•</span>
              <span>
                asked by <span className="font-semibold text-stone-700">{question.userName}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock size={16} />
                {formatTimeAgo(question.timestamp)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Answers Section */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-stone-200 p-8">
        <h2 className="text-2xl font-bold text-stone-900 mb-6 flex items-center gap-2">
          <MessageCircle size={28} />
          {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
        </h2>

        {/* Answers List */}
        <div className="space-y-6 mb-8">
          {answers.map((answer) => (
            <div
              key={answer.id}
              className={`p-6 rounded-xl border-2 ${
                answer.isAccepted
                  ? 'bg-green-50 border-green-300'
                  : 'bg-stone-50 border-stone-200'
              }`}
            >
              <div className="flex gap-4">
                {/* Voting */}
                <div className="flex flex-col items-center gap-2">
                  <button
                    onClick={() => handleUpvoteAnswer(answer.id)}
                    className={`p-2 rounded-lg transition-all ${
                      user && answer.upvotes?.includes(user.uid)
                        ? 'bg-orange-600 text-white'
                        : 'bg-white text-stone-600 hover:bg-orange-50 border border-stone-200'
                    }`}
                  >
                    <ThumbsUp size={18} />
                  </button>
                  <span className="font-bold text-lg">{answer.upvotes?.length || 0}</span>
                  {answer.isAccepted && (
                    <CheckCircle2 className="text-green-600" size={24} />
                  )}
                </div>

                {/* Answer Content */}
                <div className="flex-1">
                  {answer.isAccepted && (
                    <div className="bg-green-600 text-white px-3 py-1 rounded-lg inline-flex items-center gap-1 mb-3 text-sm font-bold">
                      <CheckCircle2 size={16} />
                      Accepted Answer
                    </div>
                  )}

                  <p className="text-stone-800 text-base leading-relaxed mb-4 whitespace-pre-wrap">
                    {answer.content}
                  </p>

                  {/* Answer Meta */}
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-stone-500">
                      answered by <span className="font-semibold text-stone-700">{answer.userName}</span> •{' '}
                      {formatTimeAgo(answer.timestamp)}
                    </div>

                    <div className="flex gap-2">
                      {user && question.userId === user.uid && !answer.isAccepted && (
                        <button
                          onClick={() => handleAcceptAnswer(answer.id)}
                          className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all text-sm font-semibold"
                        >
                          <CheckCircle2 size={16} />
                          Accept
                        </button>
                      )}
                      <button
                        onClick={() => setReplyTo(replyTo === answer.id ? null : answer.id)}
                        className="flex items-center gap-1 px-3 py-1 bg-stone-100 text-stone-700 rounded-lg hover:bg-stone-200 transition-all text-sm font-semibold"
                      >
                        <Reply size={16} />
                        Reply
                      </button>
                    </div>
                  </div>

                  {/* Replies */}
                  {answer.replies && answer.replies.length > 0 && (
                    <div className="mt-4 space-y-3 pl-4 border-l-2 border-stone-300">
                      {answer.replies.map((reply) => (
                        <div key={reply.id} className="bg-white p-4 rounded-lg">
                          <p className="text-stone-700 text-sm mb-2">{reply.content}</p>
                          <div className="text-xs text-stone-500">
                            <span className="font-semibold text-stone-600">{reply.userName}</span> •{' '}
                            {formatTimeAgo(reply.timestamp)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply Input */}
                  {replyTo === answer.id && (
                    <div className="mt-4 flex gap-2">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write a reply..."
                        className="flex-1 p-3 border-2 border-stone-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                      />
                      <button
                        onClick={() => handleSubmitReply(answer.id)}
                        disabled={!replyText.trim()}
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send size={18} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {answers.length === 0 && (
            <div className="text-center py-12 bg-stone-50 rounded-xl border-2 border-dashed border-stone-300">
              <MessageCircle className="mx-auto mb-4 text-stone-400" size={48} />
              <p className="text-stone-600 font-medium">No answers yet</p>
              <p className="text-stone-500 text-sm">Be the first to answer this question!</p>
            </div>
          )}
        </div>

        {/* Answer Form */}
        <div className="border-t-2 border-stone-200 pt-6">
          <h3 className="text-xl font-bold text-stone-900 mb-4">Your Answer</h3>
          <form onSubmit={handleSubmitAnswer}>
            <textarea
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              placeholder="Share your knowledge and help others..."
              rows={6}
              className="w-full p-4 border-2 border-stone-300 rounded-xl focus:ring-4 focus:ring-orange-300 focus:border-orange-500 outline-none text-base resize-none mb-4"
            />
            <button
              type="submit"
              disabled={submitting || !newAnswer.trim()}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-lg font-bold hover:from-orange-700 hover:to-amber-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={20} />
              {submitting ? 'Posting...' : 'Post Answer'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QuestionDetailPage;
