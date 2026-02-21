import { useEffect, useRef, useState } from 'react';
import { Paperclip, Upload, Trash2, X } from 'lucide-react';
import { api } from '../../lib/api';
import type { AnexoOS } from '../../types';
import { Button } from '../ui/Button';

const UPLOADS_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1')
  .replace('/api/v1', '');

interface AnexosSectionProps {
  ordemId: string;
  readOnly?: boolean;
}

export function AnexosSection({ ordemId, readOnly }: AnexosSectionProps) {
  const [anexos, setAnexos] = useState<AnexoOS[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [lightbox, setLightbox] = useState<AnexoOS | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchAnexos();
  }, [ordemId]);

  async function fetchAnexos() {
    setLoading(true);
    try {
      const data = await api.get<AnexoOS[]>(`/ordens/${ordemId}/anexos`);
      setAnexos(data);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const formData = new FormData();
    Array.from(files).forEach((f) => formData.append('arquivos', f));
    setUploading(true);
    try {
      const novos = await api.postForm<AnexoOS[]>(`/ordens/${ordemId}/anexos`, formData);
      setAnexos((prev) => [...novos, ...prev]);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function handleDelete(anexo: AnexoOS) {
    if (!confirm(`Remover "${anexo.nomeOriginal}"?`)) return;
    await api.delete(`/ordens/${ordemId}/anexos/${anexo.id}`);
    setAnexos((prev) => prev.filter((a) => a.id !== anexo.id));
    if (lightbox?.id === anexo.id) setLightbox(null);
  }

  function fileUrl(caminho: string) {
    return `${UPLOADS_BASE}/uploads/os/${caminho}`;
  }

  function isImage(mime: string) {
    return mime.startsWith('image/');
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Paperclip size={18} /> Anexos
          {anexos.length > 0 && (
            <span className="text-sm font-normal text-gray-500">({anexos.length})</span>
          )}
        </h3>
        {!readOnly && (
          <>
            <Button
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Upload size={16} className="mr-1" />
              {uploading ? 'Enviando...' : 'Anexar arquivo'}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/mp4,video/webm,video/quicktime"
              className="hidden"
              onChange={handleUpload}
            />
          </>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Carregando...</p>
      ) : anexos.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">Nenhum anexo adicionado.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {anexos.map((anexo) => (
            <div key={anexo.id} className="relative group rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
              {isImage(anexo.tipoMime) ? (
                <img
                  src={fileUrl(anexo.caminho)}
                  alt={anexo.nomeOriginal}
                  className="w-full h-28 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setLightbox(anexo)}
                />
              ) : (
                <video
                  src={fileUrl(anexo.caminho)}
                  className="w-full h-28 object-cover cursor-pointer"
                  onClick={() => setLightbox(anexo)}
                  muted
                  preload="metadata"
                />
              )}
              <div className="px-2 py-1">
                <p className="text-xs text-gray-600 truncate" title={anexo.nomeOriginal}>
                  {anexo.nomeOriginal}
                </p>
              </div>
              {!readOnly && (
                <button
                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDelete(anexo)}
                  title="Remover"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 text-white bg-black/40 rounded-full p-2 hover:bg-black/60"
            onClick={() => setLightbox(null)}
          >
            <X size={20} />
          </button>
          <div onClick={(e) => e.stopPropagation()} className="max-w-4xl max-h-full">
            {isImage(lightbox.tipoMime) ? (
              <img
                src={fileUrl(lightbox.caminho)}
                alt={lightbox.nomeOriginal}
                className="max-h-[85vh] max-w-full rounded-lg"
              />
            ) : (
              <video
                src={fileUrl(lightbox.caminho)}
                controls
                autoPlay
                className="max-h-[85vh] max-w-full rounded-lg"
              />
            )}
            <p className="text-white text-sm text-center mt-2 opacity-70">{lightbox.nomeOriginal}</p>
          </div>
        </div>
      )}
    </div>
  );
}
