import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import { createApp } from '../app';
import { pool } from '../config/database';
import { resetDb } from '../test-helpers/testDb';
import { authHeader } from '../test-helpers/testAuth';

const app = createApp();

describe('clientes routes', () => {
  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await pool.end();
  });

  it('creates, finds and paginates a cliente', async () => {
    const create = await request(app)
      .post('/api/v1/clientes')
      .set('Authorization', authHeader())
      .send({ nome: 'Ana Teste', cpfCnpj: '111.222.333-44' });

    expect(create.status).toBe(201);
    expect(create.body.nome).toBe('Ana Teste');
    const id = create.body.id as string;

    const buscar = await request(app)
      .get(`/api/v1/clientes/${id}`)
      .set('Authorization', authHeader());
    expect(buscar.status).toBe(200);
    expect(buscar.body.cpfCnpj).toBe('111.222.333-44');

    const listar = await request(app)
      .get('/api/v1/clientes')
      .set('Authorization', authHeader());
    expect(listar.status).toBe(200);
    expect(listar.body.meta.total).toBe(1);
    expect(listar.body.data).toHaveLength(1);
  });

  it('rejects a duplicate CPF with 409', async () => {
    await request(app)
      .post('/api/v1/clientes')
      .set('Authorization', authHeader())
      .send({ nome: 'Primeiro', cpfCnpj: '555.666.777-88' });

    const dup = await request(app)
      .post('/api/v1/clientes')
      .set('Authorization', authHeader())
      .send({ nome: 'Segundo', cpfCnpj: '555.666.777-88' });

    expect(dup.status).toBe(409);
  });

  it('edits a cliente, clearing fields not resent to their default', async () => {
    const create = await request(app)
      .post('/api/v1/clientes')
      .set('Authorization', authHeader())
      .send({ nome: 'Ana', telefone: '11999998888', email: 'ana@x.com' });
    const id = create.body.id as string;

    const edit = await request(app)
      .put(`/api/v1/clientes/${id}`)
      .set('Authorization', authHeader())
      .send({ nome: 'Ana Editada' });

    expect(edit.status).toBe(200);
    expect(edit.body.nome).toBe('Ana Editada');
    expect(edit.body.telefone).toBe('');
    expect(edit.body.email).toBe('');
  });

  it('returns 404 editing/removing a cliente that does not exist', async () => {
    const randomId = uuidv4();
    const edit = await request(app)
      .put(`/api/v1/clientes/${randomId}`)
      .set('Authorization', authHeader())
      .send({ nome: 'X' });
    expect(edit.status).toBe(404);

    const remove = await request(app)
      .delete(`/api/v1/clientes/${randomId}`)
      .set('Authorization', authHeader());
    expect(remove.status).toBe(404);
  });

  it('removes a cliente', async () => {
    const create = await request(app)
      .post('/api/v1/clientes')
      .set('Authorization', authHeader())
      .send({ nome: 'Para Remover' });
    const id = create.body.id as string;

    const remove = await request(app)
      .delete(`/api/v1/clientes/${id}`)
      .set('Authorization', authHeader());
    expect(remove.status).toBe(204);

    const buscar = await request(app)
      .get(`/api/v1/clientes/${id}`)
      .set('Authorization', authHeader());
    expect(buscar.status).toBe(404);
  });

  it('rejects requests with no auth header', async () => {
    const res = await request(app).get('/api/v1/clientes');
    expect(res.status).toBe(401);
  });
});
