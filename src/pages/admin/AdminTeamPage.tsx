import { useEffect, useState } from 'react';
import { ArrowLeft, Plus, Edit2, Trash2, Upload, X } from 'lucide-react';
import { useAuth } from '../../contexts/useAuth';
import { teamRepository, TeamMemberDTO, TeamMemberWriteDTO } from '../../repositories/teamRepository';
import { supabase } from '../../lib/supabase';
import { buildSlugImagePath, resolveImageUrl } from '../../utils/image';

export default function AdminTeamPage() {
  const { user } = useAuth();
  const [teamMembers, setTeamMembers] = useState<TeamMemberDTO[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [formData, setFormData] = useState<TeamMemberWriteDTO>({
    name: '',
    role: '',
    bio: '',
    image_url: '',
    email: '',
    phone: '',
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
    loadTeamMembers();
  }, [user]);

  const loadTeamMembers = async () => {
    try {
      const data = await teamRepository.getAll();
      setTeamMembers(data);
    } catch (error) {
      console.error('Error loading team members:', error);
    }
  };

  const getDefaultImagePath = (slugOrName: string | null | undefined): string =>
    buildSlugImagePath('team', slugOrName) ?? '';

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Bitte wähle eine Bilddatei aus');
      return;
    }

    if (file.size > 5242880) {
      alert('Bild ist zu groß. Maximale Größe: 5 MB');
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
    if (!imageFile) return formData.image_url || '';

    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `team/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('team-images')
      .upload(filePath, imageFile);

    if (uploadError) {
      throw new Error('Fehler beim Hochladen des Bildes');
    }

    const { data: { publicUrl } } = supabase.storage
      .from('team-images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      const imageUrl = await uploadImage();

      const memberData = {
        ...formData,
        image_url: imageUrl
      };

      if (editingMember) {
        await teamRepository.update(editingMember, memberData);
      } else {
        await teamRepository.create(memberData);
      }

      resetForm();
      loadTeamMembers();
    } catch (error) {
      console.error('Error saving team member:', error);
      alert('Fehler beim Speichern: ' + (error as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const deleteMember = async (id: string) => {
    if (!confirm('Teammitglied wirklich löschen?')) return;

    try {
      await teamRepository.delete(id);
      loadTeamMembers();
    } catch (error) {
      console.error('Error deleting team member:', error);
    }
  };

  const editMember = (member: TeamMemberDTO) => {
    setFormData({
      name: member.name,
      role: member.role,
      bio: member.bio || '',
      image_url: member.image_url || '',
      email: member.email || '',
      phone: member.phone || '',
      order_index: member.order_index || 0
    });
    if (member.image_url) {
      setImagePreview(member.image_url);
    } else {
      setImagePreview(getDefaultImagePath(member.name));
    }
    setEditingMember(member.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      role: '',
      bio: '',
      image_url: '',
      email: '',
      phone: '',
      order_index: 0
    });
    setImagePreview('');
    setImageFile(null);
    setEditingMember(null);
    setShowForm(false);
  };

  const removeImage = () => {
    setImagePreview(getDefaultImagePath(formData.name));
    setImageFile(null);
    setFormData({ ...formData, image_url: '' });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-app-bg">
      <header className="bg-card-bg border-b border-card">
        <div className="content-container py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <a href="/admin" className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Zurück zum Dashboard</span>
            </a>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary focus-ring tap-target interactive inline-flex items-center gap-2 px-4 py-2"
              >
                <Plus className="w-5 h-5" />
                <span>Neues Teammitglied</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="content-container py-8 md:py-12">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Team verwalten</h1>
          <div className="text-gray-400 text-sm">
            {teamMembers.length} {teamMembers.length === 1 ? 'Teammitglied' : 'Teammitglieder'}
          </div>
        </div>

        {showForm ? (
          <div className="glass-panel card mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingMember ? 'Teammitglied bearbeiten' : 'Neues Teammitglied erstellen'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => {
                      const nextName = e.target.value;
                      const currentDefault = getDefaultImagePath(formData.name);
                      const nextDefault = getDefaultImagePath(nextName);
                      const currentImage = (formData.image_url || '').trim();
                      const shouldSyncImagePath =
                        !editingMember &&
                        (currentImage === '' || currentImage === currentDefault);

                      const nextImagePath = shouldSyncImagePath ? nextDefault : (formData.image_url || '');
                      setFormData({ ...formData, name: nextName, image_url: nextImagePath });

                      if (!imageFile && shouldSyncImagePath) {
                        setImagePreview(nextImagePath);
                      }
                    }}
                    className="field-control focus-ring"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Position *</label>
                  <input
                    type="text"
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="field-control focus-ring"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Bildpfad (empfohlen: relativ)</label>
                  <input
                    type="text"
                    value={formData.image_url || ''}
                    onChange={(e) => {
                      const nextValue = e.target.value;
                      setFormData({ ...formData, image_url: nextValue });
                      if (!imageFile) {
                        setImagePreview(nextValue || getDefaultImagePath(formData.name));
                      }
                    }}
                    placeholder="/images/team/max-mustermann.jpg"
                    className="field-control focus-ring"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Empfohlen: Bild als <code>/public/images/team/&lt;slug&gt;.jpg</code> ablegen und <code>image_url</code> leer lassen. Falls kein separates Slug-Feld vorliegt, wird der Name als Slug-Basis genutzt. Relative Pfade und absolute URLs funktionieren weiterhin.
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Profilbild</label>
                  <div className="space-y-4">
                    {imagePreview ? (
                      <div className="relative inline-block">
                        <img
                          src={resolveImageUrl(imagePreview, 'team', formData.name)}
                          alt="Teammitglied Vorschau"
                          className="w-48 h-48 object-cover rounded-lg border-2 border-gray-700"
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
                  <label className="block text-sm font-medium text-gray-300 mb-2">Biografische Information</label>
                  <textarea
                    value={formData.bio || ''}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    rows={3}
                    className="field-control focus-ring resize-none"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">E-Mail</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="field-control focus-ring"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Telefon</label>
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="field-control focus-ring"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Anzeigereihenfolge</label>
                  <input
                    type="number"
                    value={formData.order_index || 0}
                    onChange={(e) => setFormData({...formData, order_index: parseInt(e.target.value)})}
                    className="field-control focus-ring"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={uploading}
                  className="btn-primary focus-ring tap-target interactive px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Wird gespeichert...' : (editingMember ? 'Änderungen speichern' : 'Teammitglied erstellen')}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn-secondary focus-ring tap-target interactive px-6 py-2"
                >
                  Abbrechen
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="glass-panel card">
            <div className="space-y-4 lg:hidden">
              {teamMembers.map(member => (
                <article key={member.id} className="glass-panel--soft card-inner p-4">
                  <div className="flex items-start gap-4">
                    <img
                      src={resolveImageUrl(member.image_url, 'team', member.name)}
                      alt={member.name}
                      className="h-14 w-14 flex-shrink-0 rounded-full border border-gray-700 object-cover"
                      loading="lazy"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-base font-semibold text-white">{member.name}</h3>
                      <p className="text-xs text-gray-400">{member.role}</p>
                      <p className="mt-1 text-xs text-gray-400">E-Mail: {member.email || '-'}</p>
                      <p className="text-xs text-gray-400">Telefon: {member.phone || '-'}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-end space-x-2">
                    <button
                      onClick={() => editMember(member)}
                      className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
                      aria-label={`Teammitglied ${member.name} bearbeiten`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteMember(member.id)}
                      className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                      aria-label={`Teammitglied ${member.name} löschen`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[900px]">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Bild</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Position</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">E-Mail</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Telefon</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Aktionen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {teamMembers.map(member => (
                  <tr key={member.id} className="hover:bg-gray-800/50">
                    <td className="px-6 py-4">
                      <img
                        src={resolveImageUrl(member.image_url, 'team', member.name)}
                        alt={member.name}
                        className="w-12 h-12 object-cover rounded-full border border-gray-700"
                        loading="lazy"
                      />
                    </td>
                    <td className="px-6 py-4 text-white">{member.name}</td>
                    <td className="px-6 py-4 text-gray-400">{member.role}</td>
                    <td className="px-6 py-4 text-gray-400">{member.email || '-'}</td>
                    <td className="px-6 py-4 text-gray-400">{member.phone || '-'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => editMember(member)}
                          className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteMember(member.id)}
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

            {teamMembers.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400">Noch keine Teammitglieder vorhanden</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

