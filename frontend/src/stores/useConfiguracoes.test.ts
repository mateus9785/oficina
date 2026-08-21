import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from '../lib/api';
import { useConfiguracoes } from './useConfiguracoes';

vi.mock('../lib/api', () => ({
  api: { get: vi.fn(), put: vi.fn() },
}));

describe('useConfiguracoes', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset();
    vi.mocked(api.put).mockReset();
    useConfiguracoes.setState({ config: {}, loading: false });
  });

  it('fetches and stores config, toggling loading', async () => {
    vi.mocked(api.get).mockResolvedValue({ desconto_maximo: '20' });

    const promise = useConfiguracoes.getState().fetchConfiguracoes();
    expect(useConfiguracoes.getState().loading).toBe(true);
    await promise;

    expect(api.get).toHaveBeenCalledWith('/configuracoes');
    expect(useConfiguracoes.getState().config).toEqual({
      desconto_maximo: '20',
    });
    expect(useConfiguracoes.getState().loading).toBe(false);
  });

  it('stops loading even when the request fails', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('network error'));

    await useConfiguracoes.getState().fetchConfiguracoes();

    expect(useConfiguracoes.getState().loading).toBe(false);
    expect(useConfiguracoes.getState().config).toEqual({});
  });

  it('updates a single config key locally after the PUT succeeds', async () => {
    useConfiguracoes.setState({ config: { a: '1', b: '2' } });
    vi.mocked(api.put).mockResolvedValue(undefined);

    await useConfiguracoes.getState().atualizarConfiguracao('b', '99');

    expect(api.put).toHaveBeenCalledWith('/configuracoes/b', { valor: '99' });
    expect(useConfiguracoes.getState().config).toEqual({ a: '1', b: '99' });
  });
});
