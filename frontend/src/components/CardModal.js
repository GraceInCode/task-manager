import React, { useState, useEffect } from "react";
import api from "../api";

const CardModal = ({ card, board, onClose, onUpdate }) => {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || "");
  const [assigneeId, setAssigneeId] = useState(card.assigneeId || "");
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [file, setFile] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [commentsRes, attachmentsRes] = await Promise.all([
          api.get(`/cards/${card.id}/comments`),
          api.get(`/cards/${card.id}/attachments`),
        ]);
        setComments(commentsRes.data || []);
        setAttachments(attachmentsRes.data || []);
      } catch (err) {
        console.error("Error fetching card data:", err);
      }
    };
    fetchData();
  }, [card.id]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const res = await api.put(`/cards/${card.id}`, {
        title,
        description,
        assigneeId: assigneeId ? parseInt(assigneeId) : null,
        clientUpdatedAt: card.updatedAt,
      });

      if (res.status === 409) {
        alert("Conflict! Another user updated this card. Refreshing with latest data...");
        const latest = res.data.currentCard;
        setTitle(latest.title);
        setDescription(latest.description || "");
        setAssigneeId(latest.assigneeId || "");
        const [c, a] = await Promise.all([
          api.get(`/cards/${card.id}/comments`),
          api.get(`/cards/${card.id}/attachments`),
        ]);
        setComments(c.data);
        setAttachments(a.data);
        return;
      }

      onUpdate(res.data);
      onClose();
    } catch (err) {
      if (err.response?.status === 409) {
        alert("Conflict detected — card was updated by someone else. Data refreshed.");
        const latest = err.response.data.currentCard;
        setTitle(latest.title);
        setDescription(latest.description || "");
        setAssigneeId(latest.assigneeId || "");
      } else {
        console.error(err);
        alert("Failed to save card");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await api.post(`/cards/${card.id}/comments`, { text: newComment });
      setComments([...comments, res.data]);
      setNewComment("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await api.post(`/cards/${card.id}/attachments`, formData);
      setAttachments([...attachments, res.data]);
      setFile(null);
      document.querySelector('input[type="file"]').value = "";
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-large max-w-2xl w-full max-h-[90vh] overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Edit Card</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Card title"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 resize-none"
              />
            </div>

            {/* Assignee */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Assign to</label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200"
              >
                <option value="">Unassigned</option>
                <option value={board.ownerId}>
                  👑 {board.owner?.email || "Owner"}
                </option>
                {board.collaborators?.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.email}
                  </option>
                ))}
              </select>
            </div>

            {/* Comments */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Comments</h3>
              <div className="space-y-3 mb-4">
                {comments.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No comments yet</p>
                ) : (
                  comments.map((c) => (
                    <div key={c.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                          <span className="text-xs text-white font-medium">
                            {c.user?.email?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                        <span className="font-medium text-gray-900 text-sm">
                          {c.user?.email || "Someone"}
                        </span>
                      </div>
                      <p className="text-gray-700">{c.text}</p>
                    </div>
                  ))
                )}
              </div>
              
              <div className="flex space-x-3">
                <input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200"
                  onKeyPress={(e) => e.key === "Enter" && handleAddComment()}
                />
                <button
                  onClick={handleAddComment}
                  className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Attachments */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Attachments</h3>
              <div className="space-y-3 mb-4">
                {attachments.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No attachments</p>
                ) : (
                  attachments.map((att) => (
                    <div key={att.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      <a
                        href={att.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200"
                      >
                        {att.filename}
                      </a>
                      {(att.url.endsWith('.jpg') || att.url.endsWith('.jpeg') || att.url.endsWith('.png') || att.url.endsWith('.gif')) && (
                        <img src={att.url} alt={att.filename} className="w-12 h-12 object-cover rounded" />
                      )}
                    </div>
                  ))
                )}
              </div>
              
              <div className="flex space-x-3">
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200"
                />
                <button
                  onClick={handleUpload}
                  disabled={!file}
                  className="px-4 py-2 bg-accent-500 hover:bg-accent-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-all duration-200 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-6 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-soft hover:shadow-medium"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CardModal;