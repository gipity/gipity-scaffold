import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '../lib/auth-context';
import { debug } from '../lib/debug';
import { noteApi } from '../lib/api';
import { FileApi } from '../lib/file-api';
import { useToast } from '@/hooks/use-toast';
import { Note, CreateNote, UpdateNote } from '../../../shared/schema';
import { Plus, Edit, Trash2, Camera, Image as ImageIcon, FileText, Star, PenTool, CheckCircle, RefreshCw } from 'lucide-react';
import { CameraCapture, PhotoData } from '../components/CameraCapture';
import { PhotoPreview } from '../components/PhotoPreview';
import { Link } from 'wouter';
import { useAuthenticatedImage } from '../hooks/useAuthenticatedImage';
import { Capacitor } from '@capacitor/core';
import FloatingKeyboardHide from '../components/FloatingKeyboardHide';

// Component for displaying existing photo with authentication
const ExistingPhotoDisplay: React.FC<{
  photoPath: string;
  onRemove: () => void;
}> = ({ photoPath, onRemove }) => {
  const { imageUrl, loading, error } = useAuthenticatedImage(photoPath);

  return (
    <div className="mb-4 p-3 border border-gray-200 rounded-lg bg-white dark:bg-gray-800">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-white" />
          <span className="text-sm text-gray-700 dark:text-white">
            Photo selected successfully
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-800/20"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex justify-center">
        {loading && (
          <div className="w-32 h-32 bg-gray-200 rounded border flex items-center justify-center">
            <span className="text-sm text-gray-500">Loading...</span>
          </div>
        )}
        {error && (
          <div className="w-32 h-32 bg-red-100 rounded border flex items-center justify-center">
            <span className="text-sm text-red-500">Failed to load</span>
          </div>
        )}
        {imageUrl && !loading && !error && (
          <img
            src={imageUrl}
            alt="Selected photo"
            className="max-w-full max-h-32 object-contain rounded border"
          />
        )}
        {!loading && !error && !imageUrl && (
          <div className="w-32 h-32 bg-yellow-100 rounded border flex items-center justify-center">
            <span className="text-sm text-yellow-600">No image URL</span>
          </div>
        )}
      </div>
    </div>
  );
};

export const Notes: React.FC = () => {
  const { user, token, handleTokenExpiration } = useAuth();
  const { toast } = useToast();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [imageRefreshKey, setImageRefreshKey] = useState(0);

  const [localPhotoData, setLocalPhotoData] = useState<PhotoData | null>(null);
  const [photoRemoved, setPhotoRemoved] = useState(false);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const touchStartY = useRef<number | null>(null);
  const scrollContainer = useRef<HTMLDivElement>(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load user's notes
  const loadNotes = async (showRefreshToast = false) => {
    if (!token) return;
    
    try {
      const response = await noteApi.getAll(token, handleTokenExpiration);
      if (response.isAuthError) {
        return;
      }
      if (response.success && response.notes) {
        setNotes(response.notes);
      } else {
        toast({
          title: 'Error loading notes',
          description: response.error || 'Failed to load your notes',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Unable to load notes. Please check your connection.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, [token]);

  // Pull to refresh handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!Capacitor.isNativePlatform()) return;
    
    const container = scrollContainer.current;
    if (!container || container.scrollTop > 0) return;
    
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!Capacitor.isNativePlatform() || touchStartY.current === null) return;
    
    const container = scrollContainer.current;
    if (!container || container.scrollTop > 0) return;
    
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - touchStartY.current;
    
    if (deltaY > 0) {
      e.preventDefault();
      const maxPull = 80;
      const distance = Math.min(deltaY * 0.5, maxPull);
      setPullDistance(distance);
    }
  };

  const handleTouchEnd = () => {
    if (!Capacitor.isNativePlatform() || touchStartY.current === null) return;
    
    const threshold = 60;
    if (pullDistance > threshold && !isRefreshing) {
      setIsRefreshing(true);
      loadNotes(true);
    }
    
    touchStartY.current = null;
    setPullDistance(0);
  };

  const handleCreateNote = async () => {
    if (!token || !title.trim() || !content.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      let finalPhotoPath: string | null | undefined = undefined;

      // Upload photo if we have local photo data
      if (localPhotoData) {
        const uploadResult = await FileApi.uploadFile(token, localPhotoData, handleTokenExpiration);
        if (uploadResult.isAuthError) {
          return;
        }
        if (uploadResult.success && uploadResult.filePath) {
          finalPhotoPath = uploadResult.filePath;
        } else {
          throw new Error(uploadResult.error || 'Failed to upload photo');
        }
      }

      const noteData: CreateNote = {
        title: title.trim(),
        content: content.trim(),
        photo_path: finalPhotoPath
      };

      const response = await noteApi.create(token, noteData, handleTokenExpiration);
      
      if (response.isAuthError) {
        return;
      }
      if (response.success && response.note) {
        setNotes(prev => [response.note!, ...prev]);
        setTitle('');
        setContent('');
        setLocalPhotoData(null);
        setShowCreateForm(false);
      } else {
        throw new Error(response.error || 'Failed to create note');
      }
    } catch (error) {
      debug.error('Note creation failed:', error);
      toast({
        title: 'Creation failed',
        description: error instanceof Error ? error.message : 'Failed to create note',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditNote = async () => {
    if (!token || !editingNote || !title.trim() || !content.trim()) return;

    setIsSubmitting(true);

    try {
      let finalPhotoPath: string | null | undefined = undefined;

      // Upload new photo if we have local photo data
      if (localPhotoData) {
        const uploadResult = await FileApi.uploadFile(token, localPhotoData, handleTokenExpiration);
        if (uploadResult.isAuthError) {
          return;
        }
        if (uploadResult.success && uploadResult.filePath) {
          finalPhotoPath = uploadResult.filePath;
        } else {
          throw new Error(uploadResult.error || 'Failed to upload photo');
        }
      } else if (photoRemoved) {
        // Photo was explicitly removed - set to null to trigger deletion
        finalPhotoPath = null;
      } else {
        // Keep existing photo if no new one and not removed
        finalPhotoPath = editingNote.photo_path || undefined;
      }

      const updates: UpdateNote = {
        title: title.trim(),
        content: content.trim(),
        photo_path: finalPhotoPath
      };

      const response = await noteApi.update(token, editingNote.id, updates, handleTokenExpiration);
      
      if (response.isAuthError) {
        return;
      }
      if (response.success && response.note) {
        setNotes(prev => prev.map(note => 
          note.id === editingNote.id ? response.note! : note
        ));
        setEditingNote(null);
        setShowCreateForm(false);
        setTitle('');
        setContent('');
        setLocalPhotoData(null);
        setPhotoRemoved(false);
      } else {
        throw new Error(response.error || 'Failed to update note');
      }
    } catch (error) {
      debug.error('Note update failed:', error);
      toast({
        title: 'Update failed',
        description: error instanceof Error ? error.message : 'Failed to update note',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!token) return;

    try {
      const response = await noteApi.delete(token, noteId, handleTokenExpiration);
      
      if (response.isAuthError) {
        return;
      }
      if (response.success) {
        setNotes(prev => prev.filter(note => note.id !== noteId));
      } else {
        throw new Error(response.error || 'Failed to delete note');
      }
    } catch (error) {
      debug.error('Note deletion failed:', error);
      toast({
        title: 'Deletion failed',
        description: error instanceof Error ? error.message : 'Failed to delete note',
        variant: 'destructive'
      });
    }
  };

  const startEditing = (note: Note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setLocalPhotoData(null);
    setPhotoRemoved(false);
    setShowCreateForm(true);
    setImageRefreshKey(prev => prev + 1);
  };

  const cancelForm = () => {
    setShowCreateForm(false);
    setEditingNote(null);
    setTitle('');
    setContent('');
    setLocalPhotoData(null);
    setPhotoRemoved(false);
  };



  const removePhoto = () => {
    setLocalPhotoData(null);
    setPhotoRemoved(true);
  };



  if (isLoading) {
    return (
      <div className="p-4">
        <div className="text-center">Loading your notes...</div>
      </div>
    );
  }



  if (showCreateForm) {
    return (
      <div className="p-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>{editingNote ? 'Edit Note' : 'Create New Note'}</CardTitle>
            <CardDescription>
              {editingNote ? 'Update your note' : 'Add a new note with optional photo'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-2">
                Title
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter note title..."
                maxLength={100}
              />
            </div>
            
            <div>
              <label htmlFor="content" className="block text-sm font-medium mb-2">
                Content
              </label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your note content here..."
                rows={6}
                maxLength={1000}
              />
            </div>



            {/* Photo Options Section */}
            <div className="border rounded-lg p-4 bg-[#476A92]/5 dark:bg-gray-800 border-[#476A92]/20">
              <div className="flex items-center gap-2 mb-3">
                <ImageIcon className="w-4 h-4 text-[#476A92]" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {editingNote ? 'Update photo' : 'Add a photo to your note'}
                </span>
              </div>
              
              {/* Show existing photo for editing */}
              {editingNote && editingNote.photo_path && !localPhotoData && !photoRemoved && (
                <ExistingPhotoDisplay
                  key={`${editingNote.photo_path}-${imageRefreshKey}`}
                  photoPath={editingNote.photo_path}
                  onRemove={removePhoto}
                />
              )}
              
              {/* Show local photo preview if we have new photo data */}
              {localPhotoData ? (
                <PhotoPreview
                  photoData={localPhotoData}
                  onRemove={removePhoto}
                  disabled={isSubmitting}
                />
              ) : (
                /* Show camera capture if no existing photo (edit mode) or no local photo (create mode) */
                (!editingNote || !editingNote.photo_path || photoRemoved) && (
                  <CameraCapture
                    onPhotoCapture={(photoData) => {
                      debug.log('📁 PHOTO CAPTURED: Setting localPhotoData');
                      setLocalPhotoData(photoData);
                    }}
                    disabled={isSubmitting}
                  />
                )
              )}
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={editingNote ? handleEditNote : handleCreateNote}
                disabled={isSubmitting || !title.trim() || !content.trim()}
                className="flex-1 bg-[#476A92] hover:bg-[#3d5c82]"
              >
                {isSubmitting ? 'Saving...' : (editingNote ? 'Update Note' : 'Create Note')}
              </Button>
              
              <Button variant="outline" onClick={cancelForm} disabled={isSubmitting} className="hover:bg-gray-50 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-100">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Floating Keyboard Hide Button */}
        <FloatingKeyboardHide show={showCreateForm} />
      </div>
    );
  }

  return (
    <div 
      ref={scrollContainer}
      className="p-4 space-y-6 overflow-y-auto"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: `translateY(${pullDistance}px)`,
        transition: pullDistance === 0 ? 'transform 0.3s ease-out' : 'none'
      }}
    >
      {/* Pull to refresh indicator */}
      {pullDistance > 0 && (
        <div 
          className="flex items-center justify-center py-2 text-gray-500"
          style={{ 
            opacity: Math.min(pullDistance / 60, 1),
            transform: `translateY(-${Math.max(0, 60 - pullDistance)}px)`
          }}
        >
          <RefreshCw 
            className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} 
          />
          <span className="text-sm">
            {isRefreshing ? 'Refreshing...' : pullDistance > 60 ? 'Release to refresh' : 'Pull to refresh'}
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Notes</h1>
        <Button onClick={() => setShowCreateForm(true)} className="bg-[#476A92] hover:bg-[#3d5c82]">
          <Plus className="w-4 h-4 mr-2" />
          New Note
        </Button>
      </div>



      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-8 h-8 bg-[#476A92]/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <FileText className="w-4 h-4 text-[#476A92]" />
            </div>
            <div className="text-2xl font-bold">{notes.length}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Total Notes</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-8 h-8 bg-[#476A92]/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <Camera className="w-4 h-4 text-[#476A92]" />
            </div>
            <div className="text-2xl font-bold">
              {notes.filter(note => note.photo_path).length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">With Photos</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-8 h-8 bg-[#476A92]/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <Star className="w-4 h-4 text-[#476A92]" />
            </div>
            <div className="text-2xl font-bold">
              {notes.filter(note => {
                const noteDate = new Date(note.created_at);
                const today = new Date();
                return noteDate.toDateString() === today.toDateString();
              }).length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Created Today</div>
          </CardContent>
        </Card>
      </div>



      {/* Full Notes List Section */}
      <div id="full-notes-list" className="space-y-4">

      <h2 className="text-xl font-semibold mb-4">All Notes</h2>
      
      {notes.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="mb-4">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-gray-400" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">No notes yet</h3>
            <p className="text-gray-600 mb-4">
              Create your first note with optional photo attachment
            </p>
            <Button onClick={() => setShowCreateForm(true)} className="bg-[#476A92] hover:bg-[#3d5c82]">
              <Plus className="w-4 h-4 mr-2" />
              Create First Note
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <Card key={note.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div 
                    className="flex-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded p-2 -m-2 transition-colors"
                    onClick={() => startEditing(note)}
                  >
                    <h3 className="font-semibold mb-1">{note.title}</h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {note.content}
                    </p>
                    <div className="flex items-center gap-2 mb-1">
                      {note.photo_path && (
                        <Camera className="w-4 h-4 text-[#476A92]" />
                      )}
                      <div className="text-xs text-gray-400">
                        {new Date(note.created_at).toLocaleDateString('en-GB')} at {new Date(note.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-1 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteNote(note.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      </div>
    </div>
  );
};