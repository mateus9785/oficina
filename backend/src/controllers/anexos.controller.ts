import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { pool } from '../config/database';
import { AppError } from '../middleware/errorHandler';

// ---------- Multer config ----------

const UPLOADS_DIR = path.join(process.cwd(), 'uploads', 'os');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const ALLOWED_MIMES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'video/mp4',
  'video/webm',
  'video/quicktime',
];

export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIMES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido. Envie imagens (JPEG, PNG, GIF, WebP) ou vídeos (MP4, WebM, MOV).'));
    }
  },
}).array('arquivos', 10);

// ---------- Controllers ----------

function mapAnexo(r: any) {
  return {
    id: r.id,
    ordemId: r.ordem_id,
    nomeOriginal: r.nome_original,
    caminho: r.caminho,
    tipoMime: r.tipo_mime,
    tamanho: r.tamanho,
    criadoEm: r.criado_em,
  };
}

export async function listar(req: Request, res: Response): Promise<void> {
  const [rows] = await pool.execute(
    'SELECT * FROM anexos_os WHERE ordem_id = ? ORDER BY criado_em DESC',
    [req.params.id]
  );
  res.json((rows as any[]).map(mapAnexo));
}

export async function upload(req: Request, res: Response): Promise<void> {
  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) {
    throw new AppError(400, 'Nenhum arquivo enviado.');
  }

  const insertados: any[] = [];
  for (const file of files) {
    const id = uuidv4();
    await pool.execute(
      'INSERT INTO anexos_os (id, ordem_id, nome_original, caminho, tipo_mime, tamanho) VALUES (?,?,?,?,?,?)',
      [id, req.params.id, file.originalname, file.filename, file.mimetype, file.size]
    );
    insertados.push({
      id,
      ordemId: req.params.id,
      nomeOriginal: file.originalname,
      caminho: file.filename,
      tipoMime: file.mimetype,
      tamanho: file.size,
      criadoEm: new Date().toISOString(),
    });
  }

  res.status(201).json(insertados);
}

export async function remover(req: Request, res: Response): Promise<void> {
  const [rows] = await pool.execute(
    'SELECT * FROM anexos_os WHERE id = ? AND ordem_id = ?',
    [req.params.anexoId, req.params.id]
  );
  const anexo = (rows as any[])[0];
  if (!anexo) throw new AppError(404, 'Anexo não encontrado.');

  // Apagar arquivo físico
  const filePath = path.join(UPLOADS_DIR, anexo.caminho);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  await pool.execute('DELETE FROM anexos_os WHERE id = ?', [req.params.anexoId]);
  res.status(204).send();
}
