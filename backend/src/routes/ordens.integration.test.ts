import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import { createApp } from '../app';
import { pool } from '../config/database';
import { resetDb, criarUsuarioTeste } from '../test-helpers/testDb';
import { authHeader, USUARIO_TESTE_PADRAO } from '../test-helpers/testAuth';

const app = createApp();
const USUARIO_B = '00000000-0000-0000-0000-00000000000b';

async function criarPeca(quantidade: number): Promise<string> {
  const id = uuidv4();
  await pool.execute(
    'INSERT INTO pecas (id, usuario_id, nome, categoria, quantidade, preco_venda) VALUES (?, ?, ?, ?, ?, ?)',
    [id, USUARIO_TESTE_PADRAO, 'Filtro de Óleo', 'filtro', quantidade, 50]
  );
  return id;
}

async function estoqueDe(pecaId: string): Promise<{ quantidade: number; uso_total: number }> {
  const [rows] = await pool.query<
    ({ quantidade: number; uso_total: number } & import('mysql2/promise').RowDataPacket)[]
  >('SELECT quantidade, uso_total FROM pecas WHERE id = ?', [pecaId]);
  return rows[0];
}

describe('ordens routes', () => {
  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await pool.end();
  });

  it('creates an ordem avulsa (no cliente/veiculo)', async () => {
    const res = await request(app)
      .post('/api/v1/ordens')
      .set('Authorization', authHeader())
      .send({ descricao: 'Troca de óleo', kmEntrada: 50000 });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('aguardando_aprovacao');
    expect(res.body.itens).toEqual([]);
  });

  it('rejects editar with no fields with 400', async () => {
    const create = await request(app)
      .post('/api/v1/ordens')
      .set('Authorization', authHeader())
      .send({ descricao: 'Teste' });

    const edit = await request(app)
      .put(`/api/v1/ordens/${create.body.id}`)
      .set('Authorization', authHeader())
      .send({});
    expect(edit.status).toBe(400);
  });

  describe('full lifecycle: item stock + finalize receivable + delete', () => {
    it('deducts stock on add, adjusts on edit, restores on remove', async () => {
      const pecaId = await criarPeca(10);
      const ordem = await request(app)
        .post('/api/v1/ordens')
        .set('Authorization', authHeader())
        .send({ descricao: 'OS de teste', kmEntrada: 1000 });
      const ordemId = ordem.body.id as string;

      const addItem = await request(app)
        .post(`/api/v1/ordens/${ordemId}/itens`)
        .set('Authorization', authHeader())
        .send({
          tipo: 'peca',
          descricao: 'Filtro',
          quantidade: 3,
          valorUnitario: 50,
          pecaId,
        });
      expect(addItem.status).toBe(201);
      expect(await estoqueDe(pecaId)).toEqual({ quantidade: 7, uso_total: 3 });

      const itemId = addItem.body.itens[0].id as string;
      const editItem = await request(app)
        .put(`/api/v1/ordens/${ordemId}/itens/${itemId}`)
        .set('Authorization', authHeader())
        .send({ quantidade: 5 });
      expect(editItem.status).toBe(200);
      expect(await estoqueDe(pecaId)).toEqual({ quantidade: 5, uso_total: 5 });

      const removeItem = await request(app)
        .delete(`/api/v1/ordens/${ordemId}/itens/${itemId}`)
        .set('Authorization', authHeader());
      expect(removeItem.status).toBe(200);
      expect(await estoqueDe(pecaId)).toEqual({ quantidade: 10, uso_total: 0 });
    });

    it('creates a paid receivable for the item total when finalized', async () => {
      const pecaId = await criarPeca(10);
      const ordem = await request(app)
        .post('/api/v1/ordens')
        .set('Authorization', authHeader())
        .send({ descricao: 'OS finalizada', kmEntrada: 1000, descontoPercentual: 10 });
      const ordemId = ordem.body.id as string;

      await request(app)
        .post(`/api/v1/ordens/${ordemId}/itens`)
        .set('Authorization', authHeader())
        .send({ tipo: 'peca', descricao: 'Filtro', quantidade: 2, valorUnitario: 100, pecaId });

      const finalizar = await request(app)
        .patch(`/api/v1/ordens/${ordemId}/status`)
        .set('Authorization', authHeader())
        .send({ status: 'finalizado' });
      expect(finalizar.status).toBe(200);
      expect(finalizar.body.status).toBe('finalizado');

      // subtotal 200, 10% discount -> 180
      const [rows] = await pool.query<
        ({ valor: string; status: string; tipo: string } & import('mysql2/promise').RowDataPacket)[]
      >('SELECT valor, status, tipo FROM contas WHERE ordem_servico_id = ?', [ordemId]);
      expect(rows).toHaveLength(1);
      expect(rows[0].tipo).toBe('receita');
      expect(rows[0].status).toBe('pago');
      expect(Number(rows[0].valor)).toBe(180);
    });

    it('remover restores stock and deletes the order atomically (the fixed bug)', async () => {
      const pecaId = await criarPeca(10);
      const ordem = await request(app)
        .post('/api/v1/ordens')
        .set('Authorization', authHeader())
        .send({ descricao: 'OS a remover', kmEntrada: 1000 });
      const ordemId = ordem.body.id as string;

      await request(app)
        .post(`/api/v1/ordens/${ordemId}/itens`)
        .set('Authorization', authHeader())
        .send({ tipo: 'peca', descricao: 'Filtro', quantidade: 4, valorUnitario: 50, pecaId });
      expect(await estoqueDe(pecaId)).toEqual({ quantidade: 6, uso_total: 4 });

      const remove = await request(app)
        .delete(`/api/v1/ordens/${ordemId}`)
        .set('Authorization', authHeader());
      expect(remove.status).toBe(204);

      expect(await estoqueDe(pecaId)).toEqual({ quantidade: 10, uso_total: 0 });

      const buscar = await request(app)
        .get(`/api/v1/ordens/${ordemId}`)
        .set('Authorization', authHeader());
      expect(buscar.status).toBe(404);
    });
  });

  it('archives only a finalizado order, and rejects otherwise', async () => {
    const ordem = await request(app)
      .post('/api/v1/ordens')
      .set('Authorization', authHeader())
      .send({ descricao: 'Nao finalizada' });
    const ordemId = ordem.body.id as string;

    const rejected = await request(app)
      .patch(`/api/v1/ordens/${ordemId}/arquivar`)
      .set('Authorization', authHeader());
    expect(rejected.status).toBe(400);

    await request(app)
      .patch(`/api/v1/ordens/${ordemId}/status`)
      .set('Authorization', authHeader())
      .send({ status: 'finalizado' });

    const archived = await request(app)
      .patch(`/api/v1/ordens/${ordemId}/arquivar`)
      .set('Authorization', authHeader());
    expect(archived.status).toBe(204);

    const listArquivadas = await request(app)
      .get('/api/v1/ordens?arquivado=1')
      .set('Authorization', authHeader());
    expect(listArquivadas.body.meta.total).toBe(1);
  });

  describe('isolamento por conta', () => {
    it('rejeita adicionar item referenciando peça de outro usuário', async () => {
      await criarUsuarioTeste(USUARIO_B, 'b@teste.local');
      const pecaDoA = await criarPeca(10);

      const ordemDoB = await request(app)
        .post('/api/v1/ordens')
        .set('Authorization', authHeader({ sub: USUARIO_B }))
        .send({ descricao: 'OS do B' });

      const addItem = await request(app)
        .post(`/api/v1/ordens/${ordemDoB.body.id}/itens`)
        .set('Authorization', authHeader({ sub: USUARIO_B }))
        .send({ tipo: 'peca', descricao: 'Peça do A', quantidade: 1, valorUnitario: 10, pecaId: pecaDoA });

      expect(addItem.status).toBe(404);
      expect(await estoqueDe(pecaDoA)).toEqual({ quantidade: 10, uso_total: 0 });
    });

    it('não vê ordens de outro usuário', async () => {
      await criarUsuarioTeste(USUARIO_B, 'b@teste.local');
      await request(app)
        .post('/api/v1/ordens')
        .set('Authorization', authHeader())
        .send({ descricao: 'OS do A' });

      const listarComoB = await request(app)
        .get('/api/v1/ordens')
        .set('Authorization', authHeader({ sub: USUARIO_B }));
      expect(listarComoB.body.meta.total).toBe(0);
    });
  });
});
