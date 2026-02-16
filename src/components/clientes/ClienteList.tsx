import { useNavigate } from 'react-router-dom';
import type { Cliente } from '../../types';
import { Table } from '../ui/Table';
import { formatPhone, formatCpfCnpj, formatDate } from '../../lib/formatters';

interface ClienteListProps {
  clientes: Cliente[];
}

export function ClienteList({ clientes }: ClienteListProps) {
  const navigate = useNavigate();

  const columns = [
    {
      key: 'nome',
      header: 'Nome',
      render: (c: Cliente) => <span className="font-medium text-gray-900">{c.nome}</span>,
    },
    {
      key: 'cpfCnpj',
      header: 'CPF/CNPJ',
      render: (c: Cliente) => formatCpfCnpj(c.cpfCnpj),
    },
    {
      key: 'telefone',
      header: 'Telefone',
      render: (c: Cliente) => formatPhone(c.telefone),
    },
    {
      key: 'email',
      header: 'E-mail',
      render: (c: Cliente) => c.email,
      className: 'hidden md:table-cell',
    },
    {
      key: 'dataCadastro',
      header: 'Cadastro',
      render: (c: Cliente) => formatDate(c.dataCadastro),
      className: 'hidden lg:table-cell',
    },
  ];

  return (
    <Table
      columns={columns}
      data={clientes}
      keyExtractor={(c) => c.id}
      onRowClick={(c) => navigate(`/clientes/${c.id}`)}
      emptyMessage="Nenhum cliente encontrado"
    />
  );
}
