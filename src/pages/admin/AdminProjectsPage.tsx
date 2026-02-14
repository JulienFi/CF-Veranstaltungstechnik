import { useEffect, useState } from 'react';
import { ArrowLeft, Plus, Edit2, Trash2, Upload, X } from 'lucide-react';
import { useAuth } from '../../contexts/useAuth';
import { projectRepository, ProjectDTO, ProjectWriteDTO } from '../../repositories/projectRepository';
import { supabase } from '../../lib/supabase';
import { buildSlugImagePath, resolveImageUrl } from '../../utils/image';

export default function AdminProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectDTO[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProjectWriteDTO>({
    title: '',
    description: '',
    image_url: '',
    location: '',
    date: '',
    category: '',
    order_index: 0
  });
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user) {
      window.location.href = '/admin/login';
      return;
    }
    loadProjects();
  }, [user]);

  const loadProjects = async () => {
    try {
      const data = await projectRepository.getAll();
      setProjects(data);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const getDefaultImagePath = (slugOrTitle: string | null | undefined): string =>
    buildSlugImagePath('project', slugOrTitle) ?? '';

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Bitte wÃ¤hle eine Bilddatei aus');
      return;
    }

    if (file.size > 5242880) {
      alert('Bild ist zu groÃŸ. Maximale GrÃ¶ÃŸe: 5 MB');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadImage = async (): Promise<string> => {
    if (!imageFile) return formData.image_url;

    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `projects/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('project-images')
      .upload(filePath, imageFile);

    if (uploadError) {
      throw new Error('Fehler beim Hochladen des Bildes');
    }

    const { data: { publicUrl } } = supabase.storage
      .from('project-images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      const imageUrl = await uploadImage();

      const projectData = {
        ...formData,
        image_url: imageUrl
      };

      if (editingProject) {
        await projectRepository.update(editingProject, projectData);
      } else {
        await projectRepository.create(projectData);
      }

      resetForm();
      loadProjects();
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Fehler beim Speichern: ' + (error as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const deleteProject = async (id: string) => {
    if (!confirm('Projekt wirklich lÃ¶schen?')) return;

    try {
      await projectRepository.delete(id);
      loadProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const editProject = (project: ProjectDTO) => {
    setFormData({
      title: project.title,
      slug: project.slug,
      description: project.description,
      image_url: project.image_url,
      location: project.location || '',
      date: project.date || '',
      category: project.category || '',
      order_index: project.order_index || 0
    });
    if (project.image_url) {
      setImagePreview(project.image_url);
    } else {
      setImagePreview(getDefaultImagePath(project.slug ?? project.title));
    }
    setEditingProject(project.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image_url: '',
      location: '',
      date: '',
      category: '',
      order_index: 0
    });
    setImagePreview('');
    setImageFile(null);
    setEditingProject(null);
    setShowForm(false);
  };

  const removeImage = () => {
    setImagePreview(getDefaultImagePath(formData.slug ?? formData.title));
    setImageFile(null);
    setFormData({ ...formData, image_url: '' });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-app-bg">
      <header className="bg-card-bg border-b border-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <a href="/admin" className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>ZurÃ¼ck zum Dashboard</span>
            </a>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/20"
              >
                <Plus className="w-5 h-5" />
                <span>Neues Projekt</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Projekte verwalten</h1>
          <div className="text-gray-400 text-sm">
            {projects.length} {projects.length === 1 ? 'Projekt' : 'Projekte'}
          </div>
        </div>

        {showForm ? (
          <div className="card mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingProject ? 'Projekt bearbeiten' : 'Neues Projekt erstellen'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Titel *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => {
                      const nextTitle = e.target.value;
                      const currentDefault = getDefaultImagePath(formData.slug ?? formData.title);
                      const nextDefault = getDefaultImagePath(formData.slug ?? nextTitle);
                      const currentImage = formData.image_url.trim();
                      const shouldSyncImagePath =
                        !editingProject &&
                        (currentImage === '' || currentImage === currentDefault);

                      const nextImagePath = shouldSyncImagePath ? nextDefault : formData.image_url;
                      setFormData({ ...formData, title: nextTitle, image_url: nextImagePath });

                      if (!imageFile && shouldSyncImagePath) {
                        setImagePreview(nextImagePath);
                      }
                    }}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none text-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Bildpfad (empfohlen: relativ)</label>
                  <input
                    type="text"
                    value={formData.image_url}
                    onChange={(e) => {
                      const nextValue = e.target.value;
                      setFormData({ ...formData, image_url: nextValue });
                      if (!imageFile) {
                        setImagePreview(nextValue || getDefaultImagePath(formData.slug ?? formData.title));
                      }
                    }}
                    placeholder="/images/projects/festival-2025.jpg"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none text-white"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Empfohlen: Bild als <code>/public/images/projects/&lt;slug&gt;.jpg</code> ablegen und <code>image_url</code> leer lassen. Falls kein separates Slug-Feld vorliegt, wird der Projekttitel als Slug-Basis genutzt. Relative Pfade und absolute URLs funktionieren weiterhin.
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Projektbild</label>
                  <div className="space-y-4">
                    {imagePreview ? (
                      <div className="relative inline-block">
                        <img
                          src={resolveImageUrl(imagePreview, 'project', formData.slug ?? formData.title)}
                          alt="Projekt Vorschau"
                          className="w-full max-w-md h-64 object-cover rounded-lg border-2 border-gray-700"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:border-gray-600 transition-colors bg-gray-800/50">
                        <Upload className="w-12 h-12 text-gray-500 mb-2" />
                        <span className="text-gray-400 text-sm">Bild hochladen</span>
                        <span className="text-gray-600 text-xs mt-1">PNG, JPG, WEBP (max. 5 MB)</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageSelect}
                          className="hidden"
                        />
                      </label>
                    )}
                    <p className="text-xs text-gray-500">
                      Optionaler Upload: Das Bild wird zu Supabase Storage hochgeladen und als absolute URL gespeichert.
                    </p>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Beschreibung *</label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none text-white resize-none"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Ort</label>
                  <input
                    type="text"
                    value={formData.location || ''}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Datum</label>
                  <input
                    type="text"
                    value={formData.date || ''}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    placeholder="z.B. MÃ¤rz 2024"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Kategorie</label>
                  <input
                    type="text"
                    value={formData.category || ''}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    placeholder="z.B. Festival, Konzert, Corporate Event"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Anzeigereihenfolge</label>
                  <input
                    type="number"
                    value={formData.order_index || 0}
                    onChange={(e) => setFormData({...formData, order_index: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none text-white"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-all font-medium shadow-lg shadow-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Wird gespeichert...' : (editingProject ? 'Ã„nderungen speichern' : 'Projekt erstellen')}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-all font-medium"
                >
                  Abbrechen
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="card">
            <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Bild</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Titel</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Kategorie</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Ort</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Datum</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Aktionen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {projects.map(project => (
                  <tr key={project.id} className="hover:bg-gray-800/50">
                    <td className="px-6 py-4">
                      <img
                        src={resolveImageUrl(project.image_url, 'project', project.slug ?? project.title)}
                        alt={project.title}
                        className="w-16 h-10 object-cover rounded-md border border-gray-700"
                        loading="lazy"
                      />
                    </td>
                    <td className="px-6 py-4 text-white">{project.title}</td>
                    <td className="px-6 py-4 text-gray-400">{project.category || '-'}</td>
                    <td className="px-6 py-4 text-gray-400">{project.location || '-'}</td>
                    <td className="px-6 py-4 text-gray-400">{project.date || '-'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => editProject(project)}
                          className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteProject(project.id)}
                          className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>

            {projects.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400">Noch keine Projekte vorhanden</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
